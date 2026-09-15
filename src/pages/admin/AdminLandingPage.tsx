import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Eye, EyeOff, Loader2, Pencil, RotateCcw, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { useAllSiteSettings } from '@/hooks/useSiteSettings';
import { HOME_SECTIONS, type HomeSectionDef } from '@/data/homeSections';

type Lang = 'cs' | 'en';
const LANGS: Lang[] = ['cs', 'en'];

interface ContentRow {
  content_key: string;
  language: string;
  value: string;
  status: string;
}

const rowKey = (key: string, lang: string, status: string) => `${key}|${lang}|${status}`;

const AdminLandingPage = () => {
  const { language } = useLanguage();
  const isCs = language !== 'en';
  const { map, setEnabled, loading: settingsLoading } = useAllSiteSettings();

  const [rows, setRows] = useState<ContentRow[]>([]);
  const [open, setOpen] = useState<HomeSectionDef | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    const { data } = await supabase
      .from('site_content')
      .select('content_key, language, value, status');
    setRows((data as ContentRow[]) ?? []);
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const rowMap = useMemo(() => {
    const m: Record<string, string> = {};
    rows.forEach((r) => {
      m[rowKey(r.content_key, r.language, r.status)] = r.value;
    });
    return m;
  }, [rows]);

  const currentValue = useCallback(
    (key: string, lang: Lang) =>
      rowMap[rowKey(key, lang, 'draft')] ?? rowMap[rowKey(key, lang, 'published')] ?? '',
    [rowMap]
  );

  const builtIn = (field: { key: string; defaultCs?: string; defaultEn?: string }, lang: Lang) => {
    const own = lang === 'cs' ? field.defaultCs : field.defaultEn;
    if (own) return own;
    const entry = (translations as unknown as Record<string, Record<string, string>>)[field.key];
    return entry?.[lang] ?? '';
  };

  const customCount = (section: HomeSectionDef) =>
    section.fields.reduce(
      (total, field) => total + LANGS.filter((lang) => currentValue(field.key, lang) !== '').length,
      0
    );

  const draftCount = (section: HomeSectionDef) =>
    section.fields.reduce(
      (total, field) =>
        total + LANGS.filter((lang) => rowMap[rowKey(field.key, lang, 'draft')] !== undefined).length,
      0
    );

  const openEditor = (section: HomeSectionDef) => {
    const next: Record<string, string> = {};
    section.fields.forEach((field) => {
      LANGS.forEach((lang) => {
        next[`${lang}:${field.key}`] = currentValue(field.key, lang);
      });
    });
    setValues(next);
    setOpen(section);
  };

  const toggleSection = async (section: HomeSectionDef, value: boolean) => {
    setBusyKey(section.settingKey);
    const error = await setEnabled(section.settingKey, value);
    setBusyKey(null);
    if (error) {
      toast.error(isCs ? 'Přepnutí se nepodařilo uložit' : 'Could not save the switch');
      return;
    }
    toast.success(
      value
        ? isCs
          ? 'Sekce je zobrazena'
          : 'Section is now shown'
        : isCs
          ? 'Sekce je skryta'
          : 'Section is now hidden'
    );
  };

  const persist = async (publish: boolean) => {
    if (!open) return;
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id ?? null;
    const now = new Date().toISOString();

    const upserts: ContentRow[] = [];
    const removals: { key: string; lang: Lang }[] = [];

    open.fields.forEach((field) => {
      LANGS.forEach((lang) => {
        const raw = (values[`${lang}:${field.key}`] ?? '').trim();
        if (raw === '') {
          if (currentValue(field.key, lang) !== '') removals.push({ key: field.key, lang });
          return;
        }
        upserts.push({
          content_key: field.key,
          language: lang,
          value: raw,
          status: publish ? 'published' : 'draft',
        });
      });
    });

    let failed = false;

    for (const removal of removals) {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('content_key', removal.key)
        .eq('language', removal.lang);
      if (error) failed = true;
    }

    if (upserts.length > 0) {
      const { error } = await supabase.from('site_content').upsert(
        upserts.map((u) => ({ ...u, updated_by: userId, updated_at: now })),
        { onConflict: 'content_key,language,status' }
      );
      if (error) failed = true;
    }

    if (publish) {
      // Published values win — clear the matching drafts.
      for (const u of upserts) {
        await supabase
          .from('site_content')
          .delete()
          .eq('content_key', u.content_key)
          .eq('language', u.language)
          .eq('status', 'draft');
      }
    }

    setSaving(false);
    await loadContent();

    if (failed) {
      toast.error(isCs ? 'Některé texty se neuložily' : 'Some texts could not be saved');
      return;
    }
    toast.success(
      publish
        ? isCs
          ? 'Zveřejněno na webu'
          : 'Published to the live website'
        : isCs
          ? 'Uloženo jako koncept'
          : 'Saved as a draft'
    );
    if (publish) setOpen(null);
  };

  const resetField = (fieldKey: string, lang: Lang) => {
    setValues((prev) => ({ ...prev, [`${lang}:${fieldKey}`]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isCs ? 'Editor domovské stránky' : 'Edit homepage'}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {isCs
              ? 'Zapněte nebo vypněte každou sekci a upravte texty v češtině i angličtině. Změny můžete uložit jako koncept nebo hned zveřejnit.'
              : 'Switch each section on or off and edit its wording in Czech and English. Save as a draft or publish straight away.'}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/" target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4" />
            {isCs ? 'Zobrazit web' : 'View website'}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {HOME_SECTIONS.map((section) => {
          const enabled = map[section.settingKey] ?? section.defaultEnabled;
          const custom = customCount(section);
          const drafts = draftCount(section);
          return (
            <Card
              key={section.id}
              className="shadow-card transition-shadow hover:shadow-md border-border/70"
            >
              <CardContent className="pt-5 pb-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {isCs ? section.labelCs : section.labelEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCs ? section.descCs : section.descEn}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={settingsLoading || busyKey === section.settingKey}
                    onCheckedChange={(value) => toggleSection(section, value)}
                    aria-label={isCs ? 'Zobrazit sekci' : 'Show section'}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={enabled ? 'default' : 'secondary'}
                    className="gap-1 text-[10px]"
                  >
                    {enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {enabled ? (isCs ? 'Zobrazeno' : 'Shown') : isCs ? 'Skryto' : 'Hidden'}
                  </Badge>
                  {custom > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {custom} {isCs ? 'vlastních textů' : 'custom texts'}
                    </Badge>
                  )}
                  {drafts > 0 && (
                    <Badge variant="outline" className="text-[10px] border-accent text-accent">
                      {drafts} {isCs ? 'konceptů' : 'drafts'}
                    </Badge>
                  )}
                </div>

                {section.fields.length > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => openEditor(section)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {isCs ? 'Upravit texty' : 'Edit wording'}
                  </Button>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {isCs
                      ? 'Vizuální sekce — bez upravitelných textů.'
                      : 'Visual section — no editable wording.'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open !== null} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {isCs ? open.labelCs : open.labelEn}
                </DialogTitle>
                <DialogDescription>
                  {isCs
                    ? 'Prázdné pole znamená, že se použije původní text webu.'
                    : 'Leave a field empty to keep the website’s built-in wording.'}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue={isCs ? 'cs' : 'en'}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cs">Čeština</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                {LANGS.map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
                    {open.fields.map((field) => {
                      const id = `${lang}:${field.key}`;
                      const fallback = builtIn(field, lang);
                      return (
                        <div key={id} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label htmlFor={id} className="text-xs">
                              {isCs ? field.labelCs : field.labelEn}
                            </Label>
                            {(values[id] ?? '') !== '' && (
                              <button
                                type="button"
                                onClick={() => resetField(field.key, lang)}
                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                {isCs ? 'Původní text' : 'Reset'}
                              </button>
                            )}
                          </div>
                          {field.multiline ? (
                            <Textarea
                              id={id}
                              rows={3}
                              value={values[id] ?? ''}
                              placeholder={fallback}
                              onChange={(e) =>
                                setValues((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                            />
                          ) : (
                            <Input
                              id={id}
                              value={values[id] ?? ''}
                              placeholder={fallback}
                              onChange={(e) =>
                                setValues((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                            />
                          )}
                          {(isCs ? field.hintCs ?? field.hint : field.hint) && (
                            <p className="text-[11px] text-muted-foreground">
                              {isCs ? field.hintCs ?? field.hint : field.hint}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>

              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setOpen(null)} disabled={saving}>
                  {isCs ? 'Zavřít' : 'Close'}
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => persist(false)} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isCs ? 'Uložit koncept' : 'Save draft'}
                </Button>
                <Button className="gap-2 gradient-accent text-accent-foreground" onClick={() => persist(true)} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isCs ? 'Zveřejnit' : 'Publish'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLandingPage;
