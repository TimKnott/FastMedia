import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, MoreHorizontal, Mail, Phone, MapPin, StickyNote,
  Calendar as CalendarIcon, Clock, LayoutGrid, List, CalendarDays,
  TrendingUp, User, Flame, Snowflake, Zap, Plus, Send as SendIcon, X, Tag
} from 'lucide-react';
import LearnMoreModal from '@/components/LearnMoreModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type LeadClassification = 'cold' | 'warm' | 'hot' | 'high_priority';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  trade: string;
  score: number;
  classification: LeadClassification;
  status: LeadStatus;
  assigned_to: string | null;
  selected_features: any[];
  special_request: string | null;
  quote_one_time: number;
  quote_monthly: number;
  labor_hours: number;
  ai_analysis: any;
  source: string;
  language: string;
  gdpr_consent: boolean;
  created_at: string;
  updated_at: string;
}

interface LeadNote {
  id: string;
  content: string;
  created_at: string;
}

interface LeadActivity {
  id: string;
  activity_type: string;
  description: string;
  performed_by: string;
  created_at: string;
}

const classificationConfig: Record<LeadClassification, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  cold: { label: 'Cold', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  warm: { label: 'Warm', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  hot: { label: 'Hot', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  high_priority: { label: 'High Priority', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const AdminLeads = () => {
  const { t, language } = useLanguage();

  const statusConfig: Record<LeadStatus, { label: string; dot: string }> = {
    new: { label: t('leads.status.new'), dot: 'bg-blue-400' },
    contacted: { label: t('leads.status.contacted'), dot: 'bg-amber-400' },
    qualified: { label: t('leads.status.qualified'), dot: 'bg-purple-400' },
    converted: { label: t('leads.status.converted'), dot: 'bg-green-500' },
    lost: { label: t('leads.status.lost'), dot: 'bg-muted-foreground' },
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setLeads(data as unknown as Lead[]);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  // Fetch notes & activities when lead selected
  useEffect(() => {
    if (!selectedLead) return;
    const fetchDetails = async () => {
      const [notesRes, activitiesRes] = await Promise.all([
        supabase.from('lead_notes').select('id, content, created_at').eq('lead_id', selectedLead.id).order('created_at', { ascending: false }),
        supabase.from('lead_activities').select('id, activity_type, description, performed_by, created_at').eq('lead_id', selectedLead.id).order('created_at', { ascending: false }),
      ]);
      if (notesRes.data) setNotes(notesRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
    };
    fetchDetails();
  }, [selectedLead?.id]);

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.trade.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);

      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'status_changed',
        description: `Status changed to ${statusConfig[newStatus].label}`,
        performed_by: 'admin',
      });
    }
  };

  const handleAssign = async (leadId: string, assignee: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: assignee || null })
      .eq('id', leadId);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assigned_to: assignee || null } : l));
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    setSavingNote(true);
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;
    if (!userId) { setSavingNote(false); return; }

    const { data, error } = await supabase
      .from('lead_notes')
      .insert({ lead_id: selectedLead.id, author_id: userId, content: newNote.trim() })
      .select('id, content, created_at')
      .single();
    if (!error && data) {
      setNotes(prev => [data, ...prev]);
      setNewNote('');
      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: selectedLead.id,
        activity_type: 'note_added',
        description: `Note added: "${newNote.trim().substring(0, 50)}..."`,
        performed_by: 'admin',
      });
    }
    setSavingNote(false);
  };

  const statCounts = {
    total: leads.length,
    hot: leads.filter(l => l.classification === 'hot' || l.classification === 'high_priority').length,
    new: leads.filter(l => l.status === 'new').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('leads.title')}</h1>
        <LearnMoreModal
          title="Customer Relationship Management (CRM)"
          explanation="Organize customer data for personalized communication and service quality improvements. Track lead scoring, service history, and conversion funnels."
          benefits={['Drives customer loyalty', 'Improves retention rates', 'Enables personalized outreach']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground mt-1">{t('leads.subtitle')}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('leads.total'), value: statCounts.total, icon: User },
          { label: t('leads.hot_priority'), value: statCounts.hot, icon: Flame },
          { label: t('leads.status.new'), value: statCounts.new, icon: TrendingUp },
          { label: t('leads.status.converted'), value: statCounts.converted, icon: Zap },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-display font-bold">{loading ? '…' : stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('leads.search')}
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Leads table */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display">{t('leads.all')}</CardTitle>
          <CardDescription>{filtered.length} {t('leads.entries')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('leads.trade')}</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>{t('leads.classification')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('leads.quote')}</TableHead>
                  <TableHead>{t('common.created')}</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      {t('leads.loading')}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      {t('leads.none')}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((lead) => {
                  const cls = classificationConfig[lead.classification];
                  const ClsIcon = cls.icon;
                  return (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLead(lead)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{lead.trade}</TableCell>
                      <TableCell>
                        <span className="text-sm font-bold">{lead.score}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${cls.bg} ${cls.color}`}>
                          <ClsIcon className="w-3 h-3" />
                          {cls.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className={`w-2 h-2 rounded-full ${statusConfig[lead.status].dot}`} />
                          {statusConfig[lead.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{lead.quote_one_time.toLocaleString(language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : 'cs-CZ')} Kč</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'dd.MM.yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}>
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

      {/* Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => { if (!open) { setSelectedLead(null); setNotes([]); setActivities([]); } }}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedLead && (() => {
            const cls = classificationConfig[selectedLead.classification];
            const ClsIcon = cls.icon;
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="font-display flex items-center gap-3">
                    {selectedLead.name}
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cls.bg} ${cls.color}`}>
                      <ClsIcon className="w-3 h-3" />
                      {selectedLead.score}/100
                    </span>
                  </SheetTitle>
                  <SheetDescription>{selectedLead.email}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Customer Profile Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {selectedLead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-foreground">{selectedLead.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{selectedLead.trade} • {selectedLead.source} • {selectedLead.language.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge className="text-[10px]" variant="secondary">{selectedLead.classification}</Badge>
                      <Badge className="text-[10px]" variant="outline">{selectedLead.status}</Badge>
                      {selectedLead.score >= 70 && <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">⚡ High Value</Badge>}
                      {selectedLead.quote_monthly > 2000 && <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-200">💰 Premium</Badge>}
                      {selectedLead.gdpr_consent !== false && <Badge className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-200">✓ GDPR</Badge>}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">{t('leads.contact')}</h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />{selectedLead.email}
                      </div>
                      {selectedLead.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />{selectedLead.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        {t('leads.created')}: {format(new Date(selectedLead.created_at), 'dd.MM.yyyy HH:mm')}
                      </div>
                      {selectedLead.assigned_to && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />{t('leads.assigned')}: {selectedLead.assigned_to}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Preferences / Tags */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      {t('leads.profile')}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('leads.language_label')}</p>
                        <p className="font-medium">{selectedLead.language === 'cs' ? '🇨🇿 Čeština' : selectedLead.language === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('leads.source_label')}</p>
                        <p className="font-medium capitalize">{selectedLead.source}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lead Score</p>
                        <p className="font-medium">{selectedLead.score}/100</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('leads.trade_label')}</p>
                        <p className="font-medium capitalize">{selectedLead.trade}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quote details */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Angebotsdaten</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Gewerk</p>
                        <p className="font-medium capitalize">{selectedLead.trade}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Einmalkosten</p>
                        <p className="font-medium">{selectedLead.quote_one_time.toLocaleString('de-DE')} Kč</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Monatlich</p>
                        <p className="font-medium">{selectedLead.quote_monthly.toLocaleString('de-DE')} Kč/Mon.</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Arbeitsstunden</p>
                        <p className="font-medium">{selectedLead.labor_hours} Std</p>
                      </div>
                    </div>
                    {selectedLead.selected_features && selectedLead.selected_features.length > 0 && (
                      <div className="mt-2">
                        <p className="text-muted-foreground text-xs mb-1">Features</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedLead.selected_features as any[]).map((f: any) => (
                            <Badge key={f.id} variant="secondary" className="text-xs">
                              {f.id} {f.quantity > 1 ? `x${f.quantity}` : ''}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedLead.special_request && (
                      <div className="mt-2">
                        <p className="text-muted-foreground text-xs">Sonderwunsch</p>
                        <p className="text-sm mt-1 p-2 rounded bg-muted/50">{selectedLead.special_request}</p>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  {selectedLead.ai_analysis && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-primary" />
                        AI-Analyse
                      </h3>
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm space-y-2">
                        {selectedLead.ai_analysis.summary && (
                          <p>{selectedLead.ai_analysis.summary}</p>
                        )}
                        {selectedLead.ai_analysis.recommended_approach && (
                          <p className="text-muted-foreground text-xs"><strong>Strategie:</strong> {selectedLead.ai_analysis.recommended_approach}</p>
                        )}
                        {selectedLead.ai_analysis.upsell_opportunities?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Upsell:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedLead.ai_analysis.upsell_opportunities.map((u: string) => (
                                <Badge key={u} variant="outline" className="text-xs">{u}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Workflow */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Workflow</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={selectedLead.status} onValueChange={(v) => handleStatusChange(selectedLead.id, v as LeadStatus)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t('leads.assigned')}</Label>
                        <Input
                          value={selectedLead.assigned_to || ''}
                          onChange={(e) => handleAssign(selectedLead.id, e.target.value)}
                          placeholder="Name…"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <StickyNote className="w-4 h-4" />
                      {t('leads.notes')}
                    </h3>
                    <div className="flex gap-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={2}
                        placeholder="Notiz hinzufügen…"
                        className="text-sm"
                      />
                      <Button size="sm" onClick={addNote} disabled={!newNote.trim() || savingNote} className="self-end">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {notes.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {notes.map(note => (
                          <div key={note.id} className="p-2 rounded bg-muted/50 text-sm">
                            <p>{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{format(new Date(note.created_at), 'dd.MM.yyyy HH:mm')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity Timeline */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">{t('leads.activities')}</h3>
                    {activities.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t('leads.no_activities')}</p>
                    )}
                    <div className="space-y-2">
                      {activities.map(act => (
                        <div key={act.id} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm">{act.description}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(act.created_at), 'dd.MM.yyyy HH:mm')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setSelectedLead(null)}>{t('leads.close')}</Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLeads;
