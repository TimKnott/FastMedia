import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, ExternalLink, Loader2, Copy, Save, Trash2, Mail, ShieldOff, RefreshCw, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  message: string;
  color: string;
  status: 'todo' | 'in_progress' | 'done';
  author_type: 'client' | 'admin';
  author_name: string | null;
  page_path: string;
  x_pct: number | null;
  y_pct: number | null;
  created_at: string;
}

interface Token {
  id: string;
  token: string;
  email: string;
  expires_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const COLUMNS: Array<{ id: Note['status']; label: string }> = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

const EXPIRY_OPTIONS = [7, 14, 30, 60, 90] as const;
const DEFAULT_EXPIRY_DAYS = 30;

const AdminClientProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState<number>(DEFAULT_EXPIRY_DAYS);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [p, n, t] = await Promise.all([
      supabase.from('client_projects').select('*').eq('id', id).single(),
      supabase.from('project_notes').select('*').eq('project_id', id).order('created_at'),
      supabase.from('project_access_tokens').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    ]);
    if (p.error) toast.error(p.error.message);
    setProject(p.data);
    setNotes((n.data as Note[]) || []);
    setTokens((t.data as Token[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const moveNote = async (noteId: string, status: Note['status']) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, status } : n)));
    const { error } = await supabase
      .from('project_notes')
      .update({ status, resolved_at: status === 'done' ? new Date().toISOString() : null })
      .eq('id', noteId);
    if (error) {
      toast.error(error.message);
      load();
    }
  };

  const saveProject = async () => {
    if (!project) return;
    setSaving(true);
    const { error } = await supabase
      .from('client_projects')
      .update({
        name: project.name,
        client_name: project.client_name,
        client_email: project.client_email,
        staging_url: project.staging_url,
        status: project.status,
        brand_color: project.brand_color,
        agreement_template: project.agreement_template,
      })
      .eq('id', project.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Saved');
  };

  const sendInvite = async () => {
    if (!project) return;
    try {
      const { data, error } = await supabase.functions.invoke('portal-issue-invite', {
        body: { project_id: project.id, email: project.client_email, expires_in_days: expiryDays },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      navigator.clipboard.writeText(data.portal_url).catch(() => {});
      toast.success(`Invite issued (expires in ${expiryDays} days) — link copied`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  const extendExpiry = async (t: Token, days: number) => {
    const newExpiry = new Date(Date.now() + days * 86400_000).toISOString();
    const { error } = await supabase
      .from('project_access_tokens')
      .update({ expires_at: newExpiry })
      .eq('id', t.id);
    if (error) { toast.error(error.message); return; }
    if (project) {
      await supabase.from('project_audit_log').insert({
        project_id: project.id,
        actor_type: 'admin',
        actor_label: 'admin',
        action: 'invite_extended',
        details: { token_id: t.id, email: t.email, new_expires_at: newExpiry, days },
      });
    }
    toast.success(`Extended ${t.email} by ${days} days`);
    load();
  };

  const revokeToken = async (tokenId: string) => {
    const { error } = await supabase
      .from('project_access_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', tokenId);
    if (error) toast.error(error.message);
    else { toast.success('Revoked'); load(); }
  };

  const resendInvite = async (t: Token) => {
    if (!project) return;
    const url = `${window.location.origin}/portal/${t.token}`;
    try {
      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'portal-invite',
          recipientEmail: t.email,
          idempotencyKey: `portal-invite-resend-${t.token}-${Date.now()}`,
          templateData: {
            recipientName: project.client_name,
            projectName: project.name,
            portalUrl: url,
          },
        },
      });
      if (error) throw error;
      // Best-effort audit
      await supabase.from('project_audit_log').insert({
        project_id: project.id,
        actor_type: 'admin',
        actor_label: 'admin',
        action: 'invite_resent',
        details: { email: t.email, token_id: t.id },
      });
      toast.success(`Invite re-sent to ${t.email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to resend');
    }
  };

  if (loading || !project) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/client-projects')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground truncate">{project.name}</h1>
          <p className="text-xs text-muted-foreground">{project.client_name} · {project.client_email}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Label htmlFor="expiry-select" className="text-xs text-muted-foreground whitespace-nowrap">Expires in</Label>
          <select
            id="expiry-select"
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {EXPIRY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>
        <Button onClick={sendInvite}><Send className="w-4 h-4 mr-1.5" /> Send invite</Button>
      </div>

      {/* Settings */}
      <Card className="p-4 space-y-3">
        <h2 className="font-display font-semibold text-foreground">Project settings</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Project name</Label><Input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} /></div>
          <div><Label>Status</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={project.status} onChange={(e) => setProject({ ...project, status: e.target.value })}>
              <option value="in_review">In review</option>
              <option value="revisions">Revisions</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div><Label>Client name</Label><Input value={project.client_name} onChange={(e) => setProject({ ...project, client_name: e.target.value })} /></div>
          <div><Label>Client email</Label><Input value={project.client_email} onChange={(e) => setProject({ ...project, client_email: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Staging URL</Label>
            <div className="flex gap-2">
              <Input value={project.staging_url} onChange={(e) => setProject({ ...project, staging_url: e.target.value })} />
              <Button variant="outline" size="icon" asChild><a href={project.staging_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a></Button>
            </div>
          </div>
          <div><Label>Brand colour</Label><Input type="color" value={project.brand_color} onChange={(e) => setProject({ ...project, brand_color: e.target.value })} className="h-10 w-24" /></div>
        </div>
        <div>
          <Label>Agreement template</Label>
          <Textarea rows={6} value={project.agreement_template || ''} onChange={(e) => setProject({ ...project, agreement_template: e.target.value })} />
          {project.agreement_acknowledged_at && (
            <p className="text-xs text-emerald-600 mt-1">Acknowledged {new Date(project.agreement_acknowledged_at).toLocaleString()} · IP {project.agreement_ack_ip}</p>
          )}
        </div>
        <Button onClick={saveProject} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save
        </Button>
      </Card>

      {/* Active invites */}
      <Card className="p-4">
        <h2 className="font-display font-semibold text-foreground mb-3">Active invites</h2>
        {tokens.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invites yet.</p>
        ) : (
          <div className="space-y-2">
            {tokens.map((t) => {
              const url = `${window.location.origin}/portal/${t.token}`;
              const expired = t.expires_at && new Date(t.expires_at) < new Date();
              const daysLeft = t.expires_at && !expired
                ? Math.max(0, Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / 86400_000))
                : null;
              return (
                <div key={t.id} className="flex items-center gap-2 text-sm flex-wrap">
                  <code className="px-2 py-1 bg-muted rounded text-xs flex-1 min-w-[200px] truncate">{url}</code>
                  <Badge variant={t.revoked_at ? 'destructive' : expired ? 'outline' : 'default'} className="text-[10px]">
                    {t.revoked_at ? 'Revoked' : expired ? 'Expired' : 'Active'}
                  </Badge>
                  {!t.revoked_at && !expired && t.expires_at && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {daysLeft === 0 ? 'expires today' : `${daysLeft}d left`}
                    </span>
                  )}
                  {!t.revoked_at && !t.expires_at && (
                    <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">Never expires</Badge>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(url); toast.success('Copied'); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {!t.revoked_at && !expired && (
                    <Button size="sm" variant="outline" onClick={() => resendInvite(t)} title={`Resend to ${t.email}`}>
                      <Mail className="w-3.5 h-3.5 mr-1" /> Resend
                    </Button>
                  )}
                  {!t.revoked_at && (
                    <select
                      onChange={(e) => { const v = Number(e.target.value); if (v) { extendExpiry(t, v); e.currentTarget.value = ''; } }}
                      defaultValue=""
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      title="Extend expiry from now"
                    >
                      <option value="" disabled>Extend…</option>
                      {EXPIRY_OPTIONS.map((d) => (
                        <option key={d} value={d}>+{d} days</option>
                      ))}
                    </select>
                  )}
                  {!t.revoked_at && (
                    <Button size="sm" variant="ghost" onClick={() => revokeToken(t.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Kanban */}
      <div>
        <h2 className="font-display font-semibold text-foreground mb-3">Feedback kanban</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {COLUMNS.map((col) => (
            <Card
              key={col.id}
              className="p-3 min-h-[300px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (draggingId) { moveNote(draggingId, col.id); setDraggingId(null); } }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-foreground">{col.label}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {notes.filter((n) => n.status === col.id).length}
                </Badge>
              </div>
              <div className="space-y-2">
                {notes.filter((n) => n.status === col.id).map((n) => (
                  <Card
                    key={n.id}
                    draggable
                    onDragStart={() => setDraggingId(n.id)}
                    className="p-2.5 cursor-grab active:cursor-grabbing border-l-4"
                    style={{ borderLeftColor: n.color }}
                  >
                    <p className="text-sm text-foreground whitespace-pre-wrap">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {n.author_type === 'client' ? (n.author_name || 'Client') : 'Admin'} · {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminClientProjectDetail;
