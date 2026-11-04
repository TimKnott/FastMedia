import { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApprovedReviews, initials } from '@/hooks/useApprovedReviews';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(255),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().min(10).max(1500),
});

export default function Reviews() {
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: reviews = [], isLoading } = useApprovedReviews();
  const [form, setForm] = useState({ name: '', company: '', email: '', review_text: '' });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, company: form.company || undefined, rating });
    if (!parsed.success) {
      toast.error(en ? 'Please fill in your name, email, a star rating and at least 10 characters.' : 'Vyplňte jméno, e-mail, hodnocení hvězdičkami a alespoň 10 znaků.');
      return;
    }
    setSending(true);
    const { error } = await (supabase as any).from('client_reviews').insert({ ...parsed.data, company: parsed.data.company ?? null });
    setSending(false);
    if (error) return toast.error(en ? 'Sorry, something went wrong. Please try again.' : 'Omlouváme se, něco se pokazilo. Zkuste to znovu.');
    setDone(true);
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={en ? 'Client reviews | FastMedia.Pro' : 'Recenze klientů | FastMedia.Pro'}
        description={en ? 'Read genuine reviews from FastMedia.Pro clients and leave your own star rating.' : 'Přečtěte si skutečné recenze klientů FastMedia.Pro a napište vlastní hodnocení.'}
        pagePath="/reviews"
        noindex
      />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 pt-28 pb-20 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">{en ? 'Client reviews' : 'Recenze klientů'}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          {en ? 'Every review here comes from a real client and is checked by us before it appears.' : 'Každá recenze pochází od skutečného klienta a před zveřejněním ji kontrolujeme.'}
          {avg && <span className="ml-2 font-semibold text-foreground">★ {avg} ({reviews.length})</span>}
        </p>

        <div className="grid lg:grid-cols-5 gap-8 mt-10">
          <section className="lg:col-span-3 space-y-4">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!isLoading && reviews.length === 0 && (
              <p className="text-muted-foreground">{en ? 'No reviews yet. Be the first to leave one.' : 'Zatím žádné recenze. Buďte první.'}</p>
            )}
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <div className="flex gap-1 mb-2" aria-label={`${r.rating}/5`}>
                    {[...Array(5)].map((_, s) => <Star key={s} className={`w-4 h-4 ${s < r.rating ? 'text-accent fill-accent' : 'text-muted'}`} />)}
                  </div>
                  <p className="text-foreground leading-relaxed">“{r.review_text}”</p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold">{initials(r.name)}</div>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      {r.company && <p className="text-xs text-muted-foreground">{r.company}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <aside className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-6">
                {done ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
                    <p className="font-semibold">{en ? 'Thank you for your review!' : 'Děkujeme za recenzi!'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{en ? 'It will appear once we have checked it.' : 'Zobrazí se, jakmile ji zkontrolujeme.'}</p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-3">
                    <h2 className="text-xl font-display font-bold">{en ? 'Leave a review' : 'Napsat recenzi'}</h2>
                    <div className="flex gap-1" role="radiogroup" aria-label={en ? 'Star rating' : 'Hodnocení'}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" aria-label={`${n}/5`} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
                          <Star className={`w-8 h-8 ${n <= (hover || rating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                    <Input placeholder={en ? 'Your name *' : 'Vaše jméno *'} value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Input placeholder={en ? 'Company (optional)' : 'Firma (nepovinné)'} value={form.company} maxLength={120} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    <Input type="email" placeholder={en ? 'Email * (never shown)' : 'E-mail * (nezveřejňujeme)'} value={form.email} maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <Textarea rows={5} placeholder={en ? 'Your experience working with us *' : 'Vaše zkušenost se spoluprací *'} value={form.review_text} maxLength={1500} onChange={(e) => setForm({ ...form, review_text: e.target.value })} />
                    <Button type="submit" className="w-full" disabled={sending}>
                      {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{en ? 'Send review' : 'Odeslat recenzi'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
