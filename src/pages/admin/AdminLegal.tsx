import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, ExternalLink, Pencil, Trash2, FileText } from 'lucide-react';

interface LegalDoc {
  id: string;
  slug: string;
  region: string;
  title: string;
  summary: string | null;
  content: string;
  version: string;
  effective_date: string;
  published: boolean;
  updated_at: string;
}

const EMPTY: Partial<LegalDoc> = {
  slug: '',
  region: 'global',
  title: '',
  summary: '',
  content: '',
  version: '1.0',
  effective_date: new Date().toISOString().slice(0, 10),
  published: true,
};

const AdminLegal = () => {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<LegalDoc> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .order('slug', { ascending: true })
      .order('region', { ascending: true });
    if (error) toast.error(error.message);
    setDocs((data as LegalDoc[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing?.slug || !editing.title || !editing.content) {
      toast.error('Slug, title and content are required.');
      return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug,
      region: editing.region || 'global',
      title: editing.title,
      summary: editing.summary || null,
      content: editing.content,
      version: editing.version || '1.0',
      effective_date: editing.effective_date,
      published: editing.published ?? true,
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from('legal_documents').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('legal_documents').insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Legal document saved');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this legal document? This cannot be undone.')) return;
    const { error } = await supabase.from('legal_documents').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Deleted');
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <FileText className="w-7 h-7" /> Legal Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Privacy Policy, Terms of Service, Cookie Policy, GDPR, DPA and more. Edits go live immediately when{' '}
            <em>Published</em> is on.
          </p>
        </div>
        <Button onClick={() => setEditing(EMPTY)}>
          <Plus className="w-4 h-4 mr-1" /> New document
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-3">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold">{d.title}</h3>
                    <Badge variant="outline" className="uppercase text-xs">
                      {d.region}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">v{d.version}</Badge>
                    {!d.published && <Badge variant="destructive" className="text-xs">Draft</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    /legal/{d.slug}?region={d.region} · effective {d.effective_date}
                  </p>
                  {d.summary && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{d.summary}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Preview"
                  >
                    <a href={`/legal/${d.slug}?region=${d.region}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(d)} title="Edit">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(d.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {docs.length === 0 && (
            <p className="text-muted-foreground text-sm">No legal documents yet.</p>
          )}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit legal document' : 'New legal document'}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Slug</Label>
                  <Input
                    placeholder="privacy-policy"
                    value={editing.slug || ''}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Select
                    value={editing.region || 'global'}
                    onValueChange={(v) => setEditing({ ...editing, region: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="eu">EU / UK</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={editing.version || ''}
                    onChange={(e) => setEditing({ ...editing, version: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Summary (optional)</Label>
                <Input
                  value={editing.summary || ''}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Effective date</Label>
                  <Input
                    type="date"
                    value={editing.effective_date || ''}
                    onChange={(e) => setEditing({ ...editing, effective_date: e.target.value })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Switch
                    checked={editing.published ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                  />
                  <Label>Published (visible on public site)</Label>
                </div>
              </div>

              <div>
                <Label>Content (Markdown)</Label>
                <Textarea
                  rows={20}
                  className="font-mono text-sm"
                  value={editing.content || ''}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Markdown supported (headings, lists, tables, links).
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLegal;
