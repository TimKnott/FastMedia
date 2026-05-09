import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, MessageSquarePlus, FileText, Check, Trash2, ExternalLink, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PortalNote {
  id: string;
  page_path: string;
  selector: string | null;
  x_pct: number | null;
  y_pct: number | null;
  viewport_w: number | null;
  viewport_h: number | null;
  message: string;
  color: string;
  status: 'todo' | 'in_progress' | 'done';
  author_type: 'client' | 'admin';
  author_name: string | null;
  created_at: string;
}

interface PortalProject {
  id: string;
  name: string;
  client_name: string;
  staging_url: string;
  status: string;
  brand_color: string;
  agreement_template: string | null;
  agreement_terms: Record<string, unknown>;
  agreement_acknowledged_at: string | null;
}

interface PortalPayload {
  project: PortalProject;
  notes: PortalNote[];
  client_email: string;
  color_palette: string[];
}

const statusLabel: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const ClientPortal = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortalPayload | null>(null);
  const [draftPos, setDraftPos] = useState<{ x: number; y: number; selector: string | null } | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [draftColor, setDraftColor] = useState('#f59e0b');
  const [overlayMode, setOverlayMode] = useState<'view' | 'pin'>('view');
  const [showAgreement, setShowAgreement] = useState(false);
  const [ackLoading, setAckLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const portalUrl = useMemo(() => `${window.location.origin}/portal/${token}`, [token]);

  const callApi = async (action: string, body: Record<string, unknown> = {}) => {
    const { data: res, error } = await supabase.functions.invoke('portal-access', {
      body: { action, token, ...body },
    });
    if (error) throw error;
    if (res?.error) throw new Error(res.error);
    return res;
  };

  const refresh = async () => {
    try {
      const res = await callApi('load');
      setData(res as PortalPayload);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load project');
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Missing access token');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [token]);

  useEffect(() => {
    if (data?.project && !data.project.agreement_acknowledged_at && data.project.agreement_template) {
      setShowAgreement(true);
    }
  }, [data]);

  // Lock the portal (and the embedded marketing site) to British English regardless
  // of any preference the visitor's browser may have stored from a previous visit.
  // Re-applied on every render and via a storage listener so a stale value cannot
  // bleed back in (e.g. another tab writing 'cs' or 'de').
  useEffect(() => {
    const enforce = () => {
      try {
        if (localStorage.getItem('fastmedia-language') !== 'en') {
          localStorage.setItem('fastmedia-language', 'en');
        }
        document.documentElement.setAttribute('lang', 'en-GB');
      } catch {
        /* ignore storage errors */
      }
    };
    enforce();
    window.addEventListener('storage', enforce);
    const interval = window.setInterval(enforce, 2000);
    return () => {
      window.removeEventListener('storage', enforce);
      window.clearInterval(interval);
    };
  }, []);

  // Always append ?lang=en to the iframe URL so the marketing site picks up
  // English even on its first paint.
  const iframeSrc = useMemo(() => {
    const raw = data?.project?.staging_url || '';
    if (!raw) return '';
    try {
      const u = new URL(raw);
      u.searchParams.set('lang', 'en');
      return u.toString();
    } catch {
      return raw + (raw.includes('?') ? '&' : '?') + 'lang=en';
    }
  }, [data?.project?.staging_url]);


  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (overlayMode !== 'pin') return;
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDraftPos({ x, y, selector: null });
    setDraftMessage('');
  };

  const submitNote = async () => {
    if (!draftPos || !draftMessage.trim()) return;
    try {
      await callApi('add_note', {
        note: {
          page_path: '/',
          selector: draftPos.selector,
          x_pct: draftPos.x,
          y_pct: draftPos.y,
          viewport_w: overlayRef.current?.clientWidth,
          viewport_h: overlayRef.current?.clientHeight,
          message: draftMessage.trim(),
          color: draftColor,
        },
      });
      setDraftPos(null);
      setDraftMessage('');
      toast.success('Note saved');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await callApi('delete_note', { note_id: id });
      toast.success('Deleted');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete');
    }
  };

  const acknowledgeAgreement = async () => {
    setAckLoading(true);
    try {
      await callApi('acknowledge_agreement');
      toast.success('Agreement acknowledged');
      setShowAgreement(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save acknowledgement');
    } finally {
      setAckLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);
  const resendDraftEmail = async () => {
    setResendLoading(true);
    try {
      const res = await callApi('resend_draft');
      toast.success(`Draft link sent to ${res.sent_to}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not resend';
      if (msg.includes('rate_limited')) {
        toast.error('Please wait a few minutes before resending again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Access denied
          </h1>
          <p className="text-muted-foreground text-sm">
            {error || 'This invitation is invalid or has expired. Please contact your project manager.'}
          </p>
        </Card>
      </div>
    );
  }

  const { project, notes, color_palette } = data;
  const clientNotes = notes.filter((n) => n.author_type === 'client');

  return (
    <div className="min-h-screen flex flex-col bg-background" onContextMenu={(e) => e.preventDefault()}>
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-md flex-shrink-0"
            style={{ background: project.brand_color }}
          />
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-foreground truncate">{project.name}</h1>
            <p className="text-xs text-muted-foreground truncate">
              Hi {project.client_name} · Status: {project.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={overlayMode === 'pin' ? 'default' : 'outline'}
            onClick={() => setOverlayMode((m) => (m === 'pin' ? 'view' : 'pin'))}
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5" />
            {overlayMode === 'pin' ? 'Click anywhere to pin' : 'Add sticky note'}
          </Button>

          {project.agreement_template && (
            <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
              <DialogTrigger asChild>
                <Button size="sm" variant={project.agreement_acknowledged_at ? 'outline' : 'default'}>
                  <FileText className="w-4 h-4 mr-1.5" />
                  {project.agreement_acknowledged_at ? 'Agreement' : 'View draft agreement'}
                  {project.agreement_acknowledged_at && (
                    <Check className="w-3.5 h-3.5 ml-1 text-emerald-500" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Project agreement — {project.name}</DialogTitle>
                </DialogHeader>
                <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {project.agreement_template}
                </article>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                  {project.agreement_acknowledged_at ? (
                    <p className="text-xs text-muted-foreground">
                      Acknowledged on {new Date(project.agreement_acknowledged_at).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      By acknowledging, you confirm you've read and accept the terms above.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={resendDraftEmail}
                      disabled={resendLoading}
                      size="sm"
                      variant="outline"
                    >
                      <Mail className="w-4 h-4 mr-1.5" />
                      {resendLoading ? 'Sending…' : 'Resend draft email'}
                    </Button>
                    <Button
                      onClick={acknowledgeAgreement}
                      disabled={ackLoading || !!project.agreement_acknowledged_at}
                      size="sm"
                    >
                      {project.agreement_acknowledged_at ? 'Already acknowledged' : 'I acknowledge'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                Notes ({notes.length})
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>All notes</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {notes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No notes yet. Click <strong>Add sticky note</strong> then click anywhere on the page.
                  </p>
                )}
                {notes.map((n) => (
                  <Card key={n.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <span
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ background: n.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {statusLabel[n.status] || n.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {n.author_type === 'client' ? 'You' : 'FastMedia'} ·{' '}
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                          {n.author_type === 'client' && (
                            <button
                              onClick={() => deleteNote(n.id)}
                              className="text-[10px] text-destructive ml-auto inline-flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button size="sm" variant="ghost" asChild>
            <a href={project.staging_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </header>

      <main className="flex-1 relative bg-muted/30">
        <iframe
          src={iframeSrc}
          title={project.name}
          className="absolute inset-0 w-full h-full border-0 bg-background"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          referrerPolicy="no-referrer"
        />

        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="absolute inset-0"
          style={{
            cursor: overlayMode === 'pin' ? 'crosshair' : 'default',
            pointerEvents: overlayMode === 'pin' ? 'auto' : 'none',
          }}
        >
          {clientNotes
            .filter((n) => n.x_pct != null && n.y_pct != null)
            .map((n) => (
              <div
                key={n.id}
                title={n.message}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-lg"
                style={{
                  left: `${n.x_pct}%`,
                  top: `${n.y_pct}%`,
                  width: 18,
                  height: 18,
                  background: n.color,
                  pointerEvents: 'auto',
                }}
              />
            ))}

          {draftPos && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${draftPos.x}%`, top: `${draftPos.y}%`, pointerEvents: 'auto' }}
            >
              <div
                className="w-4 h-4 rounded-full ring-2 ring-white shadow-lg"
                style={{ background: draftColor }}
              />
              <Card className="absolute top-5 left-5 w-72 p-3 shadow-xl z-10">
                <Textarea
                  autoFocus
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  placeholder="Type your feedback…"
                  className="text-sm h-20 resize-none"
                  maxLength={2000}
                />
                <div className="flex items-center gap-1 mt-2">
                  {color_palette.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDraftColor(c)}
                      className={`w-5 h-5 rounded-full ring-2 ${
                        draftColor === c ? 'ring-foreground' : 'ring-transparent'
                      }`}
                      style={{ background: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => setDraftPos(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitNote} disabled={!draftMessage.trim()}>
                    Save note
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card px-4 py-2 text-center">
        <p className="text-[11px] text-muted-foreground">
          Private project preview · {data.client_email}
        </p>
      </footer>
    </div>
  );
};

export default ClientPortal;
