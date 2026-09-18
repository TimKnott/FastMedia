import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Sparkles, Clock, BarChart3, BadgeCheck, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseRichText from '@/components/CourseRichText';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedCourses, courseField, courseLearn } from '@/hooks/useCourses';

const copy = {
  cs: {
    seoTitle: 'Kurzy: tvorba webu a kreativní vouchery EU | FastMedia',
    seoDesc:
      'Bezplatné online kurzy o plánování a tvorbě webu a o tom, jak funguje evropský systém kreativních voucherů pro podnikatele v Česku.',
    switchLabel: 'English',
    kicker: 'Akademie FastMedia',
    h1: 'Naučte se plánovat web — a financovat ho z evropských grantů',
    sub: 'Krátké, praktické kurzy pro podnikatele, kteří chtějí rozumět tomu, co si objednávají. Žádný žargon, žádná teorie do šuplíku: každý kurz projdete za jedno odpoledne a odnesete si rozhodnutí, která šetří peníze.',
    introTitle: 'Proč tyto kurzy vznikly',
    intro:
      'Většina majitelů firem si web objednává jednou za pět let a nemá s čím porovnávat. Výsledkem jsou drahé chyby: špatně zvolený rozsah, chybějící texty, zapomenutá měřitelnost a promeškané dotační výzvy. V našich kurzech vás vezmeme celým procesem — od prvního nákresu stránky až po podání žádosti o kreativní voucher, kde může stát pokrýt až 85 % způsobilých nákladů.',
    intro2:
      'Kurzy vedeme v jednoduchém jazyce, s reálnými čísly z českého trhu a s konkrétními formuláři, které budete potřebovat. Můžete je projít sami, vlastním tempem, a kdykoliv se vrátit.',
    freeBadge: 'Zdarma',
    all: 'Všechny kurzy jsou zatím zdarma.',
    learnTitle: 'Co se naučíte',
    open: 'Otevřít kurz',
    empty: 'Zatím zde není žádný zveřejněný kurz. Vracíme se brzy.',
    ctaTitle: 'Chcete web postavit s námi?',
    ctaBody: 'Spočítejte si rozsah a cenu za dvě minuty, nebo si projděte navigátor kreativních voucherů.',
    ctaCalc: 'Kalkulačka webu',
    ctaGrant: 'Navigátor voucherů',
    loading: 'Načítáme kurzy…',
  },
  en: {
    seoTitle: 'Courses: website planning and EU creative grants | FastMedia',
    seoDesc:
      'Free online courses on planning and building a website, and on how the EU creative voucher system helps Czech businesses fund their projects.',
    switchLabel: 'Čeština',
    kicker: 'FastMedia Academy',
    h1: 'Learn to plan a website — and fund it with European grants',
    sub: 'Short, practical courses for business owners who want to understand what they are buying. No jargon and no shelf-ware theory: each course takes an afternoon and leaves you with decisions that save money.',
    introTitle: 'Why these courses exist',
    intro:
      'Most owners commission a website once every five years and have nothing to compare it against. The result is expensive mistakes: the wrong scope, missing copy, no measurement and missed funding deadlines. These courses take you through the whole process — from the first sketch of a page to submitting a creative voucher application, where the state can cover up to 85% of eligible costs.',
    intro2:
      'Everything is written in plain English, with real figures from the Czech market and the actual forms you will need. Work through them at your own pace and come back whenever you like.',
    freeBadge: 'Free',
    all: 'Every course is free for now.',
    learnTitle: 'What you will learn',
    open: 'Open the course',
    empty: 'No course has been published yet. Please check back soon.',
    ctaTitle: 'Want us to build the website?',
    ctaBody: 'Price your scope in two minutes, or walk through the creative voucher navigator.',
    ctaCalc: 'Website calculator',
    ctaGrant: 'Voucher navigator',
    loading: 'Loading courses…',
  },
} as const;

const Courses = () => {
  const { language, setLanguage } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];
  const { data: courses = [], isLoading } = usePublishedCourses();

  const priceLabel = (isFree: boolean, price: number) => {
    if (isFree || price <= 0) return t.freeBadge;
    return lang === 'cs'
      ? `${price.toLocaleString('cs-CZ')} Kč`
      : `${price.toLocaleString('en-GB')} CZK`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t.seoTitle} description={t.seoDesc} pagePath="/courses" />
      <Navbar />

      <header className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Badge variant="secondary" className="gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> {t.kicker}
            </Badge>
            <button
              type="button"
              onClick={() => setLanguage(lang === 'cs' ? 'en' : 'cs')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t.switchLabel}
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{t.h1}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t.sub}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> {t.all}
            </p>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{t.introTitle}</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
            <p>{t.intro}</p>
            <p>{t.intro2}</p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <p className="text-muted-foreground">{t.loading}</p>
            ) : courses.length === 0 ? (
              <p className="text-muted-foreground">{t.empty}</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {courses.map((course, index) => {
                  const learn = courseLearn(course, lang).slice(0, 4);
                  const level = courseField(course, 'level_label', lang);
                  const duration = courseField(course, 'duration_label', lang);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                    >
                      <Card className="h-full border-border">
                        <CardContent className="flex h-full flex-col p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge className="gap-1.5">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              {priceLabel(course.is_free, course.price_czk)}
                            </Badge>
                            {level && (
                              <Badge variant="outline" className="gap-1.5">
                                <BarChart3 className="h-3.5 w-3.5" /> {level}
                              </Badge>
                            )}
                            {duration && (
                              <Badge variant="outline" className="gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> {duration}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-display text-xl font-bold leading-snug">
                            {courseField(course, 'title', lang)}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">{courseField(course, 'subtitle', lang)}</p>

                          {learn.length > 0 && (
                            <div className="mt-5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{t.learnTitle}</p>
                              <ul className="mt-3 space-y-2">
                                {learn.map((item) => (
                                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-6 pt-2">
                            <Button asChild>
                              <Link to={`/courses/${course.slug}`}>
                                {t.open} <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 md:py-20">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">{t.ctaTitle}</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">{t.ctaBody}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/calculator">{t.ctaCalc}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/grant-wizard">{t.ctaGrant}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
