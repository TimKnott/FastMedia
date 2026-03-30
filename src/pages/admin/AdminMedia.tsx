import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, FolderOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminMedia = () => {
  const { t } = useLanguage();

  const folders = [
    { name: 'Hero', count: 24, path: 'trades/' },
    { name: 'Gallery', count: 144, path: 'trades/gallery/' },
    { name: 'Blog', count: 16, path: 'blog/' },
    { name: 'Team', count: 1, path: 'team/' },
    { name: 'Other', count: 3, path: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('media.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('media.subtitle')}</p>
        </div>
        <Button size="sm" disabled>
          <Upload className="w-4 h-4 mr-1" />
          {t('media.upload')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => (
          <Card key={folder.name} className="shadow-card hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <FolderOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{folder.count} {t('media.files')} · src/assets/{folder.path}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('media.coming_soon')}
      </p>
    </div>
  );
};

export default AdminMedia;
