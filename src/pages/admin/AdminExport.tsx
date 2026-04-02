import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LearnMoreModal from '@/components/LearnMoreModal';

type ExportTarget = 'leads' | 'bookings' | 'invoices' | 'employees' | 'newsletter';

interface ExportConfig {
  id: ExportTarget;
  label: string;
  description: string;
  icon: string;
  table: string;
}

const EXPORTS: ExportConfig[] = [
  { id: 'leads', label: 'Leads', description: 'Alle qualifizierten Leads exportieren.', icon: '📋', table: 'leads' },
  { id: 'bookings', label: 'Buchungen', description: 'Terminbuchungen und Status exportieren.', icon: '📅', table: 'bookings' },
  { id: 'invoices', label: 'Rechnungen', description: 'Rechnungsdaten für Buchhaltung exportieren.', icon: '💶', table: 'invoices' },
  { id: 'employees', label: 'Mitarbeiter', description: 'Personaldaten exportieren.', icon: '👥', table: 'employees' },
  { id: 'newsletter', label: 'Newsletter', description: 'Abonnentenliste exportieren.', icon: '✉️', table: 'newsletter_subscribers' },
];

const AdminExport = () => {
  const [exporting, setExporting] = useState<ExportTarget | null>(null);
  const [lastExports, setLastExports] = useState<Record<string, string>>({});

  const exportCSV = async (config: ExportConfig) => {
    setExporting(config.id);
    try {
      const { data, error } = await supabase.from(config.table as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) { toast.error('Keine Daten zum Exportieren'); setExporting(null); return; }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row: any) =>
          headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          }).join(',')
        ),
      ];
      const csv = csvRows.join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.id}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setLastExports(prev => ({ ...prev, [config.id]: new Date().toLocaleString('de-DE') }));
      toast.success(`${config.label} erfolgreich exportiert (${data.length} Einträge)`);
    } catch (err: any) {
      toast.error(err.message || 'Export fehlgeschlagen');
    }
    setExporting(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Backup & Datenexport</h1>
        <LearnMoreModal
          title="Backup & Data Export Tools"
          explanation="Export your business data in CSV format for audits, accounting, or backup purposes. Download leads, bookings, invoices, and more with one click."
          benefits={['Ensures data safety', 'Simplifies accounting audits', 'Allows offline data analysis']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground">Geschäftsdaten als CSV exportieren für Audits und Buchhaltung.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORTS.map(config => (
          <Card key={config.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.icon}</span>
                <CardTitle className="text-base">{config.label}</CardTitle>
              </div>
              <CardDescription className="text-xs">{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => exportCSV(config)}
                disabled={exporting !== null}
                className="w-full"
                variant={lastExports[config.id] ? 'outline' : 'default'}
                size="sm"
              >
                {exporting === config.id ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Exportiere…</>
                ) : lastExports[config.id] ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />Erneut exportieren</>
                ) : (
                  <><Download className="w-4 h-4 mr-1" />CSV exportieren</>
                )}
              </Button>
              {lastExports[config.id] && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Letzter Export: {lastExports[config.id]}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminExport;
