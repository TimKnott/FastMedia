/** Task-specific ChatGPT links built from ONE selected record's facts. Links only; nothing is sent. */
import { chatGptUrl } from '@/lib/prospectLinks';

export type AiTask = 'analyse' | 'draft' | 'research' | 'next' | 'voice';
export type AiRecordKind = 'prospect' | 'opportunity';

const GUARD =
  'Rules: use only the facts below. Clearly label every assumption and list unknowns. Do not invent facts, contacts, prices or results. Do not assume purchase intent or that I may send marketing email; flag what must be verified first.';

export const AI_TASKS: Record<AiTask, { label: string; tip: (k: AiRecordKind) => string; intro: (k: AiRecordKind) => string }> = {
  analyse: {
    label: 'Analyse',
    tip: (k) => `Open ChatGPT to assess fit and risks for this ${k}`,
    intro: (k) => `I run FastMedia.Pro, a Czech-based web-development agency working in British English. Analyse this ${k}: fit with our services, strengths, risks and confidence.`,
  },
  draft: {
    label: 'Draft',
    tip: (k) => (k === 'prospect' ? 'Draft a first outreach email for your review (nothing is sent)' : 'Draft a proposal outline for your review (nothing is sent)'),
    intro: (k) =>
      k === 'prospect'
        ? 'I run FastMedia.Pro, a web-design agency. Draft a short, polite, personalised first outreach email in the prospect\'s language, then give an English explanation. Flag anything to check before contacting them, including whether I have a lawful basis to send marketing email.'
        : 'I run FastMedia.Pro, a web-development agency. Draft a concise proposal outline (scope, deliverables, timeline, assumptions) for this opportunity. Check any pricing logic below.',
  },
  research: {
    label: 'Verify',
    tip: () => 'Plan how to verify the source and any buyer intent',
    intro: (k) => `Help me verify this ${k}: list what to check on the source, whether any stated need is current and genuine, and how to confirm the public contact route. Distinguish observed evidence from hypotheses.`,
  },
  next: {
    label: 'Next steps',
    tip: () => 'Suggest prioritised next steps',
    intro: (k) => `Suggest 3–5 prioritised, practical next steps for this ${k}, each with why and what evidence it depends on. Include "do nothing yet" if evidence is weak.`,
  },
  voice: {
    label: 'Voice',
    tip: () => 'Open ChatGPT with a voice-friendly prompt; start voice mode yourself in ChatGPT',
    intro: (k) => `I want to talk this ${k} through in a voice conversation. Keep replies short and spoken-style, ask me one question at a time, and start by summarising the record in two sentences.`,
  },
};

export const aiTaskUrl = (task: AiTask, kind: AiRecordKind, facts: Record<string, unknown>) =>
  chatGptUrl(`${AI_TASKS[task].intro(kind)}\n\n${GUARD}`, facts);
