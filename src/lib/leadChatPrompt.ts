type LeadFacts = { name: string; category?: string | null; website?: string | null; address?: string | null; distance_note?: string | null; why_fit?: string | null; source_url?: string | null };
type Profile = { name: string; description?: string | null; lead_brief?: string | null } | undefined;
type Criteria = { industry: string; location: string; radius: number; extra: string };

/** Prompt built only from facts shown on screen. Asks for assessment, never claims access to private records. */
export function leadChatPrompt(l: LeadFacts, p: Profile, c: Criteria): string {
  const v = (x?: string | null) => (x && x.trim()) || 'unknown';
  return [
    'I am researching a possible business prospect. Use only the facts below plus public information you can verify; say clearly what is unknown. Do not invent details.',
    `Prospecting for (customer): ${v(p?.name)} — ${v(p?.description)}`,
    `Who the customer wants to find: ${v(p?.lead_brief)}`,
    `Search criteria: ${v(c.industry)} near ${v(c.location)}, ${c.radius} km${c.extra.trim() ? `; notes: ${c.extra.trim()}` : ''}`,
    `Lead: ${l.name}; category: ${v(l.category)}; website: ${v(l.website)}; address: ${v(l.address)}; distance: ${v(l.distance_note)}`,
    `Why it may fit: ${v(l.why_fit)}`,
    `Source: ${v(l.source_url)}`,
    '1) Assess how relevant this lead is to the customer and why. 2) Suggest a suitable, respectful first-contact approach (channel and angle) that respects applicable marketing and privacy law. I will review and decide; nothing will be sent automatically.',
  ].join('\n');
}
