import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderBookings = [
  { id: '1', name: '—', service: '—', status: 'neu', date: '—' },
  { id: '2', name: '—', service: '—', status: 'in_bearbeitung', date: '—' },
  { id: '3', name: '—', service: '—', status: 'abgeschlossen', date: '—' },
];

const statusLabel: Record<string, string> = {
  neu: 'Neu',
  in_bearbeitung: 'In Bearbeitung',
  abgeschlossen: 'Abgeschlossen',
};

const statusVariant: Record<string, string> = {
  neu: 'default',
  in_bearbeitung: 'secondary',
  abgeschlossen: 'outline',
};

const BookingsTable = ({ bookings }: { bookings: typeof placeholderBookings }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Service</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Datum</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {bookings.map((b) => (
        <TableRow key={b.id}>
          <TableCell className="font-medium">{b.name}</TableCell>
          <TableCell>{b.service}</TableCell>
          <TableCell>
            <Badge variant={statusVariant[b.status] as any}>
              {statusLabel[b.status]}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground">{b.date}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const AdminBookings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Buchungen & Leads</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie eingehende Anfragen.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Alle Buchungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="neu">Neu</TabsTrigger>
              <TabsTrigger value="in_bearbeitung">In Bearbeitung</TabsTrigger>
              <TabsTrigger value="abgeschlossen">Abgeschlossen</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <BookingsTable bookings={placeholderBookings} />
            </TabsContent>
            <TabsContent value="neu" className="mt-4">
              <BookingsTable bookings={placeholderBookings.filter(b => b.status === 'neu')} />
            </TabsContent>
            <TabsContent value="in_bearbeitung" className="mt-4">
              <BookingsTable bookings={placeholderBookings.filter(b => b.status === 'in_bearbeitung')} />
            </TabsContent>
            <TabsContent value="abgeschlossen" className="mt-4">
              <BookingsTable bookings={placeholderBookings.filter(b => b.status === 'abgeschlossen')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
