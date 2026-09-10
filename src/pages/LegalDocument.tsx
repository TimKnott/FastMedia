import { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ScrollToTop from '@/components/ScrollToTop';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface LegalDoc {
  id: string;
  slug: string;
  region: string;
  title: string;
  summary: string | null;
  content: string;
  version: string;
  effective_date: string;
  updated_at: string;
}

const REGIONS = [
  { value: 'global', label: 'Global' },
  { value: 'eu', label: 'EU / UK' },
  { value: 'us', label: 'United States' },
];

const LegalDocument = () => {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const locale = isEnglish ? 'en-GB' : 'cs-CZ';
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const region = searchParams.get('region') || '';
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from('legal_documents')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .then(({ data }) => {
        setDocs((data as LegalDoc[]) || []);
        setLoading(false);
      });
  }, [slug]);

  if (!slug) return <Navigate to="/" replace />;

  const active =
    docs.find((d) => d.region === region) ||
    docs.find((d) => d.region === 'eu') ||
    docs.find((d) => d.region === 'global') ||
    docs[0];

  return (
    <>
      <ScrollToTop />
      <SEOHead
        title={`${active?.title || (isEnglish ? 'Legal' : 'Právní dokumenty')} — FastMedia.Pro`}
        description={active?.summary || (isEnglish ? 'Legal documentation for FastMedia.Pro' : 'Právní dokumentace FastMedia.Pro')}
        pagePath={`/legal/${slug}`}
      />
      <Navbar />
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-accent">
               ← {isEnglish ? 'Back to home' : 'Zpět na hlavní stránku'}
            </Link>
          </div>

          {loading && (
            <>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </>
          )}

          {!loading && !active && (
            <div className="text-center py-16">
               <h1 className="font-display text-3xl mb-2">{isEnglish ? 'Document not found' : 'Dokument nebyl nalezen'}</h1>
              <p className="text-muted-foreground mb-6">
                 {isEnglish ? 'The requested legal document does not exist or is not published.' : 'Požadovaný právní dokument neexistuje nebo není zveřejněn.'}
              </p>
              <Link to="/" className="text-accent underline">
                 {isEnglish ? 'Return home' : 'Zpět domů'}
              </Link>
            </div>
          )}

          {!loading && active && (
            <article>
              <header className="mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="uppercase">
                    {active.region}
                  </Badge>
                  <Badge variant="secondary">v{active.version}</Badge>
                  <span className="text-xs text-muted-foreground">
                     {isEnglish ? 'Effective' : 'Platné od'} {new Date(active.effective_date).toLocaleDateString(locale)}
                  </span>
                </div>
                <h1 className="font-display text-4xl font-bold text-foreground">{active.title}</h1>
                {active.summary && (
                  <p className="mt-3 text-muted-foreground text-lg">{active.summary}</p>
                )}

                {docs.length > 1 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                     <span className="text-xs text-muted-foreground self-center">{isEnglish ? 'Region:' : 'Oblast:'}</span>
                    {docs.map((d) => (
                      <Button
                        key={d.id}
                        size="sm"
                        variant={d.region === active.region ? 'default' : 'outline'}
                        onClick={() => setSearchParams({ region: d.region })}
                      >
                        {REGIONS.find((r) => r.value === d.region)?.label || d.region.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                )}
              </header>

              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-a:text-accent">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{active.content}</ReactMarkdown>
              </div>

              <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
                <p>
                   {isEnglish ? 'Questions? Contact' : 'Máte otázky? Napište na'}{' '}
                  <a className="text-accent" href="mailto:support@fastmedia.pro">
                    support@fastmedia.pro
                  </a>
                   . {isEnglish ? 'Last updated' : 'Naposledy aktualizováno'} {new Date(active.updated_at).toLocaleDateString(locale)}.
                </p>
              </footer>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegalDocument;
