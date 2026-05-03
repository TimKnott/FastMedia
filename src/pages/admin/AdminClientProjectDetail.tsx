import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Send, ExternalLink, Loader2, Copy, Save, Trash2, Mail, ShieldOff, RefreshCw, Activity, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ClientBrandingEditor } from '@/components/admin/ClientBrandingEditor';
import { ClientProjectFeesEditor } from '@/components/admin/ClientProjectFeesEditor';
import { DEFAULT_AGREEMENT_TEMPLATE, renderAgreement } from '@/lib/agreementTemplate';
import { downloadAgreementPdf } from '@/lib/agreementPdf';

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

interface AuditEntry {
  id: string;
  action: string;
  actor_type: string;
  actor_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
  created_at: string;
}

const COLUMNS: Array<{ id: Note['status']; label: string }> = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

const EXPIRY_OPTIONS = [7, 14, 30, 60, 90] as const;
const DEFAULT_EXPIRY_DAYS = 30;

const AUDIT_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All events' },
  { value: 'portal_loaded', label: 'Portal opened' },
  { value: 'note_added', label: 'Note added' },
  { value: 'note_updated', label: 'Note updated' },
  { value: 'note_deleted', label: 'Note deleted' },
  { value: 'agreement_acknowledged', label: 'Agreement signed' },
  { value: 'invite_issued', label: 'Invite issued' },
  { value: 'invite_resent', label: 'Invite resent' },
  { value: 'invite_extended', label: 'Invite extended' },
  { value: 'invite_revoked', label: 'Invite revoked' },
  { value: 'all_invites_revoked', label: 'All invites revoked' },
];

const auditLabel = (action: string) =>
  AUDIT_FILTERS.find((f) => f.value === action)?.label ?? action.replace(/_/g, ' ');

const auditBadge = (action: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  if (action.includes('revoked') || action.includes('deleted')) return 'destructive';
  if (action === 'portal_loaded' || action === 'agreement_acknowledged') return 'default';
  if (action.startsWith('invite_')) return 'secondary';
  return 'outline';
};

const AdminClientProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState<number>(DEFAULT_EXPIRY_DAYS);

  const loadAudit = async (projectId: string) => {
    setAuditLoading(true);
    const { data, error } = await supabase
      .from('project_audit_log')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setAudit((data as AuditEntry[]) || []);
    setAuditLoading(false);
  };

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
    loadAudit(id);
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

  const ensureValidPortalUrl = async (): Promise<string | null> => {
    if (!project) return null;
    // Reuse newest non-revoked, non-expired token if any; otherwise issue a fresh one
    const live = tokens.find(
      (t) => !t.revoked_at && (!t.expires_at || new Date(t.expires_at) > new Date())
    );
    if (live) return portalUrlForToken(live.token);
    if (!project.client_email) return null;
    try {
      const { data, error } = await supabase.functions.invoke('portal-issue-invite', {
        body: { project_id: project.id, email: project.client_email, expires_in_days: expiryDays, suppress_email: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.portal_url ?? null;
    } catch {
      return null;
    }
  };

  const sendStageEmail = async (
    stage: 'draft_created' | 'admin_edited' | 'signed_off' | 'deposit_paid',
    extra?: { amount?: string; currency?: string }
  ) => {
    if (!project?.client_email) {
      toast.error('Client email is required before sending stage emails');
      return false;
    }
    const portalUrl = await ensureValidPortalUrl();
    const baseData = {
      recipientName: project.client_name || undefined,
      projectName: project.name,
      portalUrl: portalUrl || undefined,
      stage,
      amount: extra?.amount,
      currency: extra?.currency || project.currency,
      clientEmail: project.client_email,
    };
    const idem = `stage-${stage}-${project.id}-${Date.now()}`;
    try {
      // Client copy
      const clientRes = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'client-stage-update',
          recipientEmail: project.client_email,
          idempotencyKey: `${idem}-client`,
          templateData: { ...baseData, audience: 'client' },
        },
      });
      if (clientRes.error) throw clientRes.error;
      // Admin copy (best-effort — uses NOTIFICATION_EMAIL configured server-side via fallback to support)
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'client-stage-update',
          recipientEmail: 'support@fastmedia.pro',
          idempotencyKey: `${idem}-admin`,
          templateData: { ...baseData, audience: 'admin' },
        },
      });
      await supabase.from('project_audit_log').insert({
        project_id: project.id,
        actor_type: 'admin',
        actor_label: 'admin',
        action: `stage_email_${stage}`,
        details: { recipient: project.client_email, has_portal_link: !!portalUrl },
      });
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send stage email');
      return false;
    }
  };

  const saveProject = async (opts?: { silent?: boolean }) => {
    if (!project) return;
    setSaving(true);
    const wasDraftEmailed = !!project.draft_emailed_at;
    const hasAgreement = !!(project.agreement_template && project.agreement_template.trim().length > 0);
    const { error } = await supabase
      .from('client_projects')
      .update({
        name: project.name,
        client_name: project.client_name,
        client_email: project.client_email,
        staging_url: project.staging_url,
        status: project.status,
        brand_color: project.brand_color,
        brand_color_secondary: project.brand_color_secondary,
        logo_url: project.logo_url,
        existing_website_url: project.existing_website_url,
        brand_notes: project.brand_notes,
        agreement_template: project.agreement_template,
        currency: project.currency,
        dev_fee: project.dev_fee,
        hosting_fee_yearly: project.hosting_fee_yearly,
        ai_token_ratio: project.ai_token_ratio,
        ai_cost_per_unit: project.ai_cost_per_unit,
        ai_units_per_user: project.ai_units_per_user,
        deposit_pct: project.deposit_pct,
        late_penalty_pct_per_day: project.late_penalty_pct_per_day,
        fee_line_items: project.fee_line_items,
      })
      .eq('id', project.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (!opts?.silent) toast.success('Saved');

    // Stage email logic
    if (hasAgreement && project.client_email) {
      if (!wasDraftEmailed) {
        const ok = await sendStageEmail('draft_created');
        if (ok) {
          await supabase.from('client_projects').update({ draft_emailed_at: new Date().toISOString() }).eq('id', project.id);
          setProject({ ...project, draft_emailed_at: new Date().toISOString() });
          toast.success('Draft agreement emailed to client');
        }
      } else if (project.agreement_signed_off_at == null) {
        // Only fire "edited" emails for projects that haven't yet been signed off
        await sendStageEmail('admin_edited');
        toast.success('Update email sent to client');
      }
    }
  };

  const markSignedOff = async () => {
    if (!project) return;
    if (project.agreement_signed_off_at) {
      if (!confirm('Already marked signed-off. Re-send sign-off email?')) return;
    }
    const ts = new Date().toISOString();
    const { error } = await supabase
      .from('client_projects')
      .update({ agreement_signed_off_at: ts, status: 'approved' })
      .eq('id', project.id);
    if (error) { toast.error(error.message); return; }
    setProject({ ...project, agreement_signed_off_at: ts, status: 'approved' });
    await sendStageEmail('signed_off');
    toast.success('Signed off — client notified');
  };

  const markDepositPaid = async () => {
    if (!project) return;
    const dep = Number(project.dev_fee || 0) * (Number(project.deposit_pct || 25) / 100);
    const amountStr = prompt(`Deposit amount received (${project.currency || 'CZK'})`, dep.toFixed(0));
    if (amountStr == null) return;
    const amount = Number(amountStr);
    if (!isFinite(amount) || amount <= 0) { toast.error('Invalid amount'); return; }
    const ts = new Date().toISOString();
    const { error } = await supabase
      .from('client_projects')
      .update({ deposit_paid_at: ts, deposit_paid_amount: amount })
      .eq('id', project.id);
    if (error) { toast.error(error.message); return; }
    setProject({ ...project, deposit_paid_at: ts, deposit_paid_amount: amount });
    await sendStageEmail('deposit_paid', { amount: amount.toLocaleString('en-GB'), currency: project.currency });
    toast.success('Deposit recorded — client notified');
  };

  const portalUrlForToken = (tokenStr: string) => {
    const slug = (project?.slug || '').replace(/[^a-z0-9-]/gi, '').toLowerCase();
    return slug
      ? `${window.location.origin}/portal/${slug}/${tokenStr}`
      : `${window.location.origin}/portal/${tokenStr}`;
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

  const revokeToken = async (t: Token) => {
    if (!confirm(`Revoke access for ${t.email}? They will be cut off immediately.`)) return;
    const { error } = await supabase
      .from('project_access_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', t.id);
    if (error) { toast.error(error.message); return; }
    if (project) {
      await supabase.from('project_audit_log').insert({
        project_id: project.id,
        actor_type: 'admin',
        actor_label: 'admin',
        action: 'invite_revoked',
        details: { token_id: t.id, email: t.email },
      });
    }
    toast.success(`Revoked access for ${t.email}`);
    load();
  };

  const revokeAllTokens = async () => {
    if (!project) return;
    const active = tokens.filter((t) => !t.revoked_at && (!t.expires_at || new Date(t.expires_at) >= new Date()));
    if (active.length === 0) { toast.info('No active invites to revoke.'); return; }
    if (!confirm(`Revoke ${active.length} active invite(s)? All clients will lose access immediately.`)) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('project_access_tokens')
      .update({ revoked_at: now })
      .in('id', active.map((t) => t.id));
    if (error) { toast.error(error.message); return; }
    await supabase.from('project_audit_log').insert({
      project_id: project.id,
      actor_type: 'admin',
      actor_label: 'admin',
      action: 'all_invites_revoked',
      details: { count: active.length, emails: active.map((t) => t.email) },
    });
    toast.success(`Revoked ${active.length} invite(s)`);
    load();
  };

  const resendInvite = async (t: Token) => {
    if (!project) return;
    const url = portalUrlForToken(t.token);
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
            <p className="text-[11px] text-muted-foreground mt-1">
              Public portal URL: <code className="bg-muted px-1.5 py-0.5 rounded">{window.location.origin}/portal/{project.slug}/&lt;token&gt;</code>
            </p>
          </div>
        </div>
        <Button onClick={saveProject} disabled={saving} size="sm">
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save all changes
        </Button>
      </Card>

      {/* Branding */}
      <Card className="p-4 space-y-3">
        <h2 className="font-display font-semibold text-foreground">Client branding</h2>
        <p className="text-xs text-muted-foreground">
          Upload the client's logo and reference site so we can match their visual identity in the build.
        </p>
        <ClientBrandingEditor
          projectId={project.id}
          logoUrl={project.logo_url}
          existingWebsiteUrl={project.existing_website_url}
          brandColor={project.brand_color || '#0f3a7a'}
          brandColorSecondary={project.brand_color_secondary}
          brandNotes={project.brand_notes}
          onChange={(patch) => setProject({ ...project, ...patch })}
        />
      </Card>

      {/* Fees */}
      <Card className="p-4 space-y-3">
        <h2 className="font-display font-semibold text-foreground">Fees & deposit</h2>
        <p className="text-xs text-muted-foreground">
          Edit pricing here. Totals, deposit and AI worked-example are recalculated live and merged into the agreement template below.
        </p>
        <ClientProjectFeesEditor
          value={{
            currency: project.currency || 'CZK',
            dev_fee: Number(project.dev_fee || 0),
            hosting_fee_yearly: Number(project.hosting_fee_yearly || 0),
            ai_token_ratio: Number(project.ai_token_ratio || 3),
            ai_cost_per_unit: Number(project.ai_cost_per_unit || 0.35),
            ai_units_per_user: Number(project.ai_units_per_user || 1),
            deposit_pct: Number(project.deposit_pct || 25),
            late_penalty_pct_per_day: Number(project.late_penalty_pct_per_day || 0.05),
            fee_line_items: project.fee_line_items || [],
          }}
          onChange={(next) => setProject({ ...project, ...next })}
        />
      </Card>

      {/* Agreement */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-display font-semibold text-foreground">Sales agreement</h2>
          <div className="flex items-center gap-2">
            {!project.agreement_template && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProject({ ...project, agreement_template: DEFAULT_AGREEMENT_TEMPLATE })}
              >
                Load master template
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!project.agreement_template}
              onClick={() => {
                downloadAgreementPdf({
                  template: project.agreement_template || '',
                  context: {
                    client_name: project.client_name || '',
                    project_name: project.name || '',
                    service_provider_name: 'Tim Knott, FastMedia.Pro',
                    service_provider_address: '200 Na Skala, Telce, Peruc 44001',
                    date: new Date().toLocaleDateString('en-GB'),
                    currency: project.currency || 'CZK',
                    dev_fee: Number(project.dev_fee || 0),
                    hosting_fee_yearly: Number(project.hosting_fee_yearly || 0),
                    ai_token_ratio: Number(project.ai_token_ratio || 3),
                    ai_cost_per_unit: Number(project.ai_cost_per_unit || 0.35),
                    ai_units_per_user: Number(project.ai_units_per_user || 1),
                    deposit_pct: Number(project.deposit_pct || 25),
                    late_penalty_pct_per_day: Number(project.late_penalty_pct_per_day || 0.05),
                    fee_line_items: project.fee_line_items || [],
                  },
                });
                toast.success('Agreement PDF downloaded');
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={!project.agreement_template}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agreement preview — {project.name}</DialogTitle>
                </DialogHeader>
                <pre className="whitespace-pre-wrap text-sm font-sans text-foreground">
                  {renderAgreement(project.agreement_template || '', {
                    client_name: project.client_name || '',
                    project_name: project.name || '',
                    service_provider_name: 'Tim Knott, FastMedia.Pro',
                    service_provider_address: '200 Na Skala, Telce, Peruc 44001',
                    date: new Date().toLocaleDateString('en-GB'),
                    currency: project.currency || 'CZK',
                    dev_fee: Number(project.dev_fee || 0),
                    hosting_fee_yearly: Number(project.hosting_fee_yearly || 0),
                    ai_token_ratio: Number(project.ai_token_ratio || 3),
                    ai_cost_per_unit: Number(project.ai_cost_per_unit || 0.35),
                    ai_units_per_user: Number(project.ai_units_per_user || 1),
                    deposit_pct: Number(project.deposit_pct || 25),
                    late_penalty_pct_per_day: Number(project.late_penalty_pct_per_day || 0.05),
                    fee_line_items: project.fee_line_items || [],
                  })}
                </pre>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Tokens supported:{' '}
          <code>{`{{client_name}}`}</code> <code>{`{{project_name}}`}</code> <code>{`{{dev_fee}}`}</code>{' '}
          <code>{`{{hosting_fee_yearly}}`}</code> <code>{`{{deposit_pct}}`}</code>{' '}
          <code>{`{{deposit_amount}}`}</code> <code>{`{{balance_due}}`}</code>{' '}
          <code>{`{{ai_token_ratio}}`}</code> <code>{`{{ai_cost_100}}`}</code>{' '}
          <code>{`{{late_penalty_pct_per_day}}`}</code> <code>{`{{date}}`}</code>
        </p>
        <Textarea
          rows={14}
          value={project.agreement_template || ''}
          onChange={(e) => setProject({ ...project, agreement_template: e.target.value })}
          className="font-mono text-xs"
          placeholder="Click 'Load master template' to start from the standard FastMedia agreement…"
        />
        {project.agreement_acknowledged_at && (
          <p className="text-xs text-emerald-600">
            ✓ Acknowledged by client {new Date(project.agreement_acknowledged_at).toLocaleString()} · IP {project.agreement_ack_ip}
          </p>
        )}
      </Card>

      {/* Active invites */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display font-semibold text-foreground">Active invites</h2>
          {tokens.some((t) => !t.revoked_at && (!t.expires_at || new Date(t.expires_at) >= new Date())) && (
            <Button size="sm" variant="destructive" onClick={revokeAllTokens}>
              <ShieldOff className="w-3.5 h-3.5 mr-1.5" /> Revoke all access
            </Button>
          )}
        </div>
        {tokens.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invites yet.</p>
        ) : (
          <div className="space-y-2">
            {tokens.map((t) => {
              const url = portalUrlForToken(t.token);
              const expired = t.expires_at && new Date(t.expires_at) < new Date();
              const daysLeft = t.expires_at && !expired
                ? Math.max(0, Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / 86400_000))
                : null;
              const fmt = (d: string) =>
                new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
              return (
                <div key={t.id} className="flex flex-col gap-1.5 text-sm border border-border/60 rounded-md p-2">
                  <div className="flex items-center gap-2 flex-wrap">
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
                  </div>
                  <div className="flex items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground flex-wrap">
                    <span className="font-medium text-foreground/80 truncate max-w-[200px]">{t.email}</span>
                    <span><span className="opacity-70">Issued:</span> {fmt(t.created_at)}</span>
                    <span>
                      <span className="opacity-70">Expires:</span>{' '}
                      {t.expires_at ? fmt(t.expires_at) : <em className="not-italic text-amber-600">never</em>}
                    </span>
                    {t.last_used_at && (
                      <span><span className="opacity-70">Last used:</span> {fmt(t.last_used_at)}</span>
                    )}
                    {t.revoked_at && (
                      <span><span className="opacity-70">Revoked:</span> {fmt(t.revoked_at)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <Button size="sm" variant="ghost" onClick={() => revokeToken(t)} title={`Revoke ${t.email}`}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Access audit */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Access audit</h2>
            <Badge variant="outline" className="text-[10px]">{audit.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              {AUDIT_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <Button size="sm" variant="ghost" onClick={() => id && loadAudit(id)} disabled={auditLoading}>
              <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {auditLoading && audit.length === 0 ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">No portal activity recorded yet.</p>
        ) : (
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
            {audit
              .filter((a) => auditFilter === 'all' || a.action === auditFilter)
              .map((a) => {
                const when = new Date(a.created_at);
                const actor = a.actor_type === 'client'
                  ? (a.actor_label || a.details?.email || 'Client')
                  : (a.actor_label || 'Admin');
                return (
                  <div key={a.id} className="py-2.5 flex items-start gap-3 text-sm">
                    <Badge variant={auditBadge(a.action)} className="text-[10px] shrink-0 mt-0.5">
                      {auditLabel(a.action)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{actor}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{a.actor_type}</span>
                        {a.ip_address && (
                          <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{a.ip_address}</code>
                        )}
                      </div>
                      {a.details && Object.keys(a.details).length > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={JSON.stringify(a.details)}>
                          {Object.entries(a.details)
                            .filter(([k]) => !['emails'].includes(k))
                            .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
                            .join(' · ')}
                        </p>
                      )}
                      {a.user_agent && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate" title={a.user_agent}>{a.user_agent}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                      {when.toLocaleString()}
                    </span>
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
