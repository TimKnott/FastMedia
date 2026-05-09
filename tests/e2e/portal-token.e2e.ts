/**
 * E2E test: portal token validation + draft-agreement rendering.
 *
 * - Creates a fresh client_projects row + project_access_tokens row via psql
 *   (so we don't depend on RLS or the service role key being in the bundle).
 * - Calls the deployed `portal-access` edge function over HTTP with the anon
 *   key, just like the browser portal does.
 * - Verifies token gating (missing / unknown / revoked / expired all rejected)
 *   and that a valid token returns the project fields needed to render the
 *   draft agreement view (status=draft, agreement_template, agreement_terms,
 *   agreement_acknowledged_at=null) and a notes array.
 * - The email side-effect path (`resend_draft`) is intentionally NOT exercised:
 *   we stub it out by only testing `load` + `acknowledge_agreement`, so no
 *   real email is sent during the run.
 *
 * Run with:  bun run tests/e2e/portal-token.e2e.ts
 */

import { execSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('VITE_SUPABASE_URL missing');
if (!ANON_KEY) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY missing');
if (!process.env.PGHOST) throw new Error('PGHOST missing — psql access required');

const FN_URL = `${SUPABASE_URL}/functions/v1/portal-access`;

type Json = Record<string, unknown> & { ok?: boolean; error?: string };

interface TestResult { name: string; ok: boolean; err?: string }
const results: TestResult[] = [];

async function it(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    results.push({ name, ok: false, err });
    console.log(`✗ ${name}\n    ${err}`);
  }
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}
function eq<T>(actual: T, expected: T, msg: string) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function sql(query: string): string {
  return execSync(`psql -At -c ${JSON.stringify(query)}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

async function callPortal(body: Record<string, unknown>): Promise<{ status: number; json: Json }> {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY!,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: Json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* keep empty */ }
  return { status: res.status, json };
}

interface Fixture { projectId: string; tokenId: string; token: string; email: string }

function createFixture(): Fixture {
  const stamp = Date.now();
  const email = `portal-e2e+${stamp}-${randomUUID().slice(0, 8)}@fastmedia.pro`;
  const token = randomBytes(32).toString('hex');
  const name = `Portal E2E ${stamp}`;
  const terms = 'Draft terms for automated portal token validation test.';

  const projectId = sql(
    `insert into public.client_projects
       (name, client_name, status, agreement_template, agreement_terms, currency, dev_fee, hosting_fee_yearly)
     values
       ('${name}', 'Portal Test Client', 'draft', 'default',
        '${terms}', 'CZK', 50000, 12000)
     returning id`,
  );
  assert(projectId, 'failed to insert client_projects');

  const expiresAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();
  const tokenId = sql(
    `insert into public.project_access_tokens (project_id, email, token, expires_at)
     values ('${projectId}', '${email}', '${token}', '${expiresAt}')
     returning id`,
  );
  assert(tokenId, 'failed to insert project_access_tokens');

  return { projectId, tokenId, token, email };
}

function cleanup(f: Fixture) {
  try {
    sql(`delete from public.project_audit_log where project_id = '${f.projectId}'`);
    sql(`delete from public.project_access_tokens where project_id = '${f.projectId}'`);
    sql(`delete from public.client_projects where id = '${f.projectId}'`);
  } catch (e) {
    console.warn('cleanup warning:', (e as Error).message);
  }
}

// ---- Tests ----------------------------------------------------------------

await it('rejects request without action/token', async () => {
  const r = await callPortal({ action: 'load' });
  eq(r.status, 400, 'status');
  eq(r.json.error, 'action and token required', 'error');
});

await it('rejects unknown / malformed token', async () => {
  const r = await callPortal({ action: 'load', token: 'not-a-real-token' });
  eq(r.status, 401, 'status');
  eq(r.json.error, 'invalid_or_expired', 'error');
});

await it('valid token returns project + draft agreement data', async () => {
  const f = createFixture();
  try {
    const r = await callPortal({ action: 'load', token: f.token });
    eq(r.status, 200, 'status');
    assert(r.json.ok === true, 'response.ok');
    const proj = (r.json as any).project;
    assert(proj, 'project missing');
    eq(proj.id, f.projectId, 'project.id');
    eq((r.json as any).client_email, f.email, 'client_email');
    eq(proj.status, 'draft', 'project.status');
    eq(proj.agreement_template, 'default', 'agreement_template');
    assert(
      typeof proj.agreement_terms === 'string' && proj.agreement_terms.length > 0,
      'agreement_terms populated',
    );
    eq(proj.agreement_acknowledged_at, null, 'not yet acknowledged');
    assert(Array.isArray((r.json as any).notes), 'notes array');
  } finally {
    cleanup(f);
  }
});

await it('revoked token is rejected (no email side-effects)', async () => {
  const f = createFixture();
  try {
    sql(`update public.project_access_tokens
         set revoked_at = now() where id = '${f.tokenId}'`);
    const r = await callPortal({ action: 'load', token: f.token });
    eq(r.status, 401, 'status');
    eq(r.json.error, 'invalid_or_expired', 'error');
  } finally {
    cleanup(f);
  }
});

await it('expired token is rejected', async () => {
  const f = createFixture();
  try {
    sql(`update public.project_access_tokens
         set expires_at = now() - interval '1 minute' where id = '${f.tokenId}'`);
    const r = await callPortal({ action: 'load', token: f.token });
    eq(r.status, 401, 'status');
    eq(r.json.error, 'invalid_or_expired', 'error');
  } finally {
    cleanup(f);
  }
});

await it('acknowledge_agreement updates draft state (no email)', async () => {
  const f = createFixture();
  try {
    const ack = await callPortal({ action: 'acknowledge_agreement', token: f.token });
    eq(ack.status, 200, 'ack status');
    assert(ack.json.ok === true, 'ack ok');

    const ackedAt = sql(
      `select agreement_acknowledged_at from public.client_projects where id = '${f.projectId}'`,
    );
    assert(ackedAt && ackedAt !== '', 'agreement_acknowledged_at written');

    const reload = await callPortal({ action: 'load', token: f.token });
    eq(reload.status, 200, 'reload status');
    assert(
      (reload.json as any).project?.agreement_acknowledged_at,
      'reload reflects acknowledgement',
    );
  } finally {
    cleanup(f);
  }
});

// ---- Summary --------------------------------------------------------------

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  console.error('\nFailures:');
  for (const f of failed) console.error(`  - ${f.name}: ${f.err}`);
  process.exit(1);
}
