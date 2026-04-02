import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, ExternalLink, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LearnMoreModal from '@/components/LearnMoreModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface Integration {
  id: string;
  name: string;
  descKey: string;
  icon: string;
  categoryKey: string;
  connected: boolean;
  configUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: 'vbout', name: 'VBOUT', descKey: 'integrations.vbout_desc', icon: '📧', categoryKey: 'integrations.cat_marketing', connected: true, configUrl: '/admin/vbout' },
  { id: 'stripe', name: 'Stripe', descKey: 'integrations.stripe_desc', icon: '💳', categoryKey: 'integrations.cat_payments', connected: false },
  { id: 'google_analytics', name: 'Google Analytics', descKey: 'integrations.ga_desc', icon: '📊', categoryKey: 'integrations.cat_analytics', connected: false },
  { id: 'slack', name: 'Slack', descKey: 'integrations.slack_desc', icon: '💬', categoryKey: 'integrations.cat_communication', connected: false },
  { id: 'resend', name: 'Resend', descKey: 'integrations.resend_desc', icon: '✉️', categoryKey: 'integrations.cat_email', connected: true },
  { id: 'calendar', name: 'Google Calendar', descKey: 'integrations.calendar_desc', icon: '📅', categoryKey: 'integrations.cat_planning', connected: false },
  { id: 'zapier', name: 'Zapier', descKey: 'integrations.zapier_desc', icon: '⚡', categoryKey: 'integrations.cat_automation', connected: false },
  { id: 'sentry', name: 'Sentry', descKey: 'integrations.sentry_desc', icon: '🐛', categoryKey: 'integrations.cat_development', connected: false },
];

const AdminIntegrations = () => {
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const categories = [...new Set(integrations.map(i => i.categoryKey))];

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">{t('integrations.title')}</h1>
        <LearnMoreModal
          title="API Integrations Hub"
          explanation="Connect external software (accounting, CRM, payment gateways) via APIs for automation. Enable or disable integrations with simple toggles."
          benefits={['Centralizes all service connections', 'Reduces manual data entry', 'Enables workflow automation']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground">{t('integrations.subtitle')}</p>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">{integrations.filter(i => i.connected).length} {t('integrations.connected')}</Badge>
        <Badge variant="secondary" className="text-xs">{integrations.filter(i => !i.connected).length} {t('integrations.available')}</Badge>
      </div>

      {categories.map(catKey => (
        <div key={catKey} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t(catKey)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.filter(i => i.categoryKey === catKey).map(integration => (
              <Card key={integration.id} className={`transition-all ${integration.connected ? 'border-primary/30 shadow-sm' : ''}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{integration.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{integration.name}</h3>
                          {integration.connected && (
                            <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-200">
                              <Check className="w-3 h-3 mr-0.5" />{t('accounting.active')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t(integration.descKey)}</p>
                      </div>
                    </div>
                    <Switch checked={integration.connected} onCheckedChange={() => toggleConnection(integration.id)} />
                  </div>
                  {integration.connected && integration.configUrl && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" className="text-xs" asChild>
                        <a href={integration.configUrl}>{t('integrations.configure')} <ExternalLink className="w-3 h-3 ml-1" /></a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default AdminIntegrations;
