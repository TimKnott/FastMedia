import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseRepositoryCsv, normalizeRepositoryEmail } from '@/lib/leadRepository';
import { suppressionGate } from '../../supabase/functions/_shared/suppression-gate';
const migration = readFileSync('drizzle/migrations/0011_lead_repository_protected_review.sql','utf8');
describe('repository import',()=>{
  it('preserves Czech characters and every source field',()=>{
    const rows=parseRepositoryCsv('\uFEFFlead_key,person_name,company,extra\r\nk1,Jiří Šťastný,"Česká, s.r.o.","line 1\nline 2"');
    expect(rows).toEqual([{lead_key:'k1',person_name:'Jiří Šťastný',company:'Česká, s.r.o.',extra:'line 1\nline 2'}]);
  });
  it('rejects duplicate headers rather than silently dropping fields',()=>expect(()=>parseRepositoryCsv('lead_key,email,email\nx,a,b')).toThrow());
  it('rejects missing stable keys',()=>expect(()=>parseRepositoryCsv('name,email\nx,a@b.cz')).toThrow('lead_key'));
  it('normalizes email case and whitespace',()=>expect(normalizeRepositoryEmail(' OWNER@EXAMPLE.CZ ')).toBe('owner@example.cz'));
});
describe('repository database enforcement',()=>{
  it('enforces HOLD regardless of imported validation',()=>expect(migration).toContain("CHECK (campaign_status='HOLD')"));
  it('enforces dry-run campaigns',()=>expect(migration).toContain("CHECK(status='DRY_RUN')"));
  it('cannot record a real send timestamp',()=>expect(migration).toContain('CHECK(sent_at IS NULL)'));
  it('deduplicates stable lead keys',()=>expect(migration).toContain('lead_key text NOT NULL UNIQUE'));
  it('deduplicates normalized addresses per lead',()=>expect(migration).toContain('UNIQUE(lead_id,email)'));
  it('requires Czech consent/customer permission rather than legitimate interests alone',()=>expect(migration).toContain("NOT IN ('prior_consent','existing_customer_exception')"));
  it('writes objections to the operational global list',()=>expect(migration).toContain('INSERT INTO public.suppressed_emails(email,reason,metadata)'));
});
describe('shared marketing suppression',()=>{
  it('blocks suppressed recipients',()=>expect(suppressionGate(true,false)).toEqual({blocked:true,reason:'globally_suppressed'}));
  it('fails closed on a failed suppression lookup',()=>expect(suppressionGate(false,true)).toEqual({blocked:true,reason:'suppression_check_failed'}));
  it('permits the suppression stage only when a lookup succeeded and no objection exists',()=>expect(suppressionGate(false,false)).toEqual({blocked:false,reason:null}));
});