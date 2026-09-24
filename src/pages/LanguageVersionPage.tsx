import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LanguageVersionPage() {
  const { lang = '', '*': rest = '' } = useParams();
  const slug = rest.replace(/\/+$/, '') || 'home';
  const { data, isLoading } = useQuery({
    queryKey: ['lv', lang, slug],
    queryFn: async () => {
      const { data } = await supabase.from('language_versions' as never).select('*').eq('language_code', lang).eq('slug', slug).eq('status', 'published').maybeSingle();
      return data as any;
    },
  });
  const url = `https://www.fastmedia.pro/l/${lang}/${slug}`;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {data && (
        <Helmet htmlAttributes={{ lang }}>
          <title>{data.title}</title>
          <meta name="description" content={data.meta_description} />
          <link rel="canonical" href={url} />
          <link rel="alternate" hrefLang="en-GB" href={`https://www.fastmedia.pro${data.source_path}`} />
          <link rel="alternate" hrefLang={lang} href={url} />
        </Helmet>
      )}
      <main className="container mx-auto max-w-4xl px-4 py-14">
        {isLoading && <p className="text-muted-foreground">…</p>}
        {!isLoading && !data && (
          <div className="py-20 text-center"><p className="text-muted-foreground">This page is not available.</p><Button asChild className="mt-4"><Link to="/">FastMedia.Pro</Link></Button></div>
        )}
        {data && (
          <article lang={lang} className="space-y-8">
            <header>
              <h1 className="font-display text-3xl font-bold md:text-5xl">{data.content.h1}</h1>
              <p className="mt-5 text-lg text-muted-foreground">{data.content.intro}</p>
            </header>
            {data.content.sections?.map((s: any) => (
              <section key={s.heading}>
                <h2 className="mb-3 font-display text-2xl font-semibold">{s.heading}</h2>
                {s.paragraphs.map((p: string) => <p key={p} className="mb-2 leading-relaxed text-muted-foreground">{p}</p>)}
                {!!s.bullets.length && <ul className="list-disc space-y-1 pl-5">{s.bullets.map((b: string) => <li key={b}>{b}</li>)}</ul>}
              </section>
            ))}
            <Button asChild size="lg"><Link to="/contact">{data.content.cta_label}</Link></Button>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
