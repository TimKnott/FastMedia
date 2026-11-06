import { csvCell } from '@/lib/csvSafe';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LearnMoreModal from '@/components/LearnMoreModal';
import { useLanguage } from '@/contexts/LanguageContext';

type ExportTarget = 'leads' | 'bookings' | 'invoices' | 'employees' | 'newsletter';

interface ExportConfig {
  id: ExportTarget;
  labelKey: string;
  descKey: string;
  icon: string;
  table: string;
}

const EXPORT_CONFIGS: Omit<ExportConfig, 'labelKey' | 'descKey'>[] = [
  { id: 'leads', icon: '📋', table: 'leads' },
  { id: 'bookings', icon: '📅', table: 'bookings' },
  { id: 'invoices', icon: '💶', table: 'invoices' },
  { id: 'employees', icon: '👥', table: 'employees' },
  { id: 'newsletter', icon: '✉️', table: 'newsletter_subscribers' },
];

const AdminExport = () => {
  const { t, language } = useLanguage();
  const [exporting, setExporting] = useState<ExportTarget | null>(null);
  const [lastExports, setLastExports] = useState<Record<string, string>>({});

  const getLabel = (id: ExportTarget) => {
    const map: Record<ExportTarget, string> = {
      leads: t('export.leads'),
      bookings: t('export.bookings'),
      invoices: t('export.invoices'),
      employees: t('export.employees_label'),
      newsletter: t('export.newsletter'),
    };
    return map[id];
  };

  const getDesc = (id: ExportTarget) => {
    const map: Record<ExportTarget, string> = {
      leads: t('export.leads_desc'),
      bookings: t('export.bookings_desc'),
      invoices: t('export.invoices_desc'),
      employees: t('export.employees_desc'),
      newsletter: t('export.newsletter_desc'),
    };
    return map[id];
  };

  const exportCSV = async (config: typeof EXPORT_CONFIGS[number]) => {
    setExporting(config.id);
    try {
      const { data, error } = await supabase.from(config.table as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) { toast.error(t('export.no_data')); setExporting(null); return; }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row: any) =>
          headers.map(h => (row[h] === null || row[h] === undefined ? '' : csvCell(row[h]))).join(',')
        ),
      ];
      const csv = csvRows.join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.id}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'cs-CZ';
      setLastExports(prev => ({ ...prev, [config.id]: new Date().toLocaleString(locale) }));
      toast.success(`${getLabel(config.id)} ${t('export.success')} (${data.length} ${t('export.entries')})`);
    } catch (err: any) {
      toast.error(err.message || t('export.failed'));
    }
    setExporting(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('export.title')}</h1>
        <LearnMoreModal
          title="Backup & Data Export Tools"
          explanation="Export your business data in CSV format for audits, accounting, or backup purposes. Download leads, bookings, invoices, and more with one click."
          benefits={['Ensures data safety', 'Simplifies accounting audits', 'Allows offline data analysis']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground">{t('export.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORT_CONFIGS.map(config => (
          <Card key={config.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.icon}</span>
                <CardTitle className="text-base">{getLabel(config.id)}</CardTitle>
              </div>
              <CardDescription className="text-xs">{getDesc(config.id)}</CardDescription>
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
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" />{t('export.exporting')}</>
                ) : lastExports[config.id] ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />{t('export.re_export')}</>
                ) : (
                  <><Download className="w-4 h-4 mr-1" />{t('export.csv_export')}</>
                )}
              </Button>
              {lastExports[config.id] && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">{t('export.last_export')}: {lastExports[config.id]}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminExport;
