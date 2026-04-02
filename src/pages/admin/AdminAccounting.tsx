import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { cs, enUS, de } from 'date-fns/locale';
import LearnMoreModal from '@/components/LearnMoreModal';
import { motion } from 'framer-motion';
import {
  Search, Plus, FileText, RefreshCw, Euro, Clock, CheckCircle2, XCircle,
  Send, Loader2, MoreHorizontal, CalendarDays, Repeat, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string | null;
  lead_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RecurringInvoice {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  frequency: string;
  next_invoice_at: string;
  last_invoiced_at: string | null;
  is_active: boolean;
  booking_id: string | null;
  notes: string | null;
  created_at: string;
}

const AdminAccounting = () => {
  const { t, language } = useLanguage();

  const dateFnsLocale = language === 'de' ? de : language === 'en' ? enUS : cs;

  const statusConfig: Record<InvoiceStatus, { label: string; dot: string; variant: string }> = {
    draft: { label: t('accounting.status.draft'), dot: 'bg-muted-foreground', variant: 'outline' },
    sent: { label: t('accounting.status.sent'), dot: 'bg-blue-500', variant: 'secondary' },
    paid: { label: t('accounting.status.paid'), dot: 'bg-green-500', variant: 'default' },
    overdue: { label: t('accounting.status.overdue'), dot: 'bg-destructive', variant: 'destructive' },
    cancelled: { label: t('accounting.status.cancelled'), dot: 'bg-muted-foreground', variant: 'outline' },
  };

  const frequencyLabels: Record<string, string> = {
    daily: t('accounting.daily'),
    weekly: t('accounting.weekly'),
    monthly: t('accounting.monthly_freq'),
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recurring, setRecurring] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createRecurringOpen, setCreateRecurringOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    item_description: '',
    item_quantity: 1,
    item_unit_price: 0,
    tax_rate: 21,
    due_at: undefined as Date | undefined,
    notes: '',
  });

  const [newRecurring, setNewRecurring] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    item_description: '',
    item_quantity: 1,
    item_unit_price: 0,
    tax_rate: 21,
    frequency: 'monthly',
    notes: '',
  });

  const fetchData = async () => {
    const [invRes, recRes] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('recurring_invoices').select('*').order('created_at', { ascending: false }),
    ]);
    if (invRes.error) toast.error(t('common.error_generic'));
    else setInvoices((invRes.data ?? []) as unknown as Invoice[]);
    if (recRes.error) toast.error(t('common.error_generic'));
    else setRecurring((recRes.data ?? []) as unknown as RecurringInvoice[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() =>
    invoices.filter(inv =>
      inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_email.toLowerCase().includes(search.toLowerCase())
    ), [invoices, search]);

  const stats = useMemo(() => {
    const total = invoices.reduce((s, i) => s + Number(i.total), 0);
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0);
    const outstanding = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + Number(i.total), 0);
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    return { total, paid, outstanding, overdue };
  }, [invoices]);

  const generateInvoiceNumber = () => {
    const d = new Date();
    const prefix = `FM-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const seq = String(invoices.length + 1).padStart(4, '0');
    return `${prefix}-${seq}`;
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer_name || !newInvoice.customer_email || !newInvoice.item_description || newInvoice.item_unit_price <= 0) {
      toast.error(t('common.required_fields'));
      return;
    }
    setSaving(true);
    const itemTotal = newInvoice.item_quantity * newInvoice.item_unit_price;
    const taxAmount = itemTotal * (newInvoice.tax_rate / 100);
    const total = itemTotal + taxAmount;
    const items = [{ description: newInvoice.item_description, quantity: newInvoice.item_quantity, unit_price: newInvoice.item_unit_price, total: itemTotal }];

    const { error } = await supabase.from('invoices').insert({
      invoice_number: generateInvoiceNumber(),
      customer_name: newInvoice.customer_name,
      customer_email: newInvoice.customer_email,
      customer_address: newInvoice.customer_address || null,
      items: items as any,
      subtotal: itemTotal,
      tax_rate: newInvoice.tax_rate,
      tax_amount: taxAmount,
      total,
      due_at: newInvoice.due_at?.toISOString() ?? null,
      notes: newInvoice.notes || null,
    });
    setSaving(false);
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      toast.success(t('common.success_created'));
      setCreateOpen(false);
      setNewInvoice({ customer_name: '', customer_email: '', customer_address: '', item_description: '', item_quantity: 1, item_unit_price: 0, tax_rate: 21, due_at: undefined, notes: '' });
      fetchData();
    }
  };

  const handleCreateRecurring = async () => {
    if (!newRecurring.customer_name || !newRecurring.customer_email || !newRecurring.item_description || newRecurring.item_unit_price <= 0) {
      toast.error(t('common.required_fields'));
      return;
    }
    setSaving(true);
    const itemTotal = newRecurring.item_quantity * newRecurring.item_unit_price;
    const taxAmount = itemTotal * (newRecurring.tax_rate / 100);
    const total = itemTotal + taxAmount;
    const items = [{ description: newRecurring.item_description, quantity: newRecurring.item_quantity, unit_price: newRecurring.item_unit_price, total: itemTotal }];

    const { error } = await supabase.from('recurring_invoices').insert({
      customer_name: newRecurring.customer_name,
      customer_email: newRecurring.customer_email,
      customer_address: newRecurring.customer_address || null,
      items: items as any,
      subtotal: itemTotal,
      tax_rate: newRecurring.tax_rate,
      tax_amount: taxAmount,
      total,
      frequency: newRecurring.frequency,
      notes: newRecurring.notes || null,
    });
    setSaving(false);
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      toast.success(t('common.success_created'));
      setCreateRecurringOpen(false);
      setNewRecurring({ customer_name: '', customer_email: '', customer_address: '', item_description: '', item_quantity: 1, item_unit_price: 0, tax_rate: 21, frequency: 'monthly', notes: '' });
      fetchData();
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();
    const { error } = await supabase.from('invoices').update(updates).eq('id', invoiceId);
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updates } : i));
      if (selectedInvoice?.id === invoiceId) setSelectedInvoice(prev => prev ? { ...prev, ...updates } : null);
      toast.success(t('common.success_updated'));
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    const { error } = await supabase.from('recurring_invoices').delete().eq('id', id);
    if (error) toast.error(t('common.error_generic'));
    else { toast.success(t('common.deleted')); fetchData(); }
  };

  const handleToggleRecurring = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('recurring_invoices').update({ is_active: !isActive }).eq('id', id);
    if (error) toast.error(t('common.error_generic'));
    else { toast.success(isActive ? t('common.deactivated') : t('common.activated')); fetchData(); }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try { return format(new Date(iso), 'dd.MM.yyyy', { locale: dateFnsLocale }); }
    catch { return iso; }
  };

  const formatCurrency = (amount: number, currency = 'CZK') =>
    new Intl.NumberFormat(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'cs-CZ', { style: 'currency', currency }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-foreground">{t('accounting.title')}</h1>
            <LearnMoreModal
              title="Invoicing & Payment Tracking"
              explanation="Generate invoices, track payments received/outstanding, and manage recurring billing — all from one dashboard."
              benefits={['Keeps finances organized', 'Reduces errors', 'Improves cash flow visibility']}
              triggerSize="md"
            />
          </div>
          <p className="text-muted-foreground mt-1">{t('accounting.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createRecurringOpen} onOpenChange={setCreateRecurringOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1.5">
                <Repeat className="w-4 h-4" /> {t('accounting.recurring')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">{t('accounting.create_recurring')}</DialogTitle>
                <DialogDescription>{t('accounting.create_recurring_desc')}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('accounting.customer')} *</Label>
                    <Input value={newRecurring.customer_name} onChange={e => setNewRecurring(p => ({ ...p, customer_name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('common.email')} *</Label>
                    <Input type="email" value={newRecurring.customer_email} onChange={e => setNewRecurring(p => ({ ...p, customer_email: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.address')}</Label>
                  <Input value={newRecurring.customer_address} onChange={e => setNewRecurring(p => ({ ...p, customer_address: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.service_item')} *</Label>
                  <Input value={newRecurring.item_description} onChange={e => setNewRecurring(p => ({ ...p, item_description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('accounting.quantity')}</Label>
                    <Input type="number" min={1} value={newRecurring.item_quantity} onChange={e => setNewRecurring(p => ({ ...p, item_quantity: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('accounting.price')} *</Label>
                    <Input type="number" min={0} value={newRecurring.item_unit_price} onChange={e => setNewRecurring(p => ({ ...p, item_unit_price: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('accounting.vat')}</Label>
                    <Input type="number" min={0} value={newRecurring.tax_rate} onChange={e => setNewRecurring(p => ({ ...p, tax_rate: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.frequency')} *</Label>
                  <Select value={newRecurring.frequency} onValueChange={v => setNewRecurring(p => ({ ...p, frequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('accounting.daily')}</SelectItem>
                      <SelectItem value="weekly">{t('accounting.weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('accounting.monthly_freq')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.notes')}</Label>
                  <Textarea value={newRecurring.notes} onChange={e => setNewRecurring(p => ({ ...p, notes: e.target.value }))} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateRecurringOpen(false)}>{t('common.cancel')}</Button>
                <Button className="gradient-primary text-primary-foreground" onClick={handleCreateRecurring} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />} {t('common.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-1.5">
                <Plus className="w-4 h-4" /> {t('accounting.new_invoice')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">{t('accounting.create_invoice')}</DialogTitle>
                <DialogDescription>{t('accounting.create_invoice_desc')}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('accounting.customer')} *</Label>
                    <Input value={newInvoice.customer_name} onChange={e => setNewInvoice(p => ({ ...p, customer_name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('common.email')} *</Label>
                    <Input type="email" value={newInvoice.customer_email} onChange={e => setNewInvoice(p => ({ ...p, customer_email: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.address')}</Label>
                  <Input value={newInvoice.customer_address} onChange={e => setNewInvoice(p => ({ ...p, customer_address: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.service_item')} *</Label>
                  <Input value={newInvoice.item_description} onChange={e => setNewInvoice(p => ({ ...p, item_description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('accounting.quantity')}</Label>
                    <Input type="number" min={1} value={newInvoice.item_quantity} onChange={e => setNewInvoice(p => ({ ...p, item_quantity: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('accounting.price')} *</Label>
                    <Input type="number" min={0} value={newInvoice.item_unit_price} onChange={e => setNewInvoice(p => ({ ...p, item_unit_price: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('accounting.vat')}</Label>
                    <Input type="number" min={0} value={newInvoice.tax_rate} onChange={e => setNewInvoice(p => ({ ...p, tax_rate: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.due_date')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newInvoice.due_at && "text-muted-foreground")}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newInvoice.due_at ? format(newInvoice.due_at, 'PPP', { locale: dateFnsLocale }) : t('common.select_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newInvoice.due_at} onSelect={d => setNewInvoice(p => ({ ...p, due_at: d }))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('accounting.notes')}</Label>
                  <Textarea value={newInvoice.notes} onChange={e => setNewInvoice(p => ({ ...p, notes: e.target.value }))} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
                <Button className="gradient-primary text-primary-foreground" onClick={handleCreateInvoice} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />} {t('common.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('accounting.total'), value: formatCurrency(stats.total), icon: FileText, dot: 'bg-primary' },
          { label: t('accounting.paid'), value: formatCurrency(stats.paid), icon: CheckCircle2, dot: 'bg-green-500' },
          { label: t('accounting.outstanding'), value: formatCurrency(stats.outstanding), icon: Clock, dot: 'bg-blue-500' },
          { label: t('accounting.overdue'), value: String(stats.overdue), icon: XCircle, dot: 'bg-destructive' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-display font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs: Invoices & Recurring */}
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-1.5"><FileText className="w-4 h-4" /> {t('accounting.invoices')} ({invoices.length})</TabsTrigger>
          <TabsTrigger value="recurring" className="gap-1.5"><Repeat className="w-4 h-4" /> {t('accounting.recurring')} ({recurring.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('accounting.search')} className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('accounting.nr')}</TableHead>
                      <TableHead>{t('accounting.customer')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-right">{t('accounting.amount')}</TableHead>
                      <TableHead>{t('accounting.issued')}</TableHead>
                      <TableHead>{t('accounting.due')}</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('accounting.no_invoices')}</TableCell>
                      </TableRow>
                    )}
                    {filtered.map(inv => {
                      const sc = statusConfig[inv.status as InvoiceStatus] ?? statusConfig.draft;
                      return (
                        <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedInvoice(inv)}>
                          <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{inv.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{inv.customer_email}</p>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                              <span className="text-sm">{sc.label}</span>
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">{formatCurrency(Number(inv.total), inv.currency)}</TableCell>
                          <TableCell className="text-sm">{formatDate(inv.issued_at)}</TableCell>
                          <TableCell className="text-sm">{formatDate(inv.due_at)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setSelectedInvoice(inv); }}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">{t('accounting.recurring_invoices')}</CardTitle>
              <CardDescription>{t('accounting.recurring_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('accounting.customer')}</TableHead>
                      <TableHead>{t('accounting.frequency')}</TableHead>
                      <TableHead className="text-right">{t('accounting.amount')}</TableHead>
                      <TableHead>{t('accounting.next')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recurring.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('accounting.no_recurring')}</TableCell>
                      </TableRow>
                    )}
                    {recurring.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{r.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{r.customer_email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{frequencyLabels[r.frequency] ?? r.frequency}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">{formatCurrency(Number(r.total), r.currency)}</TableCell>
                        <TableCell className="text-sm">{formatDate(r.next_invoice_at)}</TableCell>
                        <TableCell>
                          <Badge variant={r.is_active ? 'default' : 'outline'} className="text-xs">
                            {r.is_active ? t('accounting.active') : t('accounting.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleRecurring(r.id, r.is_active)}>
                              {r.is_active ? <XCircle className="w-4 h-4 text-muted-foreground" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteRecurring(r.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Sheet */}
      <Sheet open={!!selectedInvoice} onOpenChange={open => !open && setSelectedInvoice(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedInvoice && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{t('accounting.invoice')} {selectedInvoice.invoice_number}</SheetTitle>
                <SheetDescription>
                  <Badge variant={statusConfig[selectedInvoice.status as InvoiceStatus]?.variant as any} className="text-xs">
                    {statusConfig[selectedInvoice.status as InvoiceStatus]?.label ?? selectedInvoice.status}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{t('accounting.customer')}</h3>
                  <p className="text-sm">{selectedInvoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customer_email}</p>
                  {selectedInvoice.customer_address && <p className="text-sm text-muted-foreground">{selectedInvoice.customer_address}</p>}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{t('accounting.items')}</h3>
                  {(selectedInvoice.items as InvoiceItem[]).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b border-border pb-2">
                      <div>
                        <p>{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">{t('accounting.subtotal')}</span>
                    <span>{formatCurrency(Number(selectedInvoice.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('accounting.vat')} ({selectedInvoice.tax_rate}%)</span>
                    <span>{formatCurrency(Number(selectedInvoice.tax_amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                    <span>{t('accounting.total')}</span>
                    <span>{formatCurrency(Number(selectedInvoice.total), selectedInvoice.currency)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{t('accounting.dates')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">{t('accounting.issued')}</span>
                    <span>{formatDate(selectedInvoice.issued_at)}</span>
                    <span className="text-muted-foreground">{t('accounting.due')}</span>
                    <span>{formatDate(selectedInvoice.due_at)}</span>
                    <span className="text-muted-foreground">{t('accounting.paid')}</span>
                    <span>{formatDate(selectedInvoice.paid_at)}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">{t('accounting.notes')}</h3>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{t('accounting.change_status')}</h3>
                  <Select value={selectedInvoice.status} onValueChange={v => handleStatusChange(selectedInvoice.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t('accounting.status.draft')}</SelectItem>
                      <SelectItem value="sent">{t('accounting.status.sent')}</SelectItem>
                      <SelectItem value="paid">{t('accounting.status.paid')}</SelectItem>
                      <SelectItem value="overdue">{t('accounting.status.overdue')}</SelectItem>
                      <SelectItem value="cancelled">{t('accounting.status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminAccounting;
