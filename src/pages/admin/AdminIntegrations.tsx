import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, ExternalLink, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LearnMoreModal from '@/components/LearnMoreModal';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connected: boolean;
  configUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: 'vbout', name: 'VBOUT', description: 'Marketing-Automatisierung, E-Mail-Kampagnen und Lead-Tracking.', icon: '📧', category: 'Marketing', connected: true, configUrl: '/admin/vbout' },
  { id: 'stripe', name: 'Stripe', description: 'Online-Zahlungsabwicklung und Rechnungsstellung.', icon: '💳', category: 'Zahlungen', connected: false },
  { id: 'google_analytics', name: 'Google Analytics', description: 'Website-Traffic und Nutzerverhalten analysieren.', icon: '📊', category: 'Analytics', connected: false },
  { id: 'slack', name: 'Slack', description: 'Team-Benachrichtigungen und interne Kommunikation.', icon: '💬', category: 'Kommunikation', connected: false },
  { id: 'resend', name: 'Resend', description: 'Transaktions-E-Mails versenden.', icon: '✉️', category: 'E-Mail', connected: true },
  { id: 'calendar', name: 'Google Calendar', description: 'Terminbuchungen mit Kalender synchronisieren.', icon: '📅', category: 'Planung', connected: false },
  { id: 'zapier', name: 'Zapier', description: 'Automatisierte Workflows zwischen Apps.', icon: '⚡', category: 'Automatisierung', connected: false },
  { id: 'sentry', name: 'Sentry', description: 'Fehler-Monitoring und Performance-Tracking.', icon: '🐛', category: 'Entwicklung', connected: false },
];

const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const categories = [...new Set(integrations.map(i => i.category))];

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-foreground">API-Integrationen</h1>
        <LearnMoreModal
          title="API Integrations Hub"
          explanation="Connect external software (accounting, CRM, payment gateways) via APIs for automation. Enable or disable integrations with simple toggles."
          benefits={['Centralizes all service connections', 'Reduces manual data entry', 'Enables workflow automation']}
          triggerSize="md"
        />
      </div>
      <p className="text-muted-foreground">Externe Dienste verbinden und verwalten.</p>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">{integrations.filter(i => i.connected).length} Verbunden</Badge>
        <Badge variant="secondary" className="text-xs">{integrations.filter(i => !i.connected).length} Verfügbar</Badge>
      </div>

      {categories.map(cat => (
        <div key={cat} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.filter(i => i.category === cat).map(integration => (
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
                              <Check className="w-3 h-3 mr-0.5" />Aktiv
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                      </div>
                    </div>
                    <Switch checked={integration.connected} onCheckedChange={() => toggleConnection(integration.id)} />
                  </div>
                  {integration.connected && integration.configUrl && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" className="text-xs" asChild>
                        <a href={integration.configUrl}>Konfigurieren <ExternalLink className="w-3 h-3 ml-1" /></a>
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
