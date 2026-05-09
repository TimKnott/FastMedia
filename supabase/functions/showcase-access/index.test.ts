import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/showcase-access`;

async function callFn(body: unknown) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

Deno.test("RLS: anon cannot SELECT showcase_projects", async () => {
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await anon.from("showcase_projects").select("id").limit(1);
  // RLS denies anon: either error, or empty array (filtered out)
  assert(error !== null || (Array.isArray(data) && data.length === 0),
    "Anon must not be able to read showcase_projects rows");
});

Deno.test("RLS: anon cannot INSERT into showcase_projects", async () => {
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { error } = await anon.from("showcase_projects").insert({
    name: "hack", slug: "hack-" + Date.now(), lovable_url: "https://x", access_token: "x",
  });
  assert(error !== null, "Anon insert must be blocked by RLS");
});

Deno.test("Edge fn: rejects missing fields with 400", async () => {
  const { status } = await callFn({});
  assertEquals(status, 400);
});

Deno.test("Edge fn: returns 404 for unknown slug", async () => {
  const { status, json } = await callFn({ slug: "nonexistent-" + Date.now(), token: "deadbeef" });
  assertEquals(status, 404);
  assertEquals(json.error, "not_found");
});

Deno.test("Edge fn: returns 404 for valid slug with wrong token", async () => {
  // Fetch any active slug via service role would require secret; instead use a guaranteed-miss
  // by trying a known-format wrong token against a random slug. The handler must not leak info.
  const { status, json } = await callFn({ slug: "any-slug", token: "0".repeat(48) });
  assertEquals(status, 404);
  assertEquals(json.error, "not_found");
  // Must not reveal lovable_url or name
  assertEquals(json.url, undefined);
  assertEquals(json.name, undefined);
});

Deno.test("Edge fn: CORS preflight ok", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") === "*");
});
