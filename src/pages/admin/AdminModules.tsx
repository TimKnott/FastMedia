import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Puzzle, Plus, Save, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { calculatorFeatures } from '@/data/calculatorFeatures';
import { DEFAULT_PACKAGES, featureToRow, packagePrice, rowToFeature, type CalculatorPackage } from '@/hooks/useCalculatorModules';
import type { Tables } from '@/integrations/supabase/types';

type Row = Tables<'calculator_modules'>;
const CATS = ['essential', 'marketing', 'advanced', 'premium'] as const;
const fmt = (n: number) => `${n.toLocaleString('cs-CZ')} Kč`;

const AdminModules = () => {
  const qc = useQueryClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [pkgs, setPkgs] = useState<CalculatorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from('calculator_modules').select('*').order('sort_order'),
      supabase.from('calculator_packages').select('*').order('sort_order'),
    ]);
    setRows(m ?? []); setPkgs(p?.length ? p : DEFAULT_PACKAGES); setDirty(new Set()); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const importDefaults = async () => {
    const existing = new Set(rows.map(r => r.id));
    const missing = calculatorFeatures.map(featureToRow).filter(r => !existing.has(r.id));
    if (missing.length) {
      const { error } = await supabase.from('calculator_modules').insert(missing);
      if (error) return toast.error(error.message);
    }
    if (!pkgs.length || pkgs === DEFAULT_PACKAGES || !(await supabase.from('calculator_packages').select('slug').limit(1)).data?.length) {
      await supabase.from('calculator_packages').upsert(DEFAULT_PACKAGES);
    }
    toast.success(`Imported ${missing.length} modules`); qc.invalidateQueries({ queryKey: ['calculator-modules'] }); load();
  };

  const edit = (id: string, patch: Partial<Row>) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
    setDirty(d => new Set(d).add(id));
  };

  const saveModules = async () => {
    const changed = rows.filter(r => dirty.has(r.id)).map(({ created_at: _c, updated_at: _u, ...r }) => r);
    const { error } = await supabase.from('calculator_modules').upsert(changed);
    if (error) return toast.error(error.message);
    toast.success('Modules saved — the calculator is updated'); setDirty(new Set());
    qc.invalidateQueries({ queryKey: ['calculator-modules'] });
  };

  const addModule = () => {
    const id = `custom-${Date.now().toString(36)}`;
    const r = { id, icon: '🧩', name_en: 'New module', name_cs: '', desc_en: '', desc_cs: '', one_time_price: 0, monthly_price: 0, labor_hours: 0, category: 'advanced', allow_multiple: false, active: false, sort_order: rows.length, created_at: '', updated_at: '' } as Row;
    setRows([...rows, r]); setDirty(d => new Set(d).add(id));
  };

  const savePackages = async () => {
    const { error } = await supabase.from('calculator_packages').upsert(pkgs.map(({ slug, name, module_ids, sort_order }) => ({ slug, name, module_ids, sort_order })));
    if (error) return toast.error(error.message);
    toast.success('Packages saved'); qc.invalidateQueries({ queryKey: ['calculator-modules'] });
  };

  const features = rows.filter(r => r.active).map(rowToFeature);
  const usable = features.length ? features : calculatorFeatures;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Puzzle className="w-6 h-6" /> Calculator modules</h1>
          <p className="text-sm text-muted-foreground">Everything here appears in the public price calculator. Package prices are the sum of their modules.</p>
        </div>
        {rows.length < calculatorFeatures.length && (
          <Button variant="outline" onClick={importDefaults}><Download className="w-4 h-4 mr-2" /> Import the built-in modules</Button>
        )}
      </div>

      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <Tabs defaultValue="modules">
          <TabsList><TabsTrigger value="modules">Modules ({rows.length})</TabsTrigger><TabsTrigger value="packages">Packages</TabsTrigger></TabsList>

          <TabsContent value="modules" className="space-y-3">
            {!rows.length && <p className="text-sm text-muted-foreground">The calculator is currently using the built-in list. Import it to start editing.</p>}
            <div className="flex gap-2">
              <Button onClick={addModule} variant="outline"><Plus className="w-4 h-4 mr-2" /> Add module</Button>
              <Button onClick={saveModules} disabled={!dirty.size}><Save className="w-4 h-4 mr-2" /> Save {dirty.size || ''} change{dirty.size === 1 ? '' : 's'}</Button>
            </div>
            {rows.map(r => (
              <Card key={r.id} className={r.active ? '' : 'opacity-60'}>
                <CardContent className="p-4 grid gap-3 md:grid-cols-12 items-end">
                  <Input aria-label="Icon" className="md:col-span-1" value={r.icon} onChange={e => edit(r.id, { icon: e.target.value })} />
                  <div className="md:col-span-3"><label className="text-xs text-muted-foreground">Name</label><Input value={r.name_en} onChange={e => edit(r.id, { name_en: e.target.value })} /></div>
                  <div className="md:col-span-4"><label className="text-xs text-muted-foreground">Description</label><Input value={r.desc_en} onChange={e => edit(r.id, { desc_en: e.target.value })} /></div>
                  <div className="md:col-span-1"><label className="text-xs text-muted-foreground">One-off Kč</label><Input type="number" min={0} value={r.one_time_price} onChange={e => edit(r.id, { one_time_price: Number(e.target.value) })} /></div>
                  <div className="md:col-span-1"><label className="text-xs text-muted-foreground">Monthly Kč</label><Input type="number" min={0} value={r.monthly_price} onChange={e => edit(r.id, { monthly_price: Number(e.target.value) })} /></div>
                  <div className="md:col-span-1"><label className="text-xs text-muted-foreground">Hours</label><Input type="number" min={0} step="0.5" value={r.labor_hours} onChange={e => edit(r.id, { labor_hours: Number(e.target.value) })} /></div>
                  <div className="md:col-span-1 flex flex-col gap-1">
                    <Select value={r.category} onValueChange={v => edit(r.id, { category: v })}>
                      <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                      <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <label className="flex items-center gap-2 text-xs"><Switch checked={r.active} onCheckedChange={v => edit(r.id, { active: v })} /> Live</label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="packages" className="space-y-4">
            <Button onClick={savePackages}><Save className="w-4 h-4 mr-2" /> Save packages</Button>
            {pkgs.map((p, i) => {
              const price = packagePrice(p, usable);
              return (
                <Card key={p.slug}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex flex-wrap items-center gap-3">
                      {p.name} <Badge variant="secondary">from {fmt(price.oneTime)} + {fmt(price.monthly)}/month</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {usable.map(m => {
                      const on = p.module_ids.includes(m.id);
                      return (
                        <Button key={m.id} size="sm" variant={on ? 'default' : 'outline'} className="text-xs"
                          onClick={() => setPkgs(ps => ps.map((x, j) => j !== i ? x : { ...x, module_ids: on ? x.module_ids.filter(id => id !== m.id) : [...x.module_ids, m.id] }))}>
                          {m.icon} {m.nameEn}
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminModules;
