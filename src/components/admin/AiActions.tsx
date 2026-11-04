import { Sparkles, PenLine, SearchCheck, ListChecks, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AI_TASKS, aiTaskUrl, type AiRecordKind, type AiTask } from '@/lib/aiActions';
import { cn } from '@/lib/utils';

const ICONS: Record<AiTask, typeof Sparkles> = { analyse: Sparkles, draft: PenLine, research: SearchCheck, next: ListChecks, voice: Mic };
const ORDER: AiTask[] = ['analyse', 'draft', 'research', 'next', 'voice'];

/** Consistent "Ask AI" row for a single record. Opens ChatGPT in a new tab; never sends anything. */
export default function AiActions({ kind, name, facts, className }: { kind: AiRecordKind; name: string; facts: Record<string, unknown>; className?: string }) {
  return (
    <div role="group" aria-label={`AI assistant for ${name}`} className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="mr-1 text-xs font-medium text-muted-foreground">Ask AI</span>
      {ORDER.map((t) => {
        const Icon = ICONS[t];
        const label = t === 'draft' ? (kind === 'prospect' ? 'Draft email' : 'Draft proposal') : AI_TASKS[t].label;
        return (
          <Button key={t} asChild size="sm" variant={t === 'analyse' ? 'default' : 'outline'} className="h-7 gap-1 px-2 text-xs">
            <a href={aiTaskUrl(t, kind, facts)} target="_blank" rel="noopener noreferrer" title={AI_TASKS[t].tip(kind)} aria-label={`${label}: ${AI_TASKS[t].tip(kind)} for ${name} (opens ChatGPT in a new tab)`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}
