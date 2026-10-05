import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { caseStudiesTable, type CaseStudy, type CaseStudyStat } from '@/hooks/useCaseStudies';
import { useToast } from '@/hooks/use-toast';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const emptyStats: CaseStudyStat[] = [
  { value: '', label_cs: '', label_en: '' },
  { value: '', label_cs: '', label_en: '' },
  { value: '', label_cs: '', label_en: '' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing case study to edit, or null to create a new one. */
  item?: CaseStudy | null;
  /** Sort position given to a newly created case study. */
  nextSortOrder?: number;
}

const CaseStudyEditorDialog = ({ open, onOpenChange, item = null, nextSortOrder = 1 }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [tagCs, setTagCs] = useState('');
  const [tagEn, setTagEn] = useState('');
  const [summaryCs, setSummaryCs] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [bodyCs, setBodyCs] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [stats, setStats] = useState<CaseStudyStat[]>(emptyStats);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfPath, setPdfPath] = useState('');
  const [published, setPublished] = useState(true);
  const [gallery, setGallery] = useState<CaseStudyImage[]>([]);

  useEffect(() => {
    if (!open) return;
    setSlug(item?.slug ?? '');
    setBrand(item?.brand ?? '');
    setTagCs(item?.tag_cs ?? '');
    setTagEn(item?.tag_en ?? '');
    setSummaryCs(item?.summary_cs ?? '');
    setSummaryEn(item?.summary_en ?? '');
    setBodyCs(item?.body_cs ?? '');
    setBodyEn(item?.body_en ?? '');
    setStats(item?.stats?.length ? item.stats : emptyStats);
    setThumbnailUrl(item?.thumbnail_url ?? '');
    setPdfUrl(item?.pdf_url ?? '');
    setPdfPath(item?.pdf_path ?? '');
    setPublished(item?.is_published ?? true);
    setGallery(item?.gallery_images ?? []);
  }, [open, item]);

  const updateGallery = (index: number, patch: Partial<CaseStudyImage>) =>
    setGallery((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  const moveGallery = (index: number, d: number) =>
    setGallery((prev) => {
      const next = [...prev];
      const t = index + d;
      if (t < 0 || t >= next.length) return prev;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });

  const uploadGalleryFiles = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const safeName = slugify(file.name.replace(/\.[^.]+$/, ''));
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `gallery/${Date.now()}-${safeName}.${ext}`;
        const { error } = await supabase.storage.from('case-studies').upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data } = await supabase.storage.from('case-studies').createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        if (data?.signedUrl) setGallery((prev) => [...prev, { url: data.signedUrl, alt: `${brand || 'Project'} screenshot` }]);
      }
      toast({ title: 'Screenshots uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const updateStat = (index: number, patch: Partial<CaseStudyStat>) =>
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const uploadFile = async (file: File, kind: 'pdf' | 'image') => {
    setUploading(true);
    try {
      const safeName = slugify(file.name.replace(/\.[^.]+$/, ''));
      const ext = file.name.split('.').pop() ?? (kind === 'pdf' ? 'pdf' : 'jpg');
      const path = `${kind}/${Date.now()}-${safeName}.${ext}`;
      const { error } = await supabase.storage.from('case-studies').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      if (kind === 'pdf') {
        setPdfPath(path);
        setPdfUrl('');
      } else {
        const { data } = await supabase.storage.from('case-studies').createSignedUrl(path, 60 * 60 * 24 * 365);
        setThumbnailUrl(data?.signedUrl ?? '');
      }
      toast({ title: kind === 'pdf' ? 'PDF uploaded' : 'Image uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!brand.trim()) {
      toast({ title: 'Add a brand or project name', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: (slug.trim() || slugify(brand)).slice(0, 80),
        brand: brand.trim(),
        tag_cs: tagCs.trim(),
        tag_en: tagEn.trim(),
        summary_cs: summaryCs.trim(),
        summary_en: summaryEn.trim(),
        body_cs: bodyCs.trim(),
        body_en: bodyEn.trim(),
        stats: stats.filter((s) => s.value.trim()),
        thumbnail_url: thumbnailUrl.trim() || null,
        pdf_url: pdfUrl.trim() || null,
        pdf_path: pdfPath.trim() || null,
        is_published: published,
        gallery_images: gallery
          .filter((g) => g.url.trim())
          .map((g) => ({ url: g.url.trim(), alt: g.alt.trim() || `${brand.trim()} screenshot`, ...(g.caption?.trim() ? { caption: g.caption.trim() } : {}) })),
      };
      const { error } = item
        ? await caseStudiesTable().update(payload).eq('id', item.id)
        : await caseStudiesTable().insert({ ...payload, sort_order: nextSortOrder });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['case-studies'] });
      toast({ title: item ? 'Case study updated' : 'Case study added' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Could not save', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit case study' : 'New case study'}</DialogTitle>
          <DialogDescription>
            Attach the PDF visitors can open and download, and write the Czech and English summary shown on the site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cs-brand">Brand / project</Label>
              <Input id="cs-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Northwater — plumbing & heating" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-slug">Web address (leave empty to generate)</Label>
              <Input id="cs-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="northwater-plumbing" />
            </div>
          </div>

          <Tabs defaultValue="cs">
            <TabsList>
              <TabsTrigger value="cs">Čeština</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="cs" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cs-tag-cs">Odvětví</Label>
                <Input id="cs-tag-cs" value={tagCs} onChange={(e) => setTagCs(e.target.value)} placeholder="Řemesla" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cs-sum-cs">Krátké shrnutí</Label>
                <Textarea id="cs-sum-cs" rows={3} value={summaryCs} onChange={(e) => setSummaryCs(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cs-body-cs">Delší popis</Label>
                <Textarea id="cs-body-cs" rows={5} value={bodyCs} onChange={(e) => setBodyCs(e.target.value)} />
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cs-tag-en">Industry</Label>
                <Input id="cs-tag-en" value={tagEn} onChange={(e) => setTagEn(e.target.value)} placeholder="Trades" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cs-sum-en">Short summary</Label>
                <Textarea id="cs-sum-en" rows={3} value={summaryEn} onChange={(e) => setSummaryEn(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cs-body-en">Longer description</Label>
                <Textarea id="cs-body-en" rows={5} value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <Label>Headline numbers</Label>
            {stats.map((stat, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <Input value={stat.value} onChange={(e) => updateStat(i, { value: e.target.value })} placeholder="+312 %" />
                <Input value={stat.label_cs} onChange={(e) => updateStat(i, { label_cs: e.target.value })} placeholder="poptávek za 90 dnů" />
                <Input value={stat.label_en} onChange={(e) => updateStat(i, { label_en: e.target.value })} placeholder="enquiries in 90 days" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cs-thumb">Thumbnail image</Label>
              <Input id="cs-thumb" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="/case-studies/case-plumbing.jpg" />
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'image')}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cs-pdf">PDF</Label>
              <Input
                id="cs-pdf"
                value={pdfPath || pdfUrl}
                onChange={(e) => {
                  setPdfPath('');
                  setPdfUrl(e.target.value);
                }}
                placeholder="Upload a PDF or paste a link"
              />
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'pdf')}
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Screenshot gallery (3–7 recommended, first one is used when there is no thumbnail)</Label>
            {gallery.map((g, i) => (
              <div key={`${g.url}-${i}`} className="flex gap-3 items-start rounded-lg border border-border p-3">
                <img src={g.url} alt="" className="w-20 h-14 object-cover object-top rounded" />
                <div className="flex-1 space-y-2">
                  <Input value={g.alt} onChange={(e) => updateGallery(i, { alt: e.target.value })} placeholder="Describe the screenshot" aria-label="Screenshot description" />
                  <Input value={g.caption ?? ''} onChange={(e) => updateGallery(i, { caption: e.target.value })} placeholder="Caption (optional)" aria-label="Screenshot caption" />
                </div>
                <div className="flex flex-col gap-1">
                  <Button type="button" size="icon" variant="ghost" disabled={i === 0} onClick={() => moveGallery(i, -1)} aria-label="Move screenshot up"><ArrowUp className="w-4 h-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" disabled={i === gallery.length - 1} onClick={() => moveGallery(i, 1)} aria-label="Move screenshot down"><ArrowDown className="w-4 h-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setGallery((p) => p.filter((_, j) => j !== i))} aria-label="Remove screenshot"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Add screenshots</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files?.length && uploadGalleryFiles(e.target.files)} />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">Visible on the website</p>
              <p className="text-sm text-muted-foreground">Switch off to keep it as a draft.</p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || uploading}>
            {(saving || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Save changes' : 'Add case study'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CaseStudyEditorDialog;
