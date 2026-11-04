import { useState, type ReactNode } from 'react';
import { Info, HelpCircle, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * Reusable admin help pattern:
 *  - <InfoTip> small circular info icon; shows on hover AND keyboard focus.
 *  - <HelpLabel> label + InfoTip for a form field.
 *  - <HowToUse> dismissible "How to use this tool" panel (remembered per tool, easy to reopen).
 */
export const InfoTip = ({ text, label }: { text: ReactNode; label: string }) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <button type="button" aria-label={`Help: ${label}`} className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Info className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs text-xs leading-relaxed">{text}</TooltipContent>
  </Tooltip>
);

export const HelpLabel = ({ htmlFor, children, help }: { htmlFor?: string; children: string; help: ReactNode }) => (
  <div className="flex items-center gap-1.5"><Label htmlFor={htmlFor}>{children}</Label><InfoTip label={children} text={help} /></div>
);

export const HowToUse = ({ toolKey, title = 'How to use this tool', children }: { toolKey: string; title?: string; children: ReactNode }) => {
  const key = `admin-help-hidden:${toolKey}`;
  const [open, setOpen] = useState(() => typeof window === 'undefined' || localStorage.getItem(key) !== '1');
  const set = (v: boolean) => { setOpen(v); try { v ? localStorage.removeItem(key) : localStorage.setItem(key, '1'); } catch { /* ignore */ } };
  if (!open) return <Button variant="outline" size="sm" onClick={() => set(true)}><HelpCircle className="mr-1 h-4 w-4" />{title}</Button>;
  return (
    <section aria-label={title} className="relative rounded-lg border border-border bg-muted/40 p-4 text-sm">
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7" aria-label="Hide help" onClick={() => set(false)}><X className="h-4 w-4" /></Button>
      <p className="mb-2 flex items-center gap-1.5 font-semibold"><HelpCircle className="h-4 w-4" />{title}</p>
      {children}
    </section>
  );
};
