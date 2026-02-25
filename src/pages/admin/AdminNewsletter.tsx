import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Download, Search, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subscriber { id: string; email: string; subscribed_at: string; }

const AdminNewsletter = () => {
  const [search, setSearch] = useState('');

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const filtered = subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    if (subscribers.length === 0) { toast.error('No subscribers to export.'); return; }
    const header = 'Email,Subscribed Date';
    const rows = subscribers.map((s) => `${s.email},${new Date(s.subscribed_at).toLocaleDateString('en-GB')}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${subscribers.length} subscribers exported.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Newsletter</h1>
          <p className="text-muted-foreground mt-1">Manage your newsletter subscribers.</p>
        </div>
        <Button onClick={handleExport} className="gap-2 shrink-0"><Download className="w-4 h-4" />Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-display font-bold mt-1">{subscribers.length}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-display font-bold mt-1">
                    {subscribers.filter((s) => { const d = new Date(s.subscribed_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center"><Mail className="w-5 h-5 text-accent" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-display">Subscribers</CardTitle>
              <CardDescription>List of all newsletter subscribers.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No subscribers found.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-48">Subscribed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.subscribed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNewsletter;
