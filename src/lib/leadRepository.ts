import Papa from 'papaparse';
import type { Database } from '@/integrations/supabase/types';

export type RepositoryLead = Database['public']['Tables']['lead_repository_leads']['Row'];
export type RepositoryEmail = Database['public']['Tables']['lead_repository_emails']['Row'];
export type ImportKind = 'leads' | 'emails' | 'compliance_review';
export function parseRepositoryCsv(text: string): Record<string, string>[] {
  const parsed = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ''), { header: true, skipEmptyLines: 'greedy' });
  if (parsed.errors.length) throw new Error(parsed.errors.map(e => `Row ${Number(e.row ?? 0) + 2}: ${e.message}`).join('; '));
  const fields = parsed.meta.fields ?? [];
  if (!fields.includes('lead_key')) throw new Error('Required column: lead_key. No rows were imported.');
  if (fields.some(f => !f.trim()) || new Set(fields).size !== fields.length || Object.keys(parsed.meta.renamedHeaders ?? {}).length) throw new Error('Empty or duplicate column headers; no rows imported.');
  return parsed.data;
}
export const normalizeRepositoryEmail = (email: string) => email.trim().toLowerCase();
export const repositorySendingEnabled = false;

export const reviewFields = [
  'country','purpose','data_source_url','collection_date','lia','legal_review','permission_evidence',
  'consent_source','consent_at','consent_scope','controller','national_eprivacy_assessment',
  'notice_at','notice_route','reviewer_notes',
] as const;
export function sourceRecords(value: unknown): { file: string; kind: string; row: Record<string, unknown> }[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is { file: string; kind: string; row: Record<string, unknown> } => !!v && typeof v === 'object' && 'row' in v);
}