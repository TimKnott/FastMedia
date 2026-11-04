import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { languageAlternatives } from '@/lib/seoDynamic';

export default function LanguageVersionPage() {
  const { lang = '', '*': rest = '' } = useParams();
  const slug = rest.replace(/\/+$/, '') || 'home';
  const { data, isLoading } = useQuery({
    queryKey: ['lv', lang, slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('language_versions').select('*').eq('language_code', lang).eq('slug', slug).eq('status', 'published').maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const url = `https://www.fastmedia.pro/l/${lang}/${slug}`;
  const { data: siblings = [] } = useQuery({
    queryKey: ['lv-alternates', data?.source_path], enabled: Boolean(data?.source_path),
    queryFn: async () => {
      const { data: rows, error } = await supabase.from('language_versions').select('language_code,slug,source_path').eq('source_path', data?.source_path ?? '').eq('status', 'published');
      if (error) throw error;
      return rows ?? [];
    },
  });
  const content = data?.content as { h1: string; intro: string; cta_label: string; sections?: Array<{ heading: string; paragraphs: string[]; bullets: string[] }> } | undefined;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {data && content && (
        <Helmet htmlAttributes={{ lang }}>
          <title>{data.title}</title>
          <meta name="description" content={data.meta_description || content.intro || data.title} />
          <link rel="canonical" href={url} />
          {languageAlternatives(siblings, data.source_path).map(alternate => <link key={alternate.path} rel="alternate" hrefLang={alternate.language} href={`https://www.fastmedia.pro${alternate.path}`} />)}
          <meta name="robots" content="index, follow" />
        </Helmet>
      )}
      {!isLoading && !data && <Helmet><title>Page not available | FastMedia.Pro</title><meta name="robots" content="noindex, nofollow" /></Helmet>}
      <main className="container mx-auto max-w-4xl px-4 py-14">
        {isLoading && <p className="text-muted-foreground">…</p>}
        {!isLoading && !data && (
          <div className="py-20 text-center"><p className="text-muted-foreground">This page is not available.</p><Button asChild className="mt-4"><Link to="/">FastMedia.Pro</Link></Button></div>
        )}
        {data && content && (
          <article lang={lang} className="space-y-8">
            <header>
              <h1 className="font-display text-3xl font-bold md:text-5xl">{content.h1}</h1>
              <p className="mt-5 text-lg text-muted-foreground">{content.intro}</p>
            </header>
            {content.sections?.map((s) => (
              <section key={s.heading}>
                <h2 className="mb-3 font-display text-2xl font-semibold">{s.heading}</h2>
                {s.paragraphs.map((p: string) => <p key={p} className="mb-2 leading-relaxed text-muted-foreground">{p}</p>)}
                {!!s.bullets.length && <ul className="list-disc space-y-1 pl-5">{s.bullets.map((b: string) => <li key={b}>{b}</li>)}</ul>}
              </section>
            ))}
            <Button asChild size="lg"><Link to="/contact">{content.cta_label}</Link></Button>
            {languageAlternatives(siblings, data.source_path).length > 1 && (
              <nav aria-label="Languages" className="flex flex-wrap gap-3 border-t border-border pt-6 text-sm">
                {languageAlternatives(siblings, data.source_path).filter(a => a.language !== 'x-default').map(a => (
                  <Link key={a.path} to={a.path} hrefLang={a.language} className="underline text-muted-foreground hover:text-foreground">{a.language.toUpperCase()}</Link>
                ))}
              </nav>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
