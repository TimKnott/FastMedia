// Campaign Studio: ordered stages, tool mapping and hand-off helpers.
// Each tool either lives inside the studio (internal) or reuses an existing admin page.

export type StageKey = 'plan' | 'find' | 'create' | 'send' | 'track';

export interface StudioTool {
  code: string; // e.g. "1A"
  name: string;
  description: string;
  /** Existing admin route reused for this step, or a studio tab (#tab). */
  to: string;
  minRole: 'admin' | 'super_admin';
  /** What this tool receives from the campaign brief. */
  receives: string[];
}

export interface StudioStage {
  number: number;
  key: StageKey;
  title: string;
  /** Literal token classes so Tailwind keeps them. */
  bg: string;
  text: string;
  border: string;
  tools: StudioTool[];
}

export const STUDIO_STAGES: StudioStage[] = [
  {
    number: 1, key: 'plan', title: 'PLAN',
    bg: 'bg-stage-plan', text: 'text-stage-plan', border: 'border-stage-plan',
    tools: [
      { code: '1A', name: 'Campaign Planner', description: 'Objective, audience, offer, CTA and destination for one campaign.', to: '#brief', minRole: 'admin', receives: [] },
      { code: '1B', name: 'Audience & Industry Finder', description: 'Search demand, competitors and confirmed facts for the target audience.', to: '/admin/geo', minRole: 'admin', receives: ['audience', 'industry'] },
    ],
  },
  {
    number: 2, key: 'find', title: 'FIND',
    bg: 'bg-stage-find', text: 'text-stage-find', border: 'border-stage-find',
    tools: [
      { code: '2A', name: 'Lead Finder', description: 'Public-source business search per site profile.', to: '/admin/finder', minRole: 'admin', receives: ['audience', 'industry', 'offer'] },
      { code: '2B', name: 'Lead Qualifier & CRM', description: 'Score, prioritise and sync qualified leads (Flowlu).', to: '/admin/leads-hub', minRole: 'admin', receives: ['campaign'] },
      { code: '2C', name: 'Partner Manager', description: 'Referral partners, partner finder, referrals and commissions.', to: '/admin/partners', minRole: 'admin', receives: ['campaign'] },
    ],
  },
  {
    number: 3, key: 'create', title: 'CREATE',
    bg: 'bg-stage-create', text: 'text-stage-create', border: 'border-stage-create',
    tools: [
      { code: '3A', name: 'Campaign Copywriter', description: 'Platform adverts plus compliance pre-check.', to: '/admin/ad-studio', minRole: 'super_admin', receives: ['offer', 'cta', 'destination'] },
      { code: '3B', name: 'Hero & Creative Studio', description: 'Video, overlays and hero images for the campaign.', to: '/admin/video-studio', minRole: 'admin', receives: ['offer', 'hero'] },
      { code: '3C', name: 'Email & Social Content Builder', description: 'Drafts that inherit copy, hero image, CTA and URL.', to: '#drafts', minRole: 'admin', receives: ['copy', 'hero', 'cta', 'destination'] },
    ],
  },
  {
    number: 4, key: 'send', title: 'SEND & PUBLISH',
    bg: 'bg-stage-send', text: 'text-stage-send', border: 'border-stage-send',
    tools: [
      { code: '4A', name: 'Email Campaign Manager', description: 'Approved email drafts go out through Vbout lists with opt-out handling.', to: '/admin/vbout', minRole: 'admin', receives: ['approved email drafts'] },
      { code: '4B', name: 'Social Media Publisher', description: 'Approved social drafts — copy and post manually; no publishing integration connected.', to: '#drafts', minRole: 'admin', receives: ['approved social drafts'] },
      { code: '4C', name: 'Direct Outreach', description: 'Reviewed one-to-one openers and follow-ups.', to: '/admin/prospecting', minRole: 'admin', receives: ['qualified leads', 'copy'] },
    ],
  },
  {
    number: 5, key: 'track', title: 'TRACK & IMPROVE',
    bg: 'bg-stage-track', text: 'text-stage-track', border: 'border-stage-track',
    tools: [
      { code: '5A', name: 'Campaign Analytics', description: 'Sends, replies, conversions and referral revenue per campaign.', to: '#analytics', minRole: 'admin', receives: ['outcomes'] },
      { code: '5B', name: 'Follow-up & Optimisation', description: 'Pipeline follow-ups and next actions.', to: '/admin/pipeline', minRole: 'admin', receives: ['replies'] },
    ],
  },
];

export const ALL_TOOLS = STUDIO_STAGES.flatMap((s) => s.tools);

export interface CampaignBrief {
  id: string;
  name: string;
  objective?: string | null;
  audience?: string | null;
  industry?: string | null;
  offer?: string | null;
  cta?: string | null;
  destination_url?: string | null;
  hero_image_url?: string | null;
}

/** Build the link for a tool, carrying the campaign context. Studio tabs stay in-page. */
export function toolHref(tool: StudioTool, campaign?: CampaignBrief | null): string {
  if (tool.to.startsWith('#')) return tool.to;
  if (!campaign) return tool.to;
  const params = new URLSearchParams({ campaign: campaign.id });
  if (campaign.industry) params.set('industry', campaign.industry);
  if (campaign.audience) params.set('audience', campaign.audience);
  return `${tool.to}${tool.to.includes('?') ? '&' : '?'}${params.toString()}`;
}

/** Plain-text brief for pasting into tools that do not read the campaign yet. */
export function briefText(c: CampaignBrief): string {
  return [
    `Campaign: ${c.name}`,
    c.objective && `Objective: ${c.objective}`,
    c.audience && `Audience: ${c.audience}`,
    c.industry && `Industry: ${c.industry}`,
    c.offer && `Offer: ${c.offer}`,
    c.cta && `CTA: ${c.cta}`,
    c.destination_url && `Destination: ${c.destination_url}`,
  ].filter(Boolean).join('\n');
}

/** New draft inherits campaign creative so email/social stay consistent. */
export function draftFromCampaign(c: CampaignBrief & { copy?: Record<string, string> }, channel: string) {
  const headline = c.copy?.headline ?? c.offer ?? '';
  const body = c.copy?.body ?? '';
  return {
    campaign_id: c.id,
    channel,
    subject: channel === 'email' ? headline || c.name : null,
    body: [headline, body, c.cta && c.destination_url ? `${c.cta}: ${c.destination_url}` : ''].filter(Boolean).join('\n\n'),
    image_url: c.hero_image_url ?? null,
    cta: c.cta ?? null,
    destination_url: c.destination_url ?? null,
    status: 'draft' as const,
  };
}

/** Status a draft may move to. External send/publish requires prior approval. */
export function canTransition(from: string, to: string): boolean {
  const allowed: Record<string, string[]> = {
    draft: ['approved'],
    approved: ['draft', 'sent', 'published', 'failed'],
    failed: ['draft'],
    sent: [],
    published: [],
  };
  return allowed[from]?.includes(to) ?? false;
}

export interface ProgrammeRules {
  commission_type: 'percent' | 'fixed';
  commission_rate_bps: number | null;
  fixed_commission_cents: number | null;
  min_project_value_cents: number;
}

/** Commission in cents, or null when the owner has not configured a rate yet. */
export function calcCommissionCents(rules: ProgrammeRules, projectValueCents: number | null): number | null {
  if (projectValueCents == null || projectValueCents < rules.min_project_value_cents) return null;
  if (rules.commission_type === 'fixed') return rules.fixed_commission_cents ?? null;
  if (rules.commission_rate_bps == null) return null;
  return Math.round((projectValueCents * rules.commission_rate_bps) / 10000);
}

export function referralLink(code: string, origin = 'https://www.fastmedia.pro'): string {
  return `${origin}/partners?ref=${encodeURIComponent(code)}`;
}

export function stageProgress(status: string): number {
  const order = ['planning', 'finding', 'creating', 'sending', 'tracking', 'done'];
  const i = order.indexOf(status);
  return i < 0 ? 0 : Math.round((i / (order.length - 1)) * 100);
}
