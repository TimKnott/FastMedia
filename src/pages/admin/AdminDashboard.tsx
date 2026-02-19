import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, ScrollText, TrendingUp, Mail, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  users: number;
  subscribers: number;
  leads: number;
  hotLeads: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ users: 0, subscribers: 0, leads: 0, hotLeads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [subscribersRes, rolesRes, leadsRes, hotLeadsRes] = await Promise.all([
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).in('classification', ['hot', 'high_priority']),
      ]);

      setStats({
        subscribers: subscribersRes.count ?? 0,
        users: rolesRes.count ?? 0,
        leads: leadsRes.count ?? 0,
        hotLeads: hotLeadsRes.count ?? 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Leads gesamt', value: stats.leads, icon: TrendingUp },
    { label: 'Hot / Priority', value: stats.hotLeads, icon: Flame },
    { label: 'Newsletter-Abonnenten', value: stats.subscribers, icon: Mail },
    { label: 'Benutzer', value: stats.users, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Übersicht über Ihr Admin-Portal.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-display font-bold mt-1">
                      {loading ? '…' : card.value}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Letzte Aktivitäten</CardTitle>
          <CardDescription>Aktuelle Änderungen und Ereignisse im System.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Noch keine Aktivitäten</p>
                <p className="text-xs text-muted-foreground">
                  Erstellen Sie Audit- und Buchungstabellen, um Echtzeit-Daten zu sehen.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
