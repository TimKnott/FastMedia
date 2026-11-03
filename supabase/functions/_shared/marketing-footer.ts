import { normaliseEmail, UNSUBSCRIBE_PATH } from './legal-eligibility.ts';

// deno-lint-ignore no-explicit-any
type Db = any;

/** Reuses the recipient's unused token or mints one. Errors propagate so the send is held. */
export async function unsubscribeUrlFor(db: Db, email: string): Promise<string> {
  const addr = normaliseEmail(email);
  const base = Deno.env.get('SUPABASE_URL');
  if (!base) throw new Error('unsubscribe_base_missing');
  const { data: existing, error } = await db.from('email_unsubscribe_tokens').select('token').eq('email', addr).is('used_at', null).limit(1).maybeSingle();
  if (error) throw new Error('unsubscribe_token_lookup_failed');
  let token = existing?.token as string | undefined;
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const { error: insErr } = await db.from('email_unsubscribe_tokens').insert({ email: addr, token });
    if (insErr) throw new Error('unsubscribe_token_create_failed');
  }
  return `${base}${UNSUBSCRIBE_PATH}?token=${token}`;
}

export function marketingFooter(language: string, url: string) {
  const cs = language === 'cs';
  const id = 'FastMedia.Pro · Timothy Knott, IČO 17308551 · Louny 440 01, ' + (cs ? 'Ústecký kraj' : 'Czech Republic');
  const label = cs ? 'Odhlásit odběr' : 'Unsubscribe';
  const lead = cs ? 'Nechcete další zprávy?' : 'Prefer no further emails?';
  return {
    html: `${id}. ${lead} <a href="${url}">${label}</a>`,
    text: `${id}. ${lead} ${label}: ${url}`,
    headers: { 'List-Unsubscribe': `<${url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
