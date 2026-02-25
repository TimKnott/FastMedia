import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink } from 'lucide-react';

const trades = [
  { id: 'plumbing', name: 'Instalatérství', icon: '🔧' },
  { id: 'electrical', name: 'Elektrikář', icon: '⚡' },
  { id: 'building', name: 'Stavebnictví', icon: '🏗️' },
  { id: 'roofing', name: 'Pokrývačství', icon: '🏠' },
  { id: 'drywall', name: 'Sádrokarton', icon: '🧱' },
  { id: 'wells', name: 'Studnařství', icon: '💧' },
  { id: 'heating', name: 'Topenářství', icon: '🔥' },
  { id: 'solar', name: 'Solární panely', icon: '☀️' },
  { id: 'heatpumps', name: 'Tepelná čerpadla', icon: '♨️' },
  { id: 'painting', name: 'Malířství', icon: '🎨' },
  { id: 'interior', name: 'Interiéry', icon: '🛋️' },
  { id: 'exterior', name: 'Fasády', icon: '🏢' },
  { id: 'gardening', name: 'Zahradnictví', icon: '🌿' },
  { id: 'cleaning', name: 'Úklid', icon: '🧹' },
  { id: 'locksmith', name: 'Zámečnictví', icon: '🔑' },
  { id: 'carpentry', name: 'Truhlářství', icon: '🪚' },
  { id: 'autorepair', name: 'Autoservis', icon: '🚗' },
  { id: 'pestcontrol', name: 'Deratizace', icon: '🐛' },
  { id: 'photography', name: 'Fotografie', icon: '📸' },
  { id: 'catering', name: 'Catering', icon: '🍽️' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'beautysalon', name: 'Salon krásy', icon: '💅' },
  { id: 'moving', name: 'Stěhování', icon: '📦' },
  { id: 'itservices', name: 'IT služby', icon: '💻' },
];

const AdminDemos = () => {
  const [search, setSearch] = useState('');

  const filtered = trades.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Demo-Seiten</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie Texte, Bilder und Services der {trades.length} Branchen-Demos.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Demo suchen…"
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
                    <p className="font-medium text-sm">{trade.name}</p>
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
        {filtered.length} von {trades.length} Demos angezeigt. Inline-Bearbeitung kommt bald.
      </p>
    </div>
  );
};

export default AdminDemos;
