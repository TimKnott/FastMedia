import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layout, Type, Image, Megaphone, Calculator, Users, Star, CreditCard,
  HelpCircle, BookOpen, Zap, BarChart3, Bot
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminLandingPage = () => {
  const { t } = useLanguage();

  const sections = [
    { id: 'hero', label: 'Hero', icon: Megaphone, descKey: 'hero' },
    { id: 'why', label: 'Why FastMedia', icon: BarChart3, descKey: 'why' },
    { id: 'demos', label: 'Demos', icon: Layout, descKey: 'demos' },
    { id: 'calculator', label: 'Calculator', icon: Calculator, descKey: 'calculator' },
    { id: 'advantages', label: 'Advantages', icon: Star, descKey: 'advantages' },
    { id: 'automation', label: 'Automation', icon: Bot, descKey: 'automation' },
    { id: 'services', label: 'Services', icon: Zap, descKey: 'services' },
    { id: 'consultant', label: 'Consultant', icon: Users, descKey: 'consultant' },
    { id: 'pricing', label: 'Pricing', icon: CreditCard, descKey: 'pricing' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, descKey: 'faq' },
    { id: 'blog', label: 'Blog', icon: BookOpen, descKey: 'blog' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('landing.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('landing.subtitle')}</p>
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
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{t('landing.edit')}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('landing.coming_soon')}
      </p>
    </div>
  );
};

export default AdminLandingPage;
