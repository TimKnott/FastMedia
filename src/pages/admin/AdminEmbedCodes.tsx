import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Code2, Pencil, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import PermissionGate from '@/components/admin/PermissionGate';
import VboutEmbedTester from '@/components/admin/VboutEmbedTester';

type EmbedCode = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  placement: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const placementLabels: Record<string, string> = {
  head: '<head>',
  body_start: '<body> start',
  body_end: '<body> end',
};

const AdminEmbedCodes = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', code: '', placement: 'head' });

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['embed-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('embed_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmbedCode[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from('embed_codes').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('embed_codes').insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embed-codes'] });
      toast.success(editingId ? 'Embed code updated' : 'Embed code added');
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('embed_codes').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embed-codes'] });
      toast.success('Status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('embed_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embed-codes'] });
      toast.success('Embed code deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', code: '', placement: 'head' });
    setEditingId(null);
    setDialogOpen(false);
  };

  const openEdit = (code: EmbedCode) => {
    setForm({ name: code.name, description: code.description ?? '', code: code.code, placement: code.placement });
    setEditingId(code.id);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    upsertMutation.mutate({ ...form, id: editingId ?? undefined });
  };

  return (
    <PermissionGate minRole="super_admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Embed Codes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage analytics, tracking pixels, and other embed snippets injected into the live site.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Embed Code</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Embed Code</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Google Analytics" />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What this code does" />
                </div>
                <div>
                  <Label>Placement</Label>
                  <Select value={form.placement} onValueChange={v => setForm({ ...form, placement: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">{'<head>'} — scripts, meta tags</SelectItem>
                      <SelectItem value="body_start">{'<body>'} start — early-load scripts</SelectItem>
                      <SelectItem value="body_end">{'<body>'} end — deferred scripts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Code</Label>
                  <Textarea
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder={'<script>...</script>\nor\n<!-- Google Tag Manager -->'}
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-amber-800 dark:text-amber-200">
                    Only paste code from trusted sources. Malicious scripts can compromise your site.
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={upsertMutation.isPending}>
                    {upsertMutation.isPending ? 'Saving…' : editingId ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : codes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Code2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No embed codes yet. Click "Add Embed Code" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {codes.map(code => (
              <Card key={code.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{code.name}</CardTitle>
                        <Badge variant={code.is_active ? 'default' : 'secondary'}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {placementLabels[code.placement]}
                        </Badge>
                      </div>
                      {code.description && (
                        <CardDescription>{code.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={is_active => toggleMutation.mutate({ id: code.id, is_active })}
                      />
                      <Button variant="ghost" size="icon" onClick={() => openEdit(code)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { if (confirm('Delete this embed code?')) deleteMutation.mutate(code.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-32 whitespace-pre-wrap">
                    {code.code}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
};

export default AdminEmbedCodes;
