import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, ScrollText, TrendingUp, Mail, Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import TrackingDiagnostics from '@/components/admin/TrackingDiagnostics';
import DashboardCharts from '@/components/admin/DashboardCharts';
import DailyBlogStatus from '@/components/admin/DailyBlogStatus';
import LearnMoreModal from '@/components/LearnMoreModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  users: number;
  subscribers: number;
  leads: number;
  hotLeads: number;
  bookings: number;
  auditLogs: number;
}

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({ users: 0, subscribers: 0, leads: 0, hotLeads: 0, bookings: 0, auditLogs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [subscribersRes, rolesRes, leadsRes, hotLeadsRes, bookingsRes, auditRes] = await Promise.all([
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).in('classification', ['hot', 'high_priority']),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        subscribers: subscribersRes.count ?? 0,
        users: rolesRes.count ?? 0,
        leads: leadsRes.count ?? 0,
        hotLeads: hotLeadsRes.count ?? 0,
        bookings: bookingsRes.count ?? 0,
        auditLogs: auditRes.count ?? 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const cards = [
    { label: t('admin.total_leads'), value: stats.leads, icon: TrendingUp },
    { label: t('admin.hot_priority'), value: stats.hotLeads, icon: Flame },
    { label: t('bookings.title'), value: stats.bookings, icon: CalendarCheck },
    { label: t('admin.newsletter_subscribers'), value: stats.subscribers, icon: Mail },
    { label: t('admin.admin_users'), value: stats.users, icon: Users },
    { label: t('admin.audit_entries'), value: stats.auditLogs, icon: ScrollText },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.dashboard')}</h1>
        <LearnMoreModal
          title="Analytics & Marketing Impact"
          explanation="Monitor how marketing activities affect traffic and sales in real time. Track leads, bookings, and conversion trends with interactive charts."
          benefits={['Enables data-driven decisions', 'Tracks marketing ROI', 'Identifies growth opportunities']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground mt-1">{t('admin.dashboard_subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <DashboardCharts />

      <TrackingDiagnostics />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">{t('admin.recent_activity')}</CardTitle>
          <CardDescription>{t('admin.recent_activity_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('admin.no_activity')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('admin.no_activity_desc')}
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
