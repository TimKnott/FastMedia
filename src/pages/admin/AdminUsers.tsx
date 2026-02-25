import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import PermissionGate from '@/components/admin/PermissionGate';

interface UserRow { user_id: string; role: string; }

const roleBadgeVariant = (role: string) => {
  switch (role) { case 'super_admin': return 'destructive'; case 'admin': return 'default'; case 'editor': return 'secondary'; default: return 'outline'; }
};
const roleLabel: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor', moderator: 'Moderator', user: 'User' };

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => { const { data } = await supabase.from('user_roles').select('user_id, role'); setUsers(data ?? []); setLoading(false); };
    fetch();
  }, []);

  const filtered = users.filter(u => u.user_id.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Overview of all registered users and their roles.</p>
      </div>
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg font-display">All Users</CardTitle>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search…" className="pl-9 h-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>User ID</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                    <TableCell><Badge variant={roleBadgeVariant(user.role) as any}>{roleLabel[user.role] ?? user.role}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground">—</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <PermissionGate minRole="super_admin">
        <p className="text-xs text-muted-foreground">To change roles, use the <a href="/admin/roles" className="text-primary underline">Role Management</a> page.</p>
      </PermissionGate>
    </div>
  );
};

export default AdminUsers;
