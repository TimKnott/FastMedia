import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, UserCog, UserPlus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import LearnMoreModal from '@/components/LearnMoreModal';

type AppRole = Database['public']['Enums']['app_role'];
interface UserWithRole {
  user_id: string;
  email: string | null;
  role: AppRole | null;
  created_at: string;
  last_sign_in_at: string | null;
}

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: 'User' },
];

const INVITE_ROLE_OPTIONS = ROLE_OPTIONS.filter(r => r.value !== 'super_admin');

const roleBadgeVariant = (role: string | null) => {
  switch (role) {
    case 'super_admin': return 'destructive';
    case 'admin': return 'default';
    case 'editor': return 'secondary';
    default: return 'outline';
  }
};
const roleIcon = (role: string | null) => {
  switch (role) {
    case 'super_admin': return <ShieldAlert className="w-3.5 h-3.5 mr-1" />;
    case 'admin': return <ShieldCheck className="w-3.5 h-3.5 mr-1" />;
    default: return <UserCog className="w-3.5 h-3.5 mr-1" />;
  }
};

const AdminRoles = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('user');
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('editor');
  const [inviting, setInviting] = useState(false);
  const { isSuperAdmin, userId: currentUserId } = useUserRole();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-list-users');
    if (error) {
      toast.error('Failed to load users.');
      setLoading(false);
      return;
    }
    setUsers((data?.users ?? []) as UserWithRole[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user: UserWithRole) => {
    setEditUser(user);
    setNewRole((user.role ?? 'user') as AppRole);
  };

  const handleSave = async () => {
    if (!editUser) return;
    if (editUser.user_id === currentUserId && newRole !== 'super_admin') {
      toast.error('You cannot change your own Super Admin role.');
      return;
    }
    setSaving(true);
    // Replace any existing role row(s) with the new role
    await supabase.from('user_roles').delete().eq('user_id', editUser.user_id);
    const { error } = await supabase.from('user_roles').insert({ user_id: editUser.user_id, role: newRole });
    if (error) {
      toast.error(error.message || 'Failed to save role.');
    } else {
      toast.success('Role updated.');
      setEditUser(null);
      fetchUsers();
    }
    setSaving(false);
  };

  const handleRemoveRole = async (user: UserWithRole) => {
    if (user.user_id === currentUserId) {
      toast.error('You cannot remove your own role.');
      return;
    }
    if (!confirm(`Remove all roles for ${user.email ?? user.user_id}?`)) return;
    const { error } = await supabase.from('user_roles').delete().eq('user_id', user.user_id);
    if (error) toast.error(error.message);
    else { toast.success('Role removed.'); fetchUsers(); }
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email.');
      return;
    }
    setInviting(true);
    const { data, error } = await supabase.functions.invoke('admin-invite-user', {
      body: { email, role: inviteRole },
    });
    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Invite failed.');
    } else {
      toast.success(data?.invited ? 'Invite sent.' : 'Role assigned to existing user.');
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('editor');
      fetchUsers();
    }
    setInviting(false);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.email ?? '').toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Role Management</h1>
        <LearnMoreModal
          title="Role-Based Access Controls"
          explanation="Control user permissions by role to protect sensitive data. The hierarchy ensures only authorized staff can access admin functions."
          benefits={['Protects sensitive data', 'Prevents unauthorized access', 'Enforces principle of least privilege']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground mt-1">Invite users by email, assign roles, and manage the access hierarchy.</p>

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
            <CardTitle className="text-lg font-display">All Users</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search email or role…" className="pl-9 h-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9" disabled={!isSuperAdmin}>
                    <UserPlus className="w-4 h-4 mr-2" /> Invite user
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a new user</DialogTitle>
                    <DialogDescription>
                      Sends an email invite. The recipient sets their password, then receives the role you select below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input type="email" placeholder="name@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Role</label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {INVITE_ROLE_OPTIONS.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">Super Admin can only be granted by editing an existing user.</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={inviting}>
                      {inviting ? 'Sending…' : 'Send invite'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="font-medium text-sm">{user.email ?? '—'}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{user.user_id}</div>
                    </TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge variant={roleBadgeVariant(user.role) as any} className="inline-flex items-center">
                          {roleIcon(user.role)}{ROLE_OPTIONS.find(r => r.value === user.role)?.label ?? user.role}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No role</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleEdit(user)} disabled={!isSuperAdmin}>
                        Edit
                      </Button>
                      {user.role && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleRemoveRole(user)} disabled={!isSuperAdmin}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>{editUser?.email ?? editUser?.user_id}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">New Role</label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
              </SelectContent>
            </Select>
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
