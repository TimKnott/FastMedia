import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import LearnMoreModal from '@/components/LearnMoreModal';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search, Plus, MoreHorizontal, Phone, Mail, Clock, CalendarDays, List,
  User, StickyNote, CalendarCheck, Loader2, Send, MessageCircle, Video,
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
import type { Tables } from '@/integrations/supabase/types';

type DbBooking = Tables<'bookings'>;

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const useBookingLabels = () => {
  const { t } = useLanguage();
  const statusConfig: Record<BookingStatus, { label: string; dot: string; variant: string }> = {
    pending: { label: t('bookings.status.pending'), dot: 'bg-yellow-500', variant: 'outline' },
    confirmed: { label: t('bookings.status.confirmed'), dot: 'bg-blue-500', variant: 'secondary' },
    in_progress: { label: t('bookings.status.in_progress'), dot: 'bg-primary', variant: 'default' },
    completed: { label: t('bookings.status.completed'), dot: 'bg-green-500', variant: 'outline' },
    cancelled: { label: t('bookings.status.cancelled'), dot: 'bg-destructive', variant: 'destructive' },
  };
  const pipelineStages: { key: BookingStatus; label: string }[] = [
    { key: 'pending', label: t('bookings.status.pending') },
    { key: 'confirmed', label: t('bookings.status.confirmed') },
    { key: 'in_progress', label: t('bookings.status.in_progress') },
    { key: 'completed', label: t('bookings.status.completed') },
    { key: 'cancelled', label: t('bookings.status.cancelled') },
  ];
  return { statusConfig, pipelineStages };
};

const AdminBookings = () => {
  const { t, language } = useLanguage();
  const { statusConfig, pipelineStages } = useBookingLabels();
  const dateLocale = language === 'de' ? de : language === 'en' ? enUS : de;
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<DbBooking | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [newBooking, setNewBooking] = useState({
    customer_name: '',
    customer_email: '',
    phone: '',
    service: '',
    scheduled_at: undefined as Date | undefined,
    duration_minutes: 60,
    notes: '',
    assigned_to: '',
  });

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      setBookings(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = useMemo(() =>
    bookings.filter(b =>
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase())
    ), [bookings, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    pipelineStages.forEach(s => c[s.key] = 0);
    bookings.forEach(b => { if (c[b.status] !== undefined) c[b.status]++; });
    return c;
  }, [bookings]);

  const handleCreate = async () => {
    if (!newBooking.customer_name || !newBooking.customer_email || !newBooking.service || !newBooking.scheduled_at) {
      toast.error(t('common.required_fields'));
      return;
    }
    setSaving(true);
    const bookingId = crypto.randomUUID();
    const { error } = await supabase.from('bookings').insert({
      id: bookingId,
      customer_name: newBooking.customer_name,
      customer_email: newBooking.customer_email,
      phone: newBooking.phone || null,
      service: newBooking.service,
      scheduled_at: newBooking.scheduled_at.toISOString(),
      duration_minutes: newBooking.duration_minutes,
      notes: newBooking.notes || null,
      assigned_to: newBooking.assigned_to || null,
    });
    setSaving(false);
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      toast.success(t('common.success_created'));
      // Send booking confirmation email (fire-and-forget)
      const scheduledFormatted = newBooking.scheduled_at
        ? newBooking.scheduled_at.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'booking-confirmation',
          recipientEmail: newBooking.customer_email,
          idempotencyKey: `booking-confirm-${bookingId}`,
          templateData: {
            customerName: newBooking.customer_name,
            service: newBooking.service,
            scheduledAt: scheduledFormatted,
            durationMinutes: newBooking.duration_minutes,
            assignedTo: newBooking.assigned_to || undefined,
            notes: newBooking.notes || undefined,
          },
        },
      }).catch(() => {});
      setCreateOpen(false);
      setNewBooking({ customer_name: '', customer_email: '', phone: '', service: '', scheduled_at: undefined, duration_minutes: 60, notes: '', assigned_to: '' });
      fetchBookings();
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      if (selectedBooking?.id === bookingId) setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(t('common.success_updated'));
    }
  };

  const handleSaveNotes = async (bookingId: string, notes: string) => {
    const { error } = await supabase.from('bookings').update({ notes }).eq('id', bookingId);
    if (error) {
      toast.error(t('common.error_generic'));
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, notes } : b));
      toast.success(t('common.success_saved'));
    }
  };

  const filterByStatus = (status: BookingStatus) => filtered.filter(b => b.status === status);

  const formatDate = (iso: string) => {
    try { return format(new Date(iso), 'dd.MM.yyyy, HH:mm', { locale: dateLocale }); }
    catch { return iso; }
  };

  const formatDateShort = (iso: string) => {
    try { return format(new Date(iso), 'dd.MM.yyyy', { locale: dateLocale }); }
    catch { return iso; }
  };

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
            <h1 className="text-2xl font-display font-bold text-foreground">{t('bookings.title')}</h1>
            <LearnMoreModal
              title="Kanban Task Management"
              explanation="Visual workflow management for scheduling jobs efficiently. Drag cards between status columns, assign tasks, and track due dates."
              benefits={['Improves team coordination', 'Reduces missed appointments', 'Visual progress tracking']}
              triggerSize="md"
            />
          </div>
          <p className="text-muted-foreground mt-1">{t('bookings.subtitle')}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-1.5">
              <Plus className="w-4 h-4" /> {t('bookings.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">{t('bookings.create_title')}</DialogTitle>
              <DialogDescription>{t('bookings.create_desc')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('bookings.name_label')} *</Label>
                  <Input value={newBooking.customer_name} onChange={e => setNewBooking(p => ({ ...p, customer_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('bookings.email_label')} *</Label>
                  <Input type="email" value={newBooking.customer_email} onChange={e => setNewBooking(p => ({ ...p, customer_email: e.target.value }))} placeholder={t('bookings.email_placeholder')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('bookings.phone_label')}</Label>
                  <Input value={newBooking.phone} onChange={e => setNewBooking(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('bookings.duration_min')}</Label>
                  <Input type="number" value={newBooking.duration_minutes} onChange={e => setNewBooking(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('bookings.service_label')} *</Label>
                <Input value={newBooking.service} onChange={e => setNewBooking(p => ({ ...p, service: e.target.value }))} placeholder={t('bookings.service_placeholder')} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('bookings.appointment')} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newBooking.scheduled_at && "text-muted-foreground")}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {newBooking.scheduled_at ? format(newBooking.scheduled_at, 'PPP', { locale: dateLocale }) : t('bookings.select_date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={newBooking.scheduled_at} onSelect={d => setNewBooking(p => ({ ...p, scheduled_at: d }))} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>{t('bookings.assigned_to')}</Label>
                <Input value={newBooking.assigned_to} onChange={e => setNewBooking(p => ({ ...p, assigned_to: e.target.value }))} placeholder={t('bookings.assigned_placeholder')} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('bookings.notes')}</Label>
                <Textarea value={newBooking.notes} onChange={e => setNewBooking(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder={t('bookings.optional_notes')} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('bookings.cancel')}</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {t('bookings.create_btn')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {pipelineStages.map((stage, i) => (
          <motion.div key={stage.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${statusConfig[stage.key].dot}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stage.label}</p>
                  <p className="text-xl font-display font-bold">{counts[stage.key] ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('bookings.search')} className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display">{t('bookings.all')}</CardTitle>
          <CardDescription>{filtered.length} {t('bookings.entries')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">{t('bookings.all_tab')} ({filtered.length})</TabsTrigger>
              {pipelineStages.map(s => (
                <TabsTrigger key={s.key} value={s.key}>{s.label} ({counts[s.key] ?? 0})</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <BookingsTableView bookings={filtered} onSelect={setSelectedBooking} formatDate={formatDateShort} />
            </TabsContent>
            {pipelineStages.map(s => (
              <TabsContent key={s.key} value={s.key} className="mt-4">
                <BookingsTableView bookings={filterByStatus(s.key)} onSelect={setSelectedBooking} formatDate={formatDateShort} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <BookingDetailSheet
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        onSaveNotes={handleSaveNotes}
        formatDate={formatDate}
      />
    </div>
  );
};

/* ── Table sub-component ── */
const BookingsTableView = ({ bookings, onSelect, formatDate }: { bookings: DbBooking[]; onSelect: (b: DbBooking) => void; formatDate: (iso: string) => string }) => {
  const { statusConfig, pipelineStages } = useBookingLabels();
  const { t } = useLanguage();
  return (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('bookings.customer')}</TableHead>
          <TableHead>{t('bookings.service')}</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>{t('bookings.appointment')}</TableHead>
          <TableHead>{t('bookings.duration')}</TableHead>
          <TableHead>{t('bookings.assigned')}</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('bookings.none')}</TableCell>
          </TableRow>
        )}
        {bookings.map(b => {
          const sc = statusConfig[b.status as BookingStatus] ?? statusConfig.pending;
          return (
            <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelect(b)}>
              <TableCell>
                <p className="font-medium text-sm">{b.customer_name}</p>
                <p className="text-xs text-muted-foreground">{b.customer_email}</p>
              </TableCell>
              <TableCell className="text-sm max-w-[200px] truncate">{b.service}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  <span className="text-sm">{sc.label}</span>
                </span>
              </TableCell>
              <TableCell className="text-sm">{formatDate(b.scheduled_at)}</TableCell>
              <TableCell className="text-sm">{b.duration_minutes} {t('bookings.min')}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{b.assigned_to || '—'}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onSelect(b); }}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
  );
};

/* ── Detail Sheet sub-component ── */
const BookingDetailSheet = ({
  booking, onClose, onStatusChange, onSaveNotes, formatDate,
}: {
  booking: DbBooking | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  formatDate: (iso: string) => string;
}) => {
  const { t } = useLanguage();
  const { statusConfig, pipelineStages } = useBookingLabels();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (booking) setNotes(booking.notes ?? '');
  }, [booking]);

  if (!booking) return null;

  const sc = statusConfig[booking.status as BookingStatus] ?? statusConfig.pending;

  return (
    <Sheet open={!!booking} onOpenChange={open => !open && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{booking.customer_name}</SheetTitle>
          <SheetDescription>
            <Badge variant={sc.variant as any} className="text-xs">{sc.label}</Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t('bookings.contact')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> <span>{booking.customer_email}</span>
              </div>
              {booking.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" /> <span>{booking.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t('bookings.details')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">{t('bookings.service')}</p>
                <p className="font-medium">{booking.service}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{t('bookings.duration')}</p>
                <p className="font-medium">{booking.duration_minutes} {t('bookings.minutes')}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t('bookings.appointment')}</p>
                  <p className="font-medium">{formatDate(booking.scheduled_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">{t('bookings.created')}</p>
                  <p className="font-medium">{formatDate(booking.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{t('bookings.assigned_to')}</p>
                <p className="font-medium">{booking.assigned_to || '—'}</p>
              </div>
              {booking.lead_id && (
                <div>
                  <p className="text-muted-foreground text-xs">Lead-ID</p>
                  <p className="font-medium font-mono text-xs">{booking.lead_id.slice(0, 8)}…</p>
                </div>
              )}
            </div>
          </div>

          {/* Status change */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t('bookings.change_status')}</h3>
            <Select value={booking.status} onValueChange={v => onStatusChange(booking.id, v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {pipelineStages.map(s => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <StickyNote className="w-4 h-4" /> {t('bookings.notes')}
            </h3>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder={t('bookings.notes_placeholder')} />
          </div>

          {/* Email task to team */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Send className="w-4 h-4" /> {t('bookings.email_task')}
            </h3>
            <div className="space-y-2">
                <Input
                placeholder={t('bookings.email_recipient')}
                id="task-email-recipient"
              />
              <Button
                variant="secondary"
                className="w-full gap-1.5"
                onClick={async () => {
                  const emailInput = document.getElementById('task-email-recipient') as HTMLInputElement;
                  const recipientEmail = emailInput?.value?.trim();
                  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
                    toast.error(t('bookings.invalid_email'));
                    return;
                  }
                  try {
                    await supabase.functions.invoke('send-transactional-email', {
                      body: {
                        templateName: 'kanban-task-assignment',
                        recipientEmail,
                        idempotencyKey: `kanban-task-${booking.id}-${Date.now()}`,
                        templateData: {
                          customerName: booking.customer_name,
                          service: booking.service,
                          status: sc.label,
                          scheduledAt: formatDate(booking.scheduled_at),
                          notes: booking.notes || undefined,
                        },
                      },
                    });
                    toast.success(t('bookings.email_sent'));
                    emailInput.value = '';
                  } catch {
                    toast.error(t('bookings.email_send_error'));
                  }
                }}
              >
                <Send className="w-4 h-4" /> {t('bookings.send_task')}
              </Button>
            </div>
          </div>

          {/* WhatsApp meeting link */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </h3>
            <Button
              variant="outline"
              className="w-full gap-1.5 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={() => {
                const phone = booking.phone ? booking.phone.replace(/\D/g, '') : '';
                const message = `Hi ${booking.customer_name},\n\nYour meeting with FastMedia.Pro is confirmed!\n\n📅 Date: ${formatDate(booking.scheduled_at)}\n⏱ Duration: ${booking.duration_minutes} min\n🔧 Service: ${booking.service}\n\nIf you need to reschedule, please let us know.\n\nBest regards,\nFastMedia.Pro`;
                const url = phone
                  ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                  : `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
              }}
            >
              <MessageCircle className="w-4 h-4" /> Send via WhatsApp
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="gradient-primary text-primary-foreground flex-1" onClick={() => onSaveNotes(booking.id, notes)}>{t('bookings.save')}</Button>
            <Button variant="outline" onClick={onClose}>{t('bookings.close')}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminBookings;
