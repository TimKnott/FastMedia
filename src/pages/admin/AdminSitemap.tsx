import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Copy, ExternalLink, Check } from 'lucide-react';
import { sitemapEntries, generateSitemapXml, SitemapEntry } from '@/data/sitemap';
import { toast } from 'sonner';

const AdminSitemap = () => {
  const [entries, setEntries] = useState<SitemapEntry[]>(sitemapEntries);
  const [copied, setCopied] = useState(false);

  const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`;
  const indexable = entries.filter(e => e.indexable);
  const excluded = entries.filter(e => !e.indexable);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(sitemapUrl);
    setCopied(true);
    toast.success('URL kopiert');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyXml = () => {
    navigator.clipboard.writeText(generateSitemapXml());
    toast.success('XML kopiert');
  };

  const toggleIndexable = (path: string) => {
    setEntries(prev =>
      prev.map(e => e.path === path ? { ...e, indexable: !e.indexable } : e)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Sitemap-Verwaltung</h1>
        <p className="text-muted-foreground mt-1">XML-Sitemap verwalten und für Suchmaschinen bereitstellen.</p>
      </div>

      {/* Sitemap URL */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            Sitemap-URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg truncate">
              {sitemapUrl}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopyUrl}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Diese URL in Google Search Console unter „Sitemaps" einreichen.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-3xl font-display font-bold text-foreground">{indexable.length}</p>
            <p className="text-sm text-muted-foreground">Indexierbare Seiten</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-3xl font-display font-bold text-foreground">{excluded.length}</p>
            <p className="text-sm text-muted-foreground">Ausgeschlossene Seiten</p>
          </CardContent>
        </Card>
      </div>

      {/* Indexable pages */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Indexierbare Seiten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.path} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Switch
                  checked={entry.indexable}
                  onCheckedChange={() => toggleIndexable(entry.path)}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={entry.indexable ? 'default' : 'secondary'} className="text-xs">
                  {entry.indexable ? 'index' : 'noindex'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {entry.priority.toFixed(1)}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleCopyXml}>
          <Copy className="w-4 h-4 mr-1" />
          XML kopieren
        </Button>
      </div>
    </div>
  );
};

export default AdminSitemap;
