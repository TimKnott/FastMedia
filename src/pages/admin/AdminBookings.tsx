import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, MapPin, StickyNote, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BookingStatus = 'neu' | 'kontaktiert' | 'angebot_gesendet' | 'in_bearbeitung' | 'abgeschlossen' | 'storniert';
type BookingPriority = 'niedrig' | 'mittel' | 'hoch' | 'dringend';
type BookingSource = 'website' | 'telefon' | 'empfehlung' | 'google' | 'social_media';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  status: BookingStatus;
  priority: BookingPriority;
  source: BookingSource;
  requestedDate: string;
  createdAt: string;
  estimatedValue: string;
  notes: string;
  assignedTo: string;
}

const statusConfig: Record<BookingStatus, { label: string; variant: string; dot: string }> = {
  neu: { label: 'Neu', variant: 'default', dot: 'bg-primary' },
  kontaktiert: { label: 'Kontaktiert', variant: 'secondary', dot: 'bg-accent' },
  angebot_gesendet: { label: 'Angebot gesendet', variant: 'outline', dot: 'bg-muted-foreground' },
  in_bearbeitung: { label: 'In Bearbeitung', variant: 'secondary', dot: 'bg-accent' },
  abgeschlossen: { label: 'Abgeschlossen', variant: 'outline', dot: 'bg-primary' },
  storniert: { label: 'Storniert', variant: 'destructive', dot: 'bg-destructive' },
};

const priorityConfig: Record<BookingPriority, { label: string; variant: string }> = {
  niedrig: { label: 'Niedrig', variant: 'outline' },
  mittel: { label: 'Mittel', variant: 'secondary' },
  hoch: { label: 'Hoch', variant: 'default' },
  dringend: { label: 'Dringend', variant: 'destructive' },
};

const sourceLabel: Record<BookingSource, string> = {
  website: 'Website',
  telefon: 'Telefon',
  empfehlung: 'Empfehlung',
  google: 'Google',
  social_media: 'Social Media',
};

const placeholderBookings: Booking[] = [
  {
    id: 'B-001',
    name: 'Thomas Müller',
    email: 'thomas@beispiel.de',
    phone: '+49 170 1234567',
    address: 'Hauptstraße 12, 10115 Berlin',
    service: 'Sanitär – Rohrleitungsinstallation',
    status: 'neu',
    priority: 'hoch',
    source: 'website',
    requestedDate: '15.03.2026',
    createdAt: '08.02.2026, 09:14',
    estimatedValue: '2.500 €',
    notes: 'Kunde wünscht Beratung vor Ort. Altbau, evtl. Asbest.',
    assignedTo: '—',
  },
  {
    id: 'B-002',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@email.de',
    phone: '+49 151 9876543',
    address: 'Lindenweg 4, 80331 München',
    service: 'Elektro – Komplettinstallation',
    status: 'kontaktiert',
    priority: 'mittel',
    source: 'empfehlung',
    requestedDate: '22.03.2026',
    createdAt: '06.02.2026, 14:30',
    estimatedValue: '8.000 €',
    notes: 'Neubau, 4 Zimmer. Smarthome-Integration gewünscht.',
    assignedTo: 'Max B.',
  },
  {
    id: 'B-003',
    name: 'Klaus Weber',
    email: 'k.weber@firma.de',
    phone: '+49 160 5551234',
    address: 'Industriestr. 88, 60327 Frankfurt',
    service: 'Heizung – Wärmepumpe',
    status: 'angebot_gesendet',
    priority: 'hoch',
    source: 'google',
    requestedDate: '01.04.2026',
    createdAt: '03.02.2026, 11:00',
    estimatedValue: '15.000 €',
    notes: 'Gewerbegebäude, 200m². Fördermittelberatung angefragt.',
    assignedTo: 'Lisa M.',
  },
  {
    id: 'B-004',
    name: 'Maria Fischer',
    email: 'maria.f@web.de',
    phone: '+49 172 3334444',
    address: 'Gartenstr. 7, 50667 Köln',
    service: 'Dach – Reparatur',
    status: 'in_bearbeitung',
    priority: 'dringend',
    source: 'telefon',
    requestedDate: '10.02.2026',
    createdAt: '01.02.2026, 08:45',
    estimatedValue: '3.200 €',
    notes: 'Wasserschaden durch undichtes Dach. Sofortmaßnahme nötig.',
    assignedTo: 'Max B.',
  },
  {
    id: 'B-005',
    name: 'Stefan Braun',
    email: 'stefan.braun@mail.de',
    phone: '+49 155 7778899',
    address: 'Am Markt 3, 01067 Dresden',
    service: 'Malerei – Innenanstrich',
    status: 'abgeschlossen',
    priority: 'niedrig',
    source: 'social_media',
    requestedDate: '20.01.2026',
    createdAt: '10.01.2026, 16:20',
    estimatedValue: '1.800 €',
    notes: 'Abgeschlossen, Rechnung versendet.',
    assignedTo: 'Lisa M.',
  },
  {
    id: 'B-006',
    name: 'Julia Hoffmann',
    email: 'j.hoffmann@gmx.de',
    phone: '+49 176 1112233',
    address: 'Schlossallee 15, 70173 Stuttgart',
    service: 'Solar – PV-Anlage',
    status: 'storniert',
    priority: 'mittel',
    source: 'website',
    requestedDate: '—',
    createdAt: '28.01.2026, 10:00',
    estimatedValue: '22.000 €',
    notes: 'Storniert – Kundin hat sich für anderen Anbieter entschieden.',
    assignedTo: '—',
  },
];

const statCounts = (bookings: Booking[]) => {
  const counts: Record<BookingStatus, number> = {
    neu: 0, kontaktiert: 0, angebot_gesendet: 0, in_bearbeitung: 0, abgeschlossen: 0, storniert: 0,
  };
  bookings.forEach(b => counts[b.status]++);
  return counts;
};

const BookingsTable = ({
  bookings,
  onSelect,
}: {
  bookings: Booking[];
  onSelect: (b: Booking) => void;
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">ID</TableHead>
          <TableHead>Kunde</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Priorität</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Quelle</TableHead>
          <TableHead>Wunschtermin</TableHead>
          <TableHead>Wert</TableHead>
          <TableHead>Zugewiesen</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
              Keine Buchungen in dieser Kategorie.
            </TableCell>
          </TableRow>
        )}
        {bookings.map((b) => (
          <TableRow
            key={b.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelect(b)}
          >
            <TableCell className="text-xs text-muted-foreground font-mono">{b.id}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium text-sm">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.email}</p>
              </div>
            </TableCell>
            <TableCell className="text-sm max-w-[180px] truncate">{b.service}</TableCell>
            <TableCell>
              <Badge variant={priorityConfig[b.priority].variant as any} className="text-xs">
                {priorityConfig[b.priority].label}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${statusConfig[b.status].dot}`} />
                <span className="text-sm">{statusConfig[b.status].label}</span>
              </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{sourceLabel[b.source]}</TableCell>
            <TableCell className="text-sm">{b.requestedDate}</TableCell>
            <TableCell className="text-sm font-medium">{b.estimatedValue}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{b.assignedTo}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onSelect(b); }}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const AdminBookings = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const counts = statCounts(placeholderBookings);

  const filtered = placeholderBookings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const filterByStatus = (status: BookingStatus) => filtered.filter(b => b.status === status);

  const pipelineStages: { key: BookingStatus; label: string }[] = [
    { key: 'neu', label: 'Neu' },
    { key: 'kontaktiert', label: 'Kontaktiert' },
    { key: 'angebot_gesendet', label: 'Angebot' },
    { key: 'in_bearbeitung', label: 'In Arbeit' },
    { key: 'abgeschlossen', label: 'Fertig' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Buchungen & Leads</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie eingehende Anfragen und den Workflow.</p>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {pipelineStages.map((stage) => (
          <Card key={stage.key} className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${statusConfig[stage.key].dot}`} />
              <div>
                <p className="text-xs text-muted-foreground">{stage.label}</p>
                <p className="text-xl font-display font-bold">{counts[stage.key]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main table card */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-display">Alle Buchungen</CardTitle>
              <CardDescription>{filtered.length} Einträge</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Name, E-Mail, Service…"
                  className="pl-9 h-9 w-72"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-1" />
                Filtern
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">Alle ({filtered.length})</TabsTrigger>
              <TabsTrigger value="neu">Neu ({counts.neu})</TabsTrigger>
              <TabsTrigger value="kontaktiert">Kontaktiert ({counts.kontaktiert})</TabsTrigger>
              <TabsTrigger value="angebot_gesendet">Angebot ({counts.angebot_gesendet})</TabsTrigger>
              <TabsTrigger value="in_bearbeitung">In Arbeit ({counts.in_bearbeitung})</TabsTrigger>
              <TabsTrigger value="abgeschlossen">Fertig ({counts.abgeschlossen})</TabsTrigger>
              <TabsTrigger value="storniert">Storniert ({counts.storniert})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <BookingsTable bookings={filtered} onSelect={setSelectedBooking} />
            </TabsContent>
            {(['neu', 'kontaktiert', 'angebot_gesendet', 'in_bearbeitung', 'abgeschlossen', 'storniert'] as BookingStatus[]).map(status => (
              <TabsContent key={status} value={status} className="mt-4">
                <BookingsTable bookings={filterByStatus(status)} onSelect={setSelectedBooking} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedBooking && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{selectedBooking.name}</SheetTitle>
                <SheetDescription>Buchung {selectedBooking.id}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Kontakt</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{selectedBooking.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedBooking.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedBooking.address}</span>
                    </div>
                  </div>
                </div>

                {/* Booking details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Buchungsdetails</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Service</p>
                      <p className="font-medium">{selectedBooking.service}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Geschätzter Wert</p>
                      <p className="font-medium">{selectedBooking.estimatedValue}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Wunschtermin</p>
                        <p className="font-medium">{selectedBooking.requestedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Erstellt</p>
                        <p className="font-medium">{selectedBooking.createdAt}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Quelle</p>
                      <p className="font-medium">{sourceLabel[selectedBooking.source]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Zugewiesen an</p>
                      <p className="font-medium">{selectedBooking.assignedTo}</p>
                    </div>
                  </div>
                </div>

                {/* Workflow controls */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Workflow</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status ändern</Label>
                      <Select defaultValue={selectedBooking.status}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neu">Neu</SelectItem>
                          <SelectItem value="kontaktiert">Kontaktiert</SelectItem>
                          <SelectItem value="angebot_gesendet">Angebot gesendet</SelectItem>
                          <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                          <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                          <SelectItem value="storniert">Storniert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Priorität ändern</Label>
                      <Select defaultValue={selectedBooking.priority}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="niedrig">Niedrig</SelectItem>
                          <SelectItem value="mittel">Mittel</SelectItem>
                          <SelectItem value="hoch">Hoch</SelectItem>
                          <SelectItem value="dringend">Dringend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4" />
                    Notizen
                  </h3>
                  <Textarea
                    defaultValue={selectedBooking.notes}
                    rows={4}
                    placeholder="Notizen hinzufügen…"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="gradient-primary text-primary-foreground flex-1">
                    Speichern
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                    Schließen
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminBookings;
