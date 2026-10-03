import { useState, useRef, useEffect } from 'react';
import { Send, Lightbulb, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import type { CalculatorFeature } from '@/data/calculatorFeatures';

type Msg = { role: 'visitor' | 'advisor'; content: string };
type Result = { summary: string; suggested_min: number; suggested_max: number; covered_by: string[] };

interface ModuleAdvisorProps {
  trade: string;
  selectedModules: string[];
  modules: CalculatorFeature[];
  ideaPrompts: string[];
  contactName?: string;
  contactEmail?: string;
  isSelected: (id: string) => boolean;
  onToggleModule: (id: string) => void;
  onSummary: (summary: string) => void;
}

const fmt = (n: number) => n.toLocaleString('en-GB');

/** Short conversation that works out what a visitor needs when it isn't in the module list. */
const ModuleAdvisor = ({ trade, selectedModules, modules, ideaPrompts, contactName, contactEmail, isSelected, onToggleModule, onSummary }: ModuleAdvisorProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'visitor' as const, content }];
    setMessages(next); setInput(''); setError(''); setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('module-advisor', {
        body: {
          trade, selected_modules: selectedModules, messages: next,
          catalog: modules.map(m => ({ id: m.id, name: m.nameEn, price: m.oneTimePrice })),
          contact_name: contactName || undefined, contact_email: contactEmail || undefined,
        },
      });
      if (fnError || !data?.ok) {
        let msg = data?.error as string | undefined;
        try { msg = msg ?? (await (fnError as { context?: Response })?.context?.json())?.error; } catch { /* ignore */ }
        throw new Error(msg || 'The assistant is unavailable right now.');
      }
      if (data.done) {
        setResult({ summary: data.summary, suggested_min: data.suggested_min, suggested_max: data.suggested_max, covered_by: data.covered_by ?? [] });
        onSummary(data.summary);
      } else {
        setMessages([...next, { role: 'advisor', content: data.question }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setMessages(messages);
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setMessages([]); setResult(null); setError(''); setInput(''); onSummary(''); };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Can't find what you need in the list? Describe it here. Our assistant will ask a few quick questions so we understand exactly what you want, then we'll send you a confirmed price.
      </p>

      {messages.length === 0 && ideaPrompts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Ideas to try
          </p>
          <div className="flex flex-wrap gap-2">
            {ideaPrompts.map(p => (
              <button key={p} type="button" onClick={() => setInput(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 max-h-80 overflow-y-auto" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'visitor' ? 'flex justify-end' : 'flex justify-start'}>
              <p className={`max-w-[85%] text-sm rounded-2xl px-4 py-2.5 whitespace-pre-wrap ${m.role === 'visitor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {m.content}
              </p>
            </div>
          ))}
          {loading && <p className="text-xs text-muted-foreground animate-pulse">Thinking…</p>}
          <div ref={endRef} />
        </div>
      )}

      {result ? (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-5 space-y-4">
          <p className="font-semibold text-foreground flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent" /> Thanks — we've got your idea</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{result.summary}</p>
          {result.suggested_max > 0 && (
            <p className="text-sm">
              <span className="font-semibold">Rough estimate: {fmt(result.suggested_min)}–{fmt(result.suggested_max)} CZK</span>
              <span className="text-muted-foreground"> — to be confirmed by FastMedia. It isn't added to your total yet.</span>
            </p>
          )}
          {result.covered_by.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">These modules already cover part of it:</p>
              <div className="flex flex-wrap gap-2">
                {result.covered_by.map(id => {
                  const m = modules.find(x => x.id === id);
                  if (!m) return null;
                  return (
                    <Button key={id} size="sm" variant={isSelected(id) ? 'default' : 'outline'} onClick={() => onToggleModule(id)} className="text-xs">
                      {m.icon} {m.nameEn}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Carry on to the next step. Your idea is sent with your quote, and we'll reply with a confirmed price.</p>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="w-4 h-4 mr-2" /> Suggest another idea</Button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="space-y-3">
          <label htmlFor="module-advisor-input" className="sr-only">Describe your idea</label>
          <Textarea id="module-advisor-input" value={input} onChange={e => setInput(e.target.value)} rows={3}
            placeholder={messages.length ? 'Type your answer…' : 'e.g. I want customers to upload photos of the job so I can quote faster'}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }} />
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" disabled={!input.trim() || loading}>
            <Send className="w-4 h-4 mr-2" /> {loading ? 'Sending…' : messages.length ? 'Send answer' : 'Ask the assistant'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ModuleAdvisor;
