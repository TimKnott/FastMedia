import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Search, ExternalLink, Sparkles, Plus, Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomDemos } from '@/hooks/useCustomDemos';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const builtInTrades = [
  'plumbing','electrical','building','roofing','drywall','wells','heating','solar','heatpumps',
  'painting','interior','exterior','gardening','cleaning','locksmith','carpentry','autorepair',
  'pestcontrol','photography','catering','fitness','beautysalon','moving','itservices','eshop',
  'womeninbusiness','virtualassistant','weddingplanner','florist','bakery','yoga','nailsalon',
  'massage','petgrooming','nutritionist','handmade','childcare','dental','realestate','accounting',
  'veterinary','tattoo','musicschool','drivingschool','laundry','security','translation',
];

const AdminDemos = () => {
  const { t } = useLanguage();
  const { demos, loading, reload } = useCustomDemos({ activeOnly: false });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ tradeName: '', icon: '', gradient: '' });

  const create = async () => {
    if (!form.tradeName.trim()) {
      toast.error('Trade name is required');
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-demo', {
        body: {
          tradeName: form.tradeName.trim(),
          icon: form.icon || undefined,
          gradient: form.gradient || undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed');
      toast.success(`Demo created: /demo/${data.demo?.trade_id}`, {
        description: `Hero + ${data.gallery_count} gallery images generated. Live now in calculator and demos page.`,
      });
      setOpen(false);
      setForm({ tradeName: '', icon: '', gradient: '' });
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('custom_demos').update({ is_active: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(current ? 'Hidden' : 'Activated'); reload(); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this demo?')) return;
    const { error } = await supabase.from('custom_demos').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); reload(); }
  };

  const filteredBuiltIn = builtInTrades.filter(id =>
    id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Demo Pages</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {builtInTrades.length} built-in · {demos.length} AI-generated · all live in calculator & sitemap
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create new demo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Create AI demo page
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="tradeName">Trade / business name *</Label>
                <Input
                  id="tradeName"
                  placeholder="e.g. Window Cleaning, Tutoring, Locksmith…"
                  value={form.tradeName}
                  onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                  disabled={creating}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="icon">Icon (emoji, optional)</Label>
                  <Input id="icon" placeholder="🪟" maxLength={4} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} disabled={creating} />
                </div>
                <div>
                  <Label htmlFor="gradient">Gradient (optional)</Label>
                  <Input id="gradient" placeholder="bg-gradient-to-br from-…" value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} disabled={creating} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground bg-muted rounded-md p-2">
                AI will generate trilingual content (CS/EN/DE), 6 services, FAQs, calculator prompts, plus a hero + 4 gallery images. Takes ~30–60 seconds.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={creating}>Cancel</Button>
              <Button onClick={create} disabled={creating || !form.tradeName.trim()}>
                {creating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4 mr-1" /> Generate</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI-generated demos */}
      {demos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">AI-Generated Demos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((d) => (
              <Card key={d.id} className="shadow-card">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{d.icon}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{d.name?.cs || d.name?.en || d.trade_id}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">/demo/{d.trade_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Badge variant={d.is_active ? 'default' : 'outline'} className="text-[9px] cursor-pointer" onClick={() => toggleActive(d.id, d.is_active)}>
                        {d.is_active ? 'Live' : 'Hidden'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={`/demo/${d.trade_id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Built-in demos */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Built-in Demos</h2>
        <div className="relative max-w-sm mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('demos.search')} className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBuiltIn.map((id) => (
            <Card key={id} className="shadow-sm">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground font-mono">/demo/{id}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={`/demo/${id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDemos;
