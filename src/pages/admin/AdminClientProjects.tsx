import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, ExternalLink, Loader2, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  staging_url: string;
  status: string;
  brand_color: string;
  created_at: string;
}

const DEFAULT_AGREEMENT = `PROJECT AGREEMENT

Client: {{client_name}}
Project: {{project_name}}
Date: {{date}}

1. Scope
   FastMedia.Pro will design, build and deliver the website preview accessible at the client portal URL.

2. Revisions
   Two rounds of revisions are included. Additional rounds are billed at the agreed hourly rate.

3. Payment
   50% deposit on signature, 50% on final delivery, payable in CZK.

4. Ownership
   On final payment, all source code and assets transfer to the client.

5. Confidentiality
   Both parties agree to keep proprietary information confidential.

By acknowledging this document inside the portal, the client accepts the terms above.`;

const AdminClientProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    client_name: '',
    client_email: '',
    staging_url: '',
    brand_color: '#0f3a7a',
    agreement_template: DEFAULT_AGREEMENT,
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setProjects((data as Project[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createProject = async () => {
    if (!form.name || !form.client_email || !form.staging_url) {
      toast.error('Name, client email and staging URL are required');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('client_projects')
      .insert(form)
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Project created');
    setCreateOpen(false);
    setForm({ ...form, name: '', client_name: '', client_email: '', staging_url: '' });
    navigate(`/admin/client-projects/${data.id}`);
  };

  const sendInvite = async (projectId: string, email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('portal-issue-invite', {
        body: { project_id: projectId, email, expires_in_days: 60 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      navigator.clipboard.writeText(data.portal_url).catch(() => {});
      toast.success('Invite sent — link copied to clipboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send invite');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Client projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Private review portals for individual clients with sticky-note feedback.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1.5" /> New project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create client project</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Project name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Client name</Label>
                  <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                </div>
                <div>
                  <Label>Client email</Label>
                  <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Staging URL</Label>
                <Input placeholder="https://staging.example.com" value={form.staging_url} onChange={(e) => setForm({ ...form, staging_url: e.target.value })} />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Where the actual website is hosted. Embedded inside the portal — origin stays masked.
                </p>
              </div>
              <div>
                <Label>Brand colour</Label>
                <Input type="color" value={form.brand_color} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} className="h-10 w-20" />
              </div>
              <div>
                <Label>Agreement template</Label>
                <Textarea rows={6} value={form.agreement_template} onChange={(e) => setForm({ ...form, agreement_template: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createProject} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />} Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No client projects yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/client-projects/${p.id}`)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md flex-shrink-0" style={{ background: p.brand_color }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{p.client_name} · {p.client_email}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{p.status}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); sendInvite(p.id, p.client_email); }}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Send invite
                </Button>
                <Button size="sm" variant="ghost" asChild onClick={(e) => e.stopPropagation()}>
                  <a href={p.staging_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClientProjects;
