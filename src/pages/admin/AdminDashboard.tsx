import { motion } from 'framer-motion';
import { Users, CalendarCheck, ScrollText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { label: 'Benutzer gesamt', value: '—', icon: Users, change: '' },
  { label: 'Aktive Leads', value: '—', icon: TrendingUp, change: '' },
  { label: 'Buchungen', value: '—', icon: CalendarCheck, change: '' },
  { label: 'Audit-Einträge', value: '—', icon: ScrollText, change: '' },
];

const recentActivity = [
  { action: 'Noch keine Aktivitäten', time: '', detail: 'Verbinden Sie die Datenbank, um Echtzeit-Daten zu sehen.' },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Übersicht über Ihr Admin-Portal.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-accent mt-1">{stat.change}</p>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Letzte Aktivitäten</CardTitle>
          <CardDescription>Aktuelle Änderungen und Ereignisse im System.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                  {item.time && (
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
