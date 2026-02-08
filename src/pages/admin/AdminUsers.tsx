import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderUsers = [
  { id: '1', email: 'admin@fastmedia.pro', role: 'super_admin', status: 'aktiv', created: '—' },
  { id: '2', email: 'team@fastmedia.pro', role: 'admin', status: 'aktiv', created: '—' },
  { id: '3', email: 'user@beispiel.de', role: 'user', status: 'aktiv', created: '—' },
];

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin': return 'destructive';
    case 'admin': return 'default';
    default: return 'secondary';
  }
};

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Benutzerverwaltung</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie Benutzer und Rollen.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg font-display">Alle Benutzer</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Suchen…" className="pl-9 h-9 w-60" />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-1" />
                Filtern
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.role) as any}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.created}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
