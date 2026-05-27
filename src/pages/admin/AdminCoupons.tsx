import { useState, useMemo } from 'react';
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
import { Plus, Trash2, TicketPercent, Pencil, Copy, Mail, Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';
import PermissionGate from '@/components/admin/PermissionGate';

type Coupon = {
  id: string;
  code: string;
  campaign_name: string | null;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applies_to: 'one_time' | 'monthly' | 'both';
  currency: string;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
};

const emptyForm = {
  code: '',
  campaign_name: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10,
  applies_to: 'one_time' as 'one_time' | 'monthly' | 'both',
  currency: 'CZK',
  min_amount: 0,
  max_uses: '' as string | number,
  valid_from: '',
  valid_until: '',
  is_active: true,
};

// Crypto-safe random code generator. Avoids confusing chars (0/O, 1/I, L).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generateCode = (prefix = '', length = 8): string => {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let core = '';
  for (let i = 0; i < length; i++) core += ALPHABET[bytes[i] % ALPHABET.length];
  const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  return cleanPrefix ? `${cleanPrefix}-${core}` : core;
};

const AdminCoupons = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [genPrefix, setGenPrefix] = useState('');
  const [genLength, setGenLength] = useState(8);
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const campaigns = useMemo(() => {
    const set = new Set<string>();
    coupons.forEach((c) => c.campaign_name && set.add(c.campaign_name));
    return Array.from(set).sort();
  }, [coupons]);

  const filtered = useMemo(() => {
    if (campaignFilter === 'all') return coupons;
    if (campaignFilter === '__none__') return coupons.filter((c) => !c.campaign_name);
    return coupons.filter((c) => c.campaign_name === campaignFilter);
  }, [coupons, campaignFilter]);

  const upsert = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        campaign_name: form.campaign_name.trim() || null,
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        applies_to: form.applies_to,
        currency: form.currency,
        min_amount: Number(form.min_amount) || 0,
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        is_active: form.is_active,
      };
      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const openNew = () => {
    setForm({ ...emptyForm, valid_from: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      campaign_name: c.campaign_name ?? '',
      description: c.description ?? '',
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      applies_to: c.applies_to,
      currency: c.currency,
      min_amount: Number(c.min_amount),
      max_uses: c.max_uses ?? '',
      valid_from: c.valid_from ? c.valid_from.slice(0, 10) : '',
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : '',
      is_active: c.is_active,
    });
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Code is required');
    if (!form.discount_value || Number(form.discount_value) <= 0) return toast.error('Discount must be > 0');
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100)
      return toast.error('Percentage cannot exceed 100');
    if (form.valid_from && form.valid_until && new Date(form.valid_until) <= new Date(form.valid_from))
      return toast.error('End date must be after start date');
    upsert.mutate();
  };

  const handleGenerate = () => {
    const prefix = genPrefix || form.campaign_name;
    setForm({ ...form, code: generateCode(prefix, genLength) });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code}`);
  };

  const emailCoupon = (c: Coupon) => {
    const subject = encodeURIComponent(`Your discount code: ${c.code}`);
    const valueLabel = c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} ${c.currency}`;
    const body = encodeURIComponent(
      `Hi,\n\nHere is your exclusive discount code for FastMedia.Pro:\n\n` +
        `   ${c.code}   (${valueLabel} off)\n\n` +
        (c.campaign_name ? `Campaign: ${c.campaign_name}\n` : '') +
        `Use it on the website calculator before checkout: https://fastmedia.pro/calculator\n\n` +
        (c.valid_until ? `Valid until ${new Date(c.valid_until).toLocaleDateString()}.\n\n` : '') +
        `— FastMedia.Pro`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <PermissionGate minRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <TicketPercent className="w-6 h-6 text-primary" />
              Discount Coupons & Campaigns
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create promo codes by hand or generate randomised ones, tag them under a campaign, and set a start &amp; end date.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) reset(); setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New Coupon</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'New'} Coupon</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                {/* Code generator block */}
                {!editingId && (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-3 space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Random code generator
                      </Label>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Prefix (optional)</Label>
                          <Input
                            value={genPrefix}
                            onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                            placeholder="BLACKFRI"
                            className="font-mono h-9"
                            maxLength={10}
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs">Length</Label>
                          <Input
                            type="number"
                            min={4}
                            max={16}
                            value={genLength}
                            onChange={(e) => setGenLength(Math.max(4, Math.min(16, Number(e.target.value) || 8)))}
                            className="h-9"
                          />
                        </div>
                        <Button type="button" variant="secondary" onClick={handleGenerate} className="h-9">
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label>Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME10 or click Generate"
                      className="font-mono"
                    />
                    {form.code && (
                      <Button type="button" variant="outline" size="icon" onClick={() => copyCode(form.code)} title="Copy">
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1"><Tag className="w-3 h-3" /> Campaign name</Label>
                  <Input
                    value={form.campaign_name}
                    onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
                    placeholder="Black Friday 2026"
                    list="existing-campaigns"
                  />
                  <datalist id="existing-campaigns">
                    {campaigns.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <Label>Description (internal note)</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Launch promo for newsletter subscribers"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount type</Label>
                    <Select value={form.discount_type} onValueChange={(v: 'percentage' | 'fixed') => setForm({ ...form, discount_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      min="0"
                      step={form.discount_type === 'percentage' ? '1' : '100'}
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Applies to</Label>
                    <Select value={form.applies_to} onValueChange={(v: any) => setForm({ ...form, applies_to: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One-time price</SelectItem>
                        <SelectItem value="monthly">Monthly price</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CZK">CZK</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Minimum order amount</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.min_amount}
                      onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Usage limit (blank = unlimited)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.max_uses}
                      onChange={(e) => setForm({ ...form, max_uses: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start date</Label>
                    <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
                  </div>
                  <div>
                    <Label>End date (optional)</Label>
                    <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={reset}>Cancel</Button>
                  <Button type="submit" disabled={upsert.isPending}>
                    {upsert.isPending ? 'Saving…' : editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {campaigns.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Campaign:</span>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({coupons.length})</SelectItem>
                <SelectItem value="__none__">No campaign</SelectItem>
                {campaigns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TicketPercent className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No coupons yet. Click "New Coupon" to create your first discount.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const valueLabel = c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} ${c.currency}`;
              const expired = c.valid_until && new Date(c.valid_until) < new Date();
              const notYetStarted = c.valid_from && new Date(c.valid_from) > new Date();
              const exhausted = c.max_uses != null && c.used_count >= c.max_uses;
              return (
                <Card key={c.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base font-mono">{c.code}</CardTitle>
                          <Badge variant="default">{valueLabel} off</Badge>
                          <Badge variant="outline">{c.applies_to.replace('_', ' ')}</Badge>
                          {c.campaign_name && (
                            <Badge variant="secondary" className="gap-1"><Tag className="w-3 h-3" />{c.campaign_name}</Badge>
                          )}
                          {c.is_active && !expired && !exhausted && !notYetStarted ? (
                            <Badge variant="default" className="bg-emerald-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {expired ? 'Expired' : exhausted ? 'Used up' : notYetStarted ? 'Scheduled' : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        {c.description && <CardDescription>{c.description}</CardDescription>}
                        <p className="text-xs text-muted-foreground">
                          Used {c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                          {c.valid_from && ` • Starts ${new Date(c.valid_from).toLocaleDateString()}`}
                          {c.valid_until && ` • Ends ${new Date(c.valid_until).toLocaleDateString()}`}
                          {c.min_amount > 0 && ` • Min ${c.min_amount} ${c.currency}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" title="Copy code" onClick={() => copyCode(c.code)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Email this coupon" onClick={() => emailCoupon(c)}>
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={c.is_active}
                          onCheckedChange={(is_active) => toggle.mutate({ id: c.id, is_active })}
                        />
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { if (confirm(`Delete coupon ${c.code}?`)) del.mutate(c.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PermissionGate>
  );
};

export default AdminCoupons;
