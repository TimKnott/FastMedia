import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TimeRange = '7d' | '30d' | '90d';

interface DailyCount {
  date: string;
  count: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))'];

const DashboardCharts = () => {
  const [range, setRange] = useState<TimeRange>('30d');
  const [leadsOverTime, setLeadsOverTime] = useState<DailyCount[]>([]);
  const [bookingsOverTime, setBookingsOverTime] = useState<DailyCount[]>([]);
  const [leadsByClassification, setLeadsByClassification] = useState<{ name: string; value: number }[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const fetchData = async () => {
      setLoading(true);
      const [leadsRes, bookingsRes] = await Promise.all([
        supabase.from('leads').select('created_at, classification').gte('created_at', sinceStr).order('created_at'),
        supabase.from('bookings').select('created_at, status').gte('created_at', sinceStr).order('created_at'),
      ]);

      // Process leads over time
      const leadsByDay: Record<string, number> = {};
      const classCount: Record<string, number> = {};
      (leadsRes.data || []).forEach((l: any) => {
        const day = l.created_at.slice(0, 10);
        leadsByDay[day] = (leadsByDay[day] || 0) + 1;
        classCount[l.classification] = (classCount[l.classification] || 0) + 1;
      });

      // Process bookings over time
      const bookingsByDay: Record<string, number> = {};
      const statusCount: Record<string, number> = {};
      (bookingsRes.data || []).forEach((b: any) => {
        const day = b.created_at.slice(0, 10);
        bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
        statusCount[b.status] = (statusCount[b.status] || 0) + 1;
      });

      // Fill missing days
      const fillDays = (data: Record<string, number>) => {
        const result: DailyCount[] = [];
        const d = new Date(since);
        const today = new Date();
        while (d <= today) {
          const key = d.toISOString().slice(0, 10);
          result.push({ date: key.slice(5), count: data[key] || 0 });
          d.setDate(d.getDate() + 1);
        }
        return result;
      };

      setLeadsOverTime(fillDays(leadsByDay));
      setBookingsOverTime(fillDays(bookingsByDay));
      setLeadsByClassification(Object.entries(classCount).map(([name, value]) => ({ name, value })));
      setBookingsByStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
      setLoading(false);
    };

    fetchData();
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-foreground">Analytics</h2>
        <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-3">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-3">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-3">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads over time */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Leads" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookings over time */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bookings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead classification pie */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads by Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              ) : leadsByClassification.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsByClassification}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {leadsByClassification.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking status pie */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              ) : bookingsByStatus.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {bookingsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
