// E2E test: verifies portal token validation and draft-agreement rendering
// against the deployed `portal-access` edge function. Email delivery is NOT
// exercised here — we hit the `load` action (which is what the portal calls
// to render the draft agreement view) and assert that token gating + project
// fields needed to render the draft agreement come back correctly. The
// `resend_draft` path is intentionally skipped so no real email is sent.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ??
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

assert(SUPABASE_URL, "SUPABASE_URL missing");
assert(SERVICE_ROLE, "SUPABASE_SERVICE_ROLE_KEY missing");
assert(ANON_KEY, "SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY missing");

const FN_URL = `${SUPABASE_URL}/functions/v1/portal-access`;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

async function callPortal(body: Record<string, unknown>) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }
  return { status: res.status, json, raw: text };
}

function randomHexToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Fixture {
  projectId: string;
  tokenId: string;
  token: string;
  email: string;
}

async function createFixture(): Promise<Fixture> {
  const stamp = Date.now();
  const email = `portal-test+${stamp}@fastmedia.pro`;

  const { data: project, error: pErr } = await admin
    .from("client_projects")
    .insert({
      name: `Portal Test ${stamp}`,
      client_name: "Portal Test Client",
      status: "draft",
      agreement_template: "default",
      agreement_terms:
        "Draft terms for automated portal token validation test.",
      currency: "CZK",
      dev_fee: 50000,
      hosting_fee_yearly: 12000,
    })
    .select("id")
    .single();
  if (pErr || !project) throw pErr ?? new Error("project insert failed");

  const token = randomHexToken();
  const { data: tok, error: tErr } = await admin
    .from("project_access_tokens")
    .insert({
      project_id: project.id,
      email,
      token,
      expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
    })
    .select("id")
    .single();
  if (tErr || !tok) throw tErr ?? new Error("token insert failed");

  return { projectId: project.id, tokenId: tok.id, token, email };
}

async function cleanup(f: Fixture) {
  await admin.from("project_audit_log").delete().eq("project_id", f.projectId);
  await admin
    .from("project_access_tokens")
    .delete()
    .eq("project_id", f.projectId);
  await admin.from("client_projects").delete().eq("id", f.projectId);
}

Deno.test(
  "portal-access: rejects missing token",
  async () => {
    const r = await callPortal({ action: "load" });
    assertEquals(r.status, 400);
    assertEquals(r.json?.error, "action and token required");
  },
);

Deno.test(
  "portal-access: rejects unknown / malformed token",
  async () => {
    const r = await callPortal({ action: "load", token: "not-a-real-token" });
    assertEquals(r.status, 401);
    assertEquals(r.json?.error, "invalid_or_expired");
  },
);

Deno.test(
  "portal-access: load returns project + draft agreement data for valid token",
  async () => {
    const f = await createFixture();
    try {
      const r = await callPortal({ action: "load", token: f.token });
      assertEquals(r.status, 200);
      assert(r.json?.ok === true, `expected ok=true, got ${r.raw}`);
      assertExists(r.json.project, "project missing in response");
      assertEquals(r.json.project.id, f.projectId);
      assertEquals(r.json.client_email, f.email);
      // Draft-agreement render requirements:
      assertEquals(r.json.project.status, "draft");
      assertEquals(r.json.project.agreement_template, "default");
      assert(
        typeof r.json.project.agreement_terms === "string" &&
          r.json.project.agreement_terms.length > 0,
        "agreement_terms should be populated for draft view",
      );
      assertEquals(r.json.project.agreement_acknowledged_at, null);
      assert(Array.isArray(r.json.notes), "notes should be an array");
    } finally {
      await cleanup(f);
    }
  },
);

Deno.test(
  "portal-access: revoked token is rejected (no email side effects)",
  async () => {
    const f = await createFixture();
    try {
      await admin
        .from("project_access_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", f.tokenId);

      const r = await callPortal({ action: "load", token: f.token });
      assertEquals(r.status, 401);
      assertEquals(r.json?.error, "invalid_or_expired");
    } finally {
      await cleanup(f);
    }
  },
);

Deno.test(
  "portal-access: expired token is rejected",
  async () => {
    const f = await createFixture();
    try {
      await admin
        .from("project_access_tokens")
        .update({
          expires_at: new Date(Date.now() - 60_000).toISOString(),
        })
        .eq("id", f.tokenId);

      const r = await callPortal({ action: "load", token: f.token });
      assertEquals(r.status, 401);
      assertEquals(r.json?.error, "invalid_or_expired");
    } finally {
      await cleanup(f);
    }
  },
);

Deno.test(
  "portal-access: acknowledge_agreement updates draft state (no email)",
  async () => {
    const f = await createFixture();
    try {
      const r = await callPortal({
        action: "acknowledge_agreement",
        token: f.token,
      });
      assertEquals(r.status, 200);
      assert(r.json?.ok === true);

      const { data: p } = await admin
        .from("client_projects")
        .select("agreement_acknowledged_at")
        .eq("id", f.projectId)
        .single();
      assertExists(p?.agreement_acknowledged_at);

      // Re-loading should now reflect the acknowledgement timestamp.
      const r2 = await callPortal({ action: "load", token: f.token });
      assertEquals(r2.status, 200);
      assertExists(r2.json?.project?.agreement_acknowledged_at);
    } finally {
      await cleanup(f);
    }
  },
);
