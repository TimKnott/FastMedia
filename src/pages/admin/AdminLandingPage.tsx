import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layout, Type, Image, Megaphone, Calculator, Users, Star, CreditCard,
  HelpCircle, BookOpen, Zap, BarChart3, Bot
} from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Hero', icon: Megaphone, desc: 'Hlavní nadpis, podtitulek, CTA tlačítka' },
  { id: 'why', label: 'Proč FastMedia', icon: BarChart3, desc: 'Hodnotová nabídka, metriky' },
  { id: 'demos', label: 'Ukázky oborů', icon: Layout, desc: 'Sekce s demo kartami' },
  { id: 'calculator', label: 'Kalkulačka', icon: Calculator, desc: 'AI kalkulačka showcase' },
  { id: 'advantages', label: 'Výhody', icon: Star, desc: 'Klíčové výhody a čísla' },
  { id: 'automation', label: 'Automatizace', icon: Bot, desc: 'Sekce úspory času' },
  { id: 'services', label: 'Služby', icon: Zap, desc: 'Přehled služeb' },
  { id: 'consultant', label: 'Konzultantka', icon: Users, desc: 'Profil Jitky' },
  { id: 'pricing', label: 'Ceník', icon: CreditCard, desc: 'Balíčky a ceny' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Často kladené otázky' },
  { id: 'blog', label: 'Blog sekce', icon: BookOpen, desc: 'Doporučené články na HP' },
];

const AdminLandingPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Startseite bearbeiten</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie alle Abschnitte der Landing Page.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.id} className="shadow-card hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">Bearbeiten</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Inline-Bearbeitung kommt bald. Hier können Sie in Zukunft Texte und Bilder direkt bearbeiten.
      </p>
    </div>
  );
};

export default AdminLandingPage;
