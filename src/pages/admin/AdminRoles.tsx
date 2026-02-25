import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
interface UserWithRole { user_id: string; email: string; role: AppRole; created_at: string; }

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' }, { value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' }, { value: 'moderator', label: 'Moderator' }, { value: 'user', label: 'User' },
];

const roleBadgeVariant = (role: string) => { switch (role) { case 'super_admin': return 'destructive'; case 'admin': return 'default'; case 'editor': return 'secondary'; default: return 'outline'; } };
const roleIcon = (role: string) => { switch (role) { case 'super_admin': return <ShieldAlert className="w-3.5 h-3.5 mr-1" />; case 'admin': return <ShieldCheck className="w-3.5 h-3.5 mr-1" />; default: return <UserCog className="w-3.5 h-3.5 mr-1" />; } };

const AdminRoles = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('user');
  const [saving, setSaving] = useState(false);
  const { isSuperAdmin, userId: currentUserId } = useUserRole();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_roles').select('user_id, role');
    if (error) { toast.error('Failed to load users.'); setLoading(false); return; }
    setUsers((data ?? []).map((r) => ({ user_id: r.user_id, email: '', role: r.role as AppRole, created_at: '' })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user: UserWithRole) => { setEditUser(user); setNewRole(user.role); };
  const handleSave = async () => {
    if (!editUser) return;
    if (editUser.user_id === currentUserId && newRole !== 'super_admin') { toast.error('You cannot change your own Super Admin role.'); return; }
    setSaving(true);
    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', editUser.user_id);
    if (error) { toast.error('Failed to save role.'); } else { toast.success('Role updated successfully.'); setEditUser(null); fetchUsers(); }
    setSaving(false);
  };

  const filtered = users.filter(u => u.user_id.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Role Management</h1>
        <p className="text-muted-foreground mt-1">Assign roles to users and manage the access hierarchy.</p>
      </div>

      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <p className="text-sm font-medium text-foreground mb-2">Role Hierarchy</p>
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            {ROLE_OPTIONS.map((r, i) => (
              <span key={r.value} className="flex items-center gap-1">
                <Badge variant={roleBadgeVariant(r.value) as any} className="text-xs">{r.label}</Badge>
                {i < ROLE_OPTIONS.length - 1 && <span className="text-muted-foreground/50 mx-1">›</span>}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <CardTitle className="text-lg font-display">All User Roles</CardTitle>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search…" className="pl-9 h-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>User ID</TableHead><TableHead>Role</TableHead><TableHead className="w-24">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                    <TableCell><Badge variant={roleBadgeVariant(user.role) as any} className="inline-flex items-center">{roleIcon(user.role)}{ROLE_OPTIONS.find(r => r.value === user.role)?.label ?? user.role}</Badge></TableCell>
                    <TableCell><Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleEdit(user)} disabled={!isSuperAdmin}>Edit</Button></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>User ID: <span className="font-mono text-xs">{editUser?.user_id}</span></DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">New Role</label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLE_OPTIONS.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}</SelectContent></Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoles;
