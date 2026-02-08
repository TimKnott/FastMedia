import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, MapPin, StickyNote, Calendar, Clock, LayoutGrid, List } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Booking, BookingStatus } from '@/types/bookings';
import { statusConfig, priorityConfig, sourceLabel, pipelineStages } from '@/types/bookings';
import { placeholderBookings as initialBookings } from '@/data/bookings';
import BookingsKanban from '@/components/admin/BookingsKanban';

type ViewMode = 'table' | 'kanban';

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
          <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelect(b)}>
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
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const counts = statCounts(bookings);

  const filtered = bookings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const filterByStatus = (status: BookingStatus) => filtered.filter(b => b.status === status);

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Buchungen & Leads</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie eingehende Anfragen und den Workflow.</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Tabelle</span>
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </Button>
        </div>
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

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, E-Mail, Service…"
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="w-4 h-4 mr-1" />
          Filtern
        </Button>
      </div>

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <BookingsKanban
          bookings={filtered}
          onSelect={setSelectedBooking}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display">Alle Buchungen</CardTitle>
            <CardDescription>{filtered.length} Einträge</CardDescription>
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
      )}

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

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Workflow</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status ändern</Label>
                      <Select defaultValue={selectedBooking.status}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4" />
                    Notizen
                  </h3>
                  <Textarea defaultValue={selectedBooking.notes} rows={4} placeholder="Notizen hinzufügen…" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="gradient-primary text-primary-foreground flex-1">Speichern</Button>
                  <Button variant="outline" onClick={() => setSelectedBooking(null)}>Schließen</Button>
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
