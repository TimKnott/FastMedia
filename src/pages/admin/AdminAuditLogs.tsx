import { Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const placeholderLogs = [
  { id: '1', timestamp: '—', actor: '—', action: 'INSERT', table: 'profiles', detail: '{}' },
  { id: '2', timestamp: '—', actor: '—', action: 'UPDATE', table: 'user_roles', detail: '{}' },
];

const actionColor = (action: string) => { switch (action) { case 'INSERT': return 'default'; case 'UPDATE': return 'secondary'; case 'DELETE': return 'destructive'; default: return 'outline'; } };

const AdminAuditLogs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Traceable system changes.</p>
      </div>
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg font-display">Log</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9"><Filter className="w-4 h-4 mr-1" />Filter</Button>
              <Button variant="outline" size="sm" className="h-9"><Download className="w-4 h-4 mr-1" />CSV Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Table</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
            <TableBody>
              {placeholderLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-sm">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.actor}</TableCell>
                  <TableCell><Badge variant={actionColor(log.action) as any}>{log.action}</Badge></TableCell>
                  <TableCell className="text-sm">{log.table}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" className="h-7 text-xs">View JSON</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
