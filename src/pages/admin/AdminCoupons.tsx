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
import { Plus, Trash2, TicketPercent, Pencil, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import PermissionGate from '@/components/admin/PermissionGate';

type Coupon = {
  id: string;
  code: string;
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
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10,
  applies_to: 'one_time' as 'one_time' | 'monthly' | 'both',
  currency: 'CZK',
  min_amount: 0,
  max_uses: '' as string | number,
  valid_until: '',
  is_active: true,
};

const AdminCoupons = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const upsert = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        applies_to: form.applies_to,
        currency: form.currency,
        min_amount: Number(form.min_amount) || 0,
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
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

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description ?? '',
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      applies_to: c.applies_to,
      currency: c.currency,
      min_amount: Number(c.min_amount),
      max_uses: c.max_uses ?? '',
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
    upsert.mutate();
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
        `Use it on the website calculator before checkout: https://fastmedia.pro/calculator\n\n` +
        (c.valid_until ? `Valid until ${new Date(c.valid_until).toLocaleDateString()}.\n\n` : '') +
        `— FastMedia.Pro`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <PermissionGate minRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <TicketPercent className="w-6 h-6 text-primary" />
              Discount Coupons
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create promo codes (percentage or fixed amount) customers can redeem in the website calculator before checkout.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) reset(); setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Coupon</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'New'} Coupon</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label>Code</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME10"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Launch promo for newsletter subscribers"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
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
                    <Label>Max uses (blank = unlimited)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.max_uses}
                      onChange={(e) => setForm({ ...form, max_uses: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Valid until (optional)</Label>
                  <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
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

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TicketPercent className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No coupons yet. Click "New Coupon" to create your first discount.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => {
              const valueLabel = c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} ${c.currency}`;
              const expired = c.valid_until && new Date(c.valid_until) < new Date();
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
                          {c.is_active && !expired && !exhausted ? (
                            <Badge variant="default" className="bg-emerald-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {expired ? 'Expired' : exhausted ? 'Used up' : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        {c.description && <CardDescription>{c.description}</CardDescription>}
                        <p className="text-xs text-muted-foreground">
                          Used {c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                          {c.valid_until && ` • Expires ${new Date(c.valid_until).toLocaleDateString()}`}
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
