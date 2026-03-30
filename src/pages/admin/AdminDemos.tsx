import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const trades = [
  { id: 'plumbing', nameKey: 'trade.plumbing', icon: '🔧' },
  { id: 'electrical', nameKey: 'trade.electrical', icon: '⚡' },
  { id: 'building', nameKey: 'trade.building', icon: '🏗️' },
  { id: 'roofing', nameKey: 'trade.roofing', icon: '🏠' },
  { id: 'drywall', nameKey: 'trade.drywall', icon: '🧱' },
  { id: 'wells', nameKey: 'trade.wells', icon: '💧' },
  { id: 'heating', nameKey: 'trade.heating', icon: '🔥' },
  { id: 'solar', nameKey: 'trade.solar', icon: '☀️' },
  { id: 'heatpumps', nameKey: 'trade.heatpumps', icon: '♨️' },
  { id: 'painting', nameKey: 'trade.painting', icon: '🎨' },
  { id: 'interior', nameKey: 'trade.interior', icon: '🛋️' },
  { id: 'exterior', nameKey: 'trade.exterior', icon: '🏢' },
  { id: 'gardening', nameKey: 'trade.gardening', icon: '🌿' },
  { id: 'cleaning', nameKey: 'trade.cleaning', icon: '🧹' },
  { id: 'locksmith', nameKey: 'trade.locksmith', icon: '🔑' },
  { id: 'carpentry', nameKey: 'trade.carpentry', icon: '🪚' },
  { id: 'autorepair', nameKey: 'trade.autorepair', icon: '🚗' },
  { id: 'pestcontrol', nameKey: 'trade.pestcontrol', icon: '🐛' },
  { id: 'photography', nameKey: 'trade.photography', icon: '📸' },
  { id: 'catering', nameKey: 'trade.catering', icon: '🍽️' },
  { id: 'fitness', nameKey: 'trade.fitness', icon: '💪' },
  { id: 'beautysalon', nameKey: 'trade.beautysalon', icon: '💅' },
  { id: 'moving', nameKey: 'trade.moving', icon: '📦' },
  { id: 'itservices', nameKey: 'trade.itservices', icon: '💻' },
];

const AdminDemos = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = trades.filter(tr =>
    t(tr.nameKey).toLowerCase().includes(search.toLowerCase()) ||
    tr.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('demos.admin_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('demos.admin_subtitle').replace('{count}', String(trades.length))}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('demos.search')}
          className="pl-9 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((trade) => (
          <Card key={trade.id} className="shadow-card hover:shadow-md transition-shadow group">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{trade.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{t(trade.nameKey)}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">/demo/{trade.id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={`/demo/${trade.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} {t('demos.of')} {trades.length} {t('demos.shown')}. {t('demos.inline_soon')}
      </p>
    </div>
  );
};

export default AdminDemos;
