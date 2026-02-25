import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, FolderOpen } from 'lucide-react';

const folders = [
  { name: 'Hero-Bilder', count: 24, path: 'trades/' },
  { name: 'Galerie', count: 144, path: 'trades/gallery/' },
  { name: 'Blog', count: 16, path: 'blog/' },
  { name: 'Team', count: 1, path: 'team/' },
  { name: 'Sonstiges', count: 3, path: '' },
];

const AdminMedia = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Medienbibliothek</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie Bilder und Dateien der gesamten Website.</p>
        </div>
        <Button size="sm" disabled>
          <Upload className="w-4 h-4 mr-1" />
          Hochladen
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
                  <p className="text-xs text-muted-foreground">{folder.count} Dateien · src/assets/{folder.path}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Upload und Bildbearbeitung kommen bald. Zurzeit nur Vorschau verfügbar.
      </p>
    </div>
  );
};

export default AdminMedia;
