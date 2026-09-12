import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, FileText, Loader2, LogOut, MapPin, Save, Trash2, Upload, Download, CheckCircle2, Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import launchSky from '@/assets/launch-sky-moonlit.jpg';

type Lang = 'cs' | 'en';

interface Enquiry {
  id: string;
  company: string | null;
  status: string;
  created_at: string;
  details: Record<string, string>;
}

interface GrantDoc {
  id: string;
  enquiry_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
}

const copy = {
  cs: {
    seoTitle: 'Portál žadatele | Kreativní vouchery | FastMedia.Pro',
    seoDesc: 'Přihlaste se a sledujte svou žádost o kreativní voucher: regionální partner, moduly, rozpočet, referenční číslo DPMK a nahrané podklady.',
    kicker: 'Portál žadatele',
    h1: 'Vaše žádost o kreativní voucher',
    sub: 'Přihlaste se stejným e-mailem, který jste použili v navigátoru, a uvidíte svou uloženou žádost, rozpočet a dokumenty.',
    signIn: 'Přihlásit se přes Google',
    signInNote: 'Údaje vidíte jen vy a náš tým. Přístup je vázaný na váš e-mail.',
    empty: 'Pod tímto e-mailem zatím nemáme žádnou uloženou žádost z navigátoru.',
    emptyCta: 'Otevřít navigátora',
    signOut: 'Odhlásit',
    business: 'Firma',
    region: 'Kraj',
    hub: 'Regionální partner',
    modules: 'Kreativní moduly',
    budget: 'Rozpočet',
    grant: 'Odhad dotace',
    share: 'Vaše spoluúčast',
    score: 'Skóre připravenosti',
    status: 'Stav',
    dpmk: 'Referenční číslo z portálu DPMK',
    dpmkPlaceholder: 'Např. číslo podání z dpmk.cz',
    dpmkSave: 'Uložit',
    dpmkSaved: 'Referenční číslo uloženo.',
    docs: 'Podklady k žádosti',
    docsHint: 'Nahrajte výpis z rejstříku, potvrzení o bezdlužnosti, cenovou nabídku nebo prohlášení de minimis (max. 20 MB).',
    upload: 'Nahrát soubor',
    uploading: 'Nahrávám…',
    noDocs: 'Zatím žádné soubory.',
    download: 'Stáhnout',
    remove: 'Odstranit',
    statusMap: {
      new: 'Odesláno', in_progress: 'Rozpracováno', contacted: 'Kontaktováno', quoted: 'Nabídka odeslána',
    } as Record<string, string>,
    back: 'Zpět na navigátora',
  },
  en: {
    seoTitle: 'Applicant Portal | Creative Vouchers | FastMedia.Pro',
    seoDesc: 'Sign in to track your creative voucher application: regional hub, modules, budget, DPMK portal reference and uploaded documents.',
    kicker: 'Applicant portal',
    h1: 'Your creative voucher application',
    sub: 'Sign in with the same email you used in the navigator to see your saved application, budget and documents.',
    signIn: 'Sign in with Google',
    signInNote: 'Only you and our team can see your details. Access is tied to your email.',
    empty: 'We have no saved application from the navigator under this email yet.',
    emptyCta: 'Open the navigator',
    signOut: 'Sign out',
    business: 'Business',
    region: 'Region',
    hub: 'Regional partner',
    modules: 'Creative modules',
    budget: 'Budget',
    grant: 'Estimated grant',
    share: 'Your share',
    score: 'Readiness score',
    status: 'Status',
    dpmk: 'DPMK portal reference number',
    dpmkPlaceholder: 'E.g. the submission number from dpmk.cz',
    dpmkSave: 'Save',
    dpmkSaved: 'Reference saved.',
    docs: 'Application documents',
    docsHint: 'Upload your registry extract, debt-free certificates, supplier quote or de minimis declaration (max. 20 MB).',
    upload: 'Upload file',
    uploading: 'Uploading…',
    noDocs: 'No files yet.',
    download: 'Download',
    remove: 'Delete',
    statusMap: {
      new: 'Submitted', in_progress: 'Draft', contacted: 'Contacted', quoted: 'Proposal sent',
    } as Record<string, string>,
    back: 'Back to the navigator',
  },
} as const;

const fmtCzk = (n: number) => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;

export default function GrantPortal() {
  const { language } = useLanguage();
  const lang: Lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];

  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [docs, setDocs] = useState<GrantDoc[]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [savingRef, setSavingRef] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = async (uid: string) => {
    const { data: rows } = await supabase
      .from('contact_enquiries')
      .select('id, company, status, created_at, details')
      .order('created_at', { ascending: false });
    const list = (rows ?? []) as Enquiry[];
    setEnquiries(list);
    const initial: Record<string, string> = {};
    list.forEach(r => { initial[r.id] = r.details?.['DPMK reference'] ?? ''; });
    setRefs(initial);
    const { data: d } = await supabase
      .from('grant_documents' as never)
      .select('id, enquiry_id, file_name, file_path, file_size, created_at')
      .eq('owner_id', uid)
      .order('created_at', { ascending: false });
    setDocs((d ?? []) as unknown as GrantDoc[]);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        setUserId(s.user.id);
        setEmail(s.user.email ?? null);
        void load(s.user.id);
      } else {
        setUserId(null);
        setEmail(null);
      }
      setSessionReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
        void load(session.user.id);
      }
      setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const res = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/grant-portal`,
    });
    if ('error' in res && res.error) toast.error(String(res.error));
  };

  const saveRef = async (enquiry: Enquiry) => {
    setSavingRef(enquiry.id);
    const value = refs[enquiry.id]?.trim() ?? '';
    const details = { ...enquiry.details };
    if (value) details['DPMK reference'] = value;
    else delete details['DPMK reference'];
    const { error } = await supabase.from('contact_enquiries').update({ details }).eq('id', enquiry.id);
    if (error) toast.error(lang === 'cs' ? 'Uložení se nepodařilo.' : 'Could not save.');
    else {
      toast.success(t.dpmkSaved);
      setEnquiries(prev => prev.map(e => (e.id === enquiry.id ? { ...e, details } : e)));
    }
    setSavingRef(null);
  };

  const upload = async (enquiryId: string, file: File) => {
    if (!userId) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error(lang === 'cs' ? 'Soubor je větší než 20 MB.' : 'File is larger than 20 MB.');
      return;
    }
    setUploading(enquiryId);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80);
    const path = `${userId}/${enquiryId}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage.from('grant-documents').upload(path, file);
    if (upErr) {
      toast.error(lang === 'cs' ? 'Nahrání se nepodařilo.' : 'Upload failed.');
      setUploading(null);
      return;
    }
    const { data: row, error: insErr } = await supabase
      .from('grant_documents' as never)
      .insert({ enquiry_id: enquiryId, owner_id: userId, file_name: file.name, file_path: path, file_size: file.size } as never)
      .select('id, enquiry_id, file_name, file_path, file_size, created_at')
      .single();
    if (insErr || !row) {
      toast.error(lang === 'cs' ? 'Soubor se nepodařilo zaregistrovat.' : 'Could not register the file.');
    } else {
      setDocs(prev => [row as unknown as GrantDoc, ...prev]);
      toast.success(lang === 'cs' ? 'Soubor nahrán.' : 'File uploaded.');
    }
    setUploading(null);
  };

  const download = async (doc: GrantDoc) => {
    const { data, error } = await supabase.storage.from('grant-documents').createSignedUrl(doc.file_path, 120);
    if (error || !data) return toast.error(lang === 'cs' ? 'Soubor se nepodařilo otevřít.' : 'Could not open the file.');
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const remove = async (doc: GrantDoc) => {
    const { error } = await supabase.from('grant_documents' as never).delete().eq('id', doc.id);
    if (error) return toast.error(lang === 'cs' ? 'Soubor se nepodařilo odstranit.' : 'Could not delete the file.');
    await supabase.storage.from('grant-documents').remove([doc.file_path]);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const statusLabel = useMemo(() => (s: string) => t.statusMap[s] ?? s, [t]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/grant-portal" />

      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="font-display font-bold text-lg">FastMedia<span className="text-accent">.Pro</span></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {userId && (
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                <LogOut className="w-4 h-4 mr-1" />{t.signOut}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="launch-hero relative isolate overflow-hidden bg-launch text-launch-foreground">
        <img src={launchSky} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 launch-stars" aria-hidden />
        <div className="absolute inset-0 launch-hero__shade" aria-hidden />
        <div className="absolute inset-0 launch-hero__vignette" aria-hidden />
        <div className="container mx-auto px-4 relative z-10 py-12 md:py-16 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-launch-accent tracking-[0.24em] uppercase text-xs">{t.kicker}</p>
            <h1 className="mt-3 font-display font-bold text-3xl md:text-4xl">{t.h1}</h1>
            <p className="mt-3 text-launch-foreground/80 text-sm md:text-base">{t.sub}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          {!sessionReady ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !userId ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Button size="lg" onClick={signIn} className="w-full sm:w-auto">
                  {t.signIn} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="mt-4 text-xs text-muted-foreground max-w-md mx-auto">{t.signInNote}</p>
              </CardContent>
            </Card>
          ) : enquiries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Inbox className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">{t.empty}</p>
                <Button asChild className="mt-5">
                  <Link to="/grant-wizard">{t.emptyCta} <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{email}</p>
              {enquiries.map(e => {
                const d = e.details ?? {};
                const budget = Number(d['Project budget (CZK)'] ?? 0);
                const grant = Number(d['Estimated reimbursement (CZK)'] ?? 0);
                const share = Number(d['Client share (CZK)'] ?? 0);
                const myDocs = docs.filter(doc => doc.enquiry_id === e.id);
                return (
                  <Card key={e.id}>
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-lg">{d['Business name'] ?? e.company ?? t.business}</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(e.created_at).toLocaleDateString(lang === 'cs' ? 'cs-CZ' : 'en-GB')}
                          </p>
                        </div>
                        <Badge variant="secondary">{statusLabel(e.status)}</Badge>
                      </div>

                      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><dt className="text-muted-foreground">{t.region}</dt><dd className="font-medium">{d.Region ?? '—'}</dd></div>
                        <div><dt className="text-muted-foreground">{t.hub}</dt><dd className="font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" />{d['Regional hub'] ?? '—'}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-muted-foreground">{t.modules}</dt><dd className="font-medium">{d['Creative modules'] ?? '—'}</dd></div>
                        {budget > 0 && <div><dt className="text-muted-foreground">{t.budget}</dt><dd className="font-medium">{fmtCzk(budget)}</dd></div>}
                        {grant > 0 && <div><dt className="text-muted-foreground">{t.grant}</dt><dd className="font-medium text-primary">{fmtCzk(grant)}</dd></div>}
                        {share > 0 && <div><dt className="text-muted-foreground">{t.share}</dt><dd className="font-medium">{fmtCzk(share)}</dd></div>}
                        {d['Readiness score'] && <div><dt className="text-muted-foreground">{t.score}</dt><dd className="font-medium">{d['Readiness score']} / 100</dd></div>}
                      </dl>

                      <div className="rounded-lg border border-border p-4 space-y-2">
                        <label className="text-sm font-medium">{t.dpmk}</label>
                        <div className="flex gap-2">
                          <Input
                            value={refs[e.id] ?? ''}
                            placeholder={t.dpmkPlaceholder}
                            onChange={ev => setRefs(prev => ({ ...prev, [e.id]: ev.target.value }))}
                          />
                          <Button variant="outline" onClick={() => saveRef(e)} disabled={savingRef === e.id}>
                            {savingRef === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            {savingRef === e.id ? '' : t.dpmkSave}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border p-4 space-y-3">
                        <p className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{t.docs}</p>
                        <p className="text-xs text-muted-foreground">{t.docsHint}</p>
                        <div>
                          <input
                            type="file"
                            id={`up-${e.id}`}
                            className="hidden"
                            onChange={ev => {
                              const f = ev.target.files?.[0];
                              if (f) void upload(e.id, f);
                              ev.target.value = '';
                            }}
                          />
                          <Button
                            variant="secondary" size="sm"
                            disabled={uploading === e.id}
                            onClick={() => document.getElementById(`up-${e.id}`)?.click()}
                          >
                            {uploading === e.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {uploading === e.id ? t.uploading : t.upload}
                          </Button>
                        </div>
                        {myDocs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{t.noDocs}</p>
                        ) : (
                          <ul className="divide-y divide-border text-sm">
                            {myDocs.map(doc => (
                              <li key={doc.id} className="py-2 flex items-center justify-between gap-2">
                                <span className="truncate flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                  <span className="truncate">{doc.file_name}</span>
                                </span>
                                <span className="flex gap-1 shrink-0">
                                  <Button variant="ghost" size="sm" onClick={() => download(doc)} aria-label={t.download}>
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => remove(doc)} aria-label={t.remove}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
