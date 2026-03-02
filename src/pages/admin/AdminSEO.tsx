import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sitemapEntries } from '@/data/sitemap';
import { invalidatePageSeoCache } from '@/hooks/usePageSeo';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Sparkles, Save, Globe, AlertTriangle, CheckCircle, Loader2, Lightbulb, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import SEOHead from '@/components/SEOHead';

interface PageSeoRow {
  id: string;
  page_path: string;
  language: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  noindex: boolean;
  updated_at: string;
}

interface SeoForm {
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;
  noindex: boolean;
}

const LANGUAGES = [
  { value: 'cs', label: 'Čeština' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
];

const indexablePages = sitemapEntries.filter((e) => e.indexable);

const emptyForm: SeoForm = {
  title: '',
  description: '',
  og_title: '',
  og_description: '',
  og_image: '',
  og_type: 'website',
  noindex: false,
};

const CharCounter = ({ value, max }: { value: string; max: number }) => {
  const len = value.length;
  const over = len > max;
  return (
    <span className={`text-xs ${over ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
      {len}/{max}
    </span>
  );
};

const AdminSEO = () => {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState('cs');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [form, setForm] = useState<SeoForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0, errors: 0 });

  const { data: seoRows = [], isLoading } = useQuery({
    queryKey: ['page_seo', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_seo')
        .select('*')
        .eq('language', language);
      if (error) throw error;
      return (data ?? []) as PageSeoRow[];
    },
  });

  const seoMap = new Map(seoRows.map((r) => [r.page_path, r]));

  const saveMutation = useMutation({
    mutationFn: async ({ path, values }: { path: string; values: SeoForm }) => {
      const { error } = await supabase.from('page_seo').upsert(
        {
          page_path: path,
          language,
          title: values.title || null,
          description: values.description || null,
          og_title: values.og_title || null,
          og_description: values.og_description || null,
          og_image: values.og_image || null,
          og_type: values.og_type || 'website',
          noindex: values.noindex,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_path,language' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_seo'] });
      invalidatePageSeoCache();
      toast.success('SEO uloženo');
    },
    onError: (e) => toast.error(`Chyba: ${e.message}`),
  });

  const selectPage = (path: string) => {
    setSelectedPath(path);
    setAiTips([]);
    const existing = seoMap.get(path);
    if (existing) {
      setForm({
        title: existing.title ?? '',
        description: existing.description ?? '',
        og_title: existing.og_title ?? '',
        og_description: existing.og_description ?? '',
        og_image: existing.og_image ?? '',
        og_type: existing.og_type ?? 'website',
        noindex: existing.noindex,
      });
    } else {
      setForm(emptyForm);
    }
  };

  const handleAI = async () => {
    if (!selectedPath) return;
    setAiLoading(true);
    setAiTips([]);
    try {
      const page = indexablePages.find((p) => p.path === selectedPath);
      const { data, error } = await supabase.functions.invoke('seo-ai', {
        body: {
          pagePath: selectedPath,
          pageLabel: page?.label ?? selectedPath,
          currentTitle: form.title,
          currentDescription: form.description,
          language,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setForm((prev) => ({
        ...prev,
        title: data.title ?? prev.title,
        description: data.description ?? prev.description,
        og_title: data.og_title ?? prev.og_title,
        og_description: data.og_description ?? prev.og_description,
      }));
      setAiTips(data.tips ?? []);
      toast.success('AI návrhy aplikovány');
    } catch (e: any) {
      toast.error(`AI chyba: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    const incomplete = indexablePages.filter((p) => getStatus(p.path) !== 'complete');
    if (incomplete.length === 0) {
      toast.info('Všechny stránky už mají kompletní SEO');
      return;
    }

    setBulkRunning(true);
    setBulkProgress({ done: 0, total: incomplete.length, errors: 0 });

    let errors = 0;
    for (let i = 0; i < incomplete.length; i++) {
      const page = incomplete[i];
      try {
        const existing = seoMap.get(page.path);
        const { data, error } = await supabase.functions.invoke('seo-ai', {
          body: {
            pagePath: page.path,
            pageLabel: page.label,
            currentTitle: existing?.title ?? '',
            currentDescription: existing?.description ?? '',
            language,
          },
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);

        const { error: saveError } = await supabase.from('page_seo').upsert(
          {
            page_path: page.path,
            language,
            title: data.title || existing?.title || null,
            description: data.description || existing?.description || null,
            og_title: data.og_title || existing?.og_title || null,
            og_description: data.og_description || existing?.og_description || null,
            og_image: existing?.og_image || null,
            og_type: existing?.og_type || 'website',
            noindex: existing?.noindex ?? false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'page_path,language' }
        );
        if (saveError) throw saveError;
      } catch (e: any) {
        console.error(`Bulk SEO error for ${page.path}:`, e);
        errors++;
      }
      setBulkProgress({ done: i + 1, total: incomplete.length, errors });

      // Rate limit delay
      if (i < incomplete.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    queryClient.invalidateQueries({ queryKey: ['page_seo'] });
    invalidatePageSeoCache();
    setBulkRunning(false);

    if (errors === 0) {
      toast.success(`AI vygeneroval SEO pro ${incomplete.length} stránek`);
    } else {
      toast.warning(`Dokončeno s ${errors} chybami z ${incomplete.length} stránek`);
    }
  };

  const filtered = indexablePages.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.path.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (path: string) => {
    const row = seoMap.get(path);
    if (!row) return 'missing';
    if (!row.title && !row.description) return 'missing';
    if (!row.title || !row.description) return 'partial';
    return 'complete';
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <SEOHead title="SEO Management" description="Manage per-page SEO" noindex />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">SEO Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Spravujte meta tagy, OG značky a indexování pro každou stránku
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkGenerate}
            disabled={bulkRunning || isLoading}
          >
            {bulkRunning ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-1" />
            )}
            {bulkRunning ? `${bulkProgress.done}/${bulkProgress.total}` : 'AI bulk'}
          </Button>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {bulkRunning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Generuji SEO pro {bulkProgress.total} stránek…</span>
            <span>{Math.round((bulkProgress.done / bulkProgress.total) * 100)}%{bulkProgress.errors > 0 && ` (${bulkProgress.errors} chyb)`}</span>
          </div>
          <Progress value={(bulkProgress.done / bulkProgress.total) * 100} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Hledat stránky…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto space-y-1 p-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              filtered.map((page) => {
                const status = getStatus(page.path);
                return (
                  <button
                    key={page.path}
                    onClick={() => selectPage(page.path)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                      selectedPath === page.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {statusIcon(status)}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{page.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{page.path}</div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          {!selectedPath ? (
            <CardContent className="flex items-center justify-center min-h-[400px] text-muted-foreground">
              <div className="text-center">
                <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Vyberte stránku pro úpravu SEO</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">
                  {indexablePages.find((p) => p.path === selectedPath)?.label}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAI}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-1" />
                    )}
                    AI návrh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveMutation.mutate({ path: selectedPath, values: form })}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Uložit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="meta">
                  <TabsList>
                    <TabsTrigger value="meta">Meta tagy</TabsTrigger>
                    <TabsTrigger value="og">Open Graph</TabsTrigger>
                    <TabsTrigger value="advanced">Pokročilé</TabsTrigger>
                  </TabsList>

                  <TabsContent value="meta" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Title</Label>
                        <CharCounter value={form.title} max={60} />
                      </div>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Název stránky…"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Description</Label>
                        <CharCounter value={form.description} max={155} />
                      </div>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Meta popis stránky…"
                        rows={3}
                      />
                    </div>

                    {/* SERP preview */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium mb-2">Náhled ve vyhledávači</p>
                      <p className="text-blue-600 text-base font-medium truncate">
                        {form.title || 'Název stránky'}
                      </p>
                      <p className="text-green-700 text-xs truncate">
                        https://fastmedia.pro{selectedPath}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {form.description || 'Zde se zobrazí meta popis…'}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="og" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>OG Title</Label>
                        <CharCounter value={form.og_title} max={70} />
                      </div>
                      <Input
                        value={form.og_title}
                        onChange={(e) => setForm((f) => ({ ...f, og_title: e.target.value }))}
                        placeholder="Open Graph titulek…"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>OG Description</Label>
                        <CharCounter value={form.og_description} max={200} />
                      </div>
                      <Textarea
                        value={form.og_description}
                        onChange={(e) => setForm((f) => ({ ...f, og_description: e.target.value }))}
                        placeholder="Open Graph popis…"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image URL</Label>
                      <Input
                        value={form.og_image}
                        onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
                        placeholder="https://…"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Type</Label>
                      <Select
                        value={form.og_type}
                        onValueChange={(v) => setForm((f) => ({ ...f, og_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">website</SelectItem>
                          <SelectItem value="article">article</SelectItem>
                          <SelectItem value="profile">profile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium text-sm">Noindex</p>
                        <p className="text-xs text-muted-foreground">
                          Zabránit indexování stránky vyhledávači
                        </p>
                      </div>
                      <Switch
                        checked={form.noindex}
                        onCheckedChange={(v) => setForm((f) => ({ ...f, noindex: v }))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* AI Tips */}
                {aiTips.length > 0 && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Lightbulb className="w-4 h-4" />
                      AI tipy pro tuto stránku
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      {aiTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-3 flex-wrap">
                  {(() => {
                    const total = indexablePages.length;
                    const complete = indexablePages.filter((p) => getStatus(p.path) === 'complete').length;
                    const partial = indexablePages.filter((p) => getStatus(p.path) === 'partial').length;
                    const missing = total - complete - partial;
                    return (
                      <>
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" /> {complete} kompletní
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" /> {partial} částečné
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <AlertTriangle className="w-3 h-3 text-destructive" /> {missing} chybí
                        </Badge>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminSEO;
