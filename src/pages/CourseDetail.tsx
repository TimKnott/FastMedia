import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseRichText from '@/components/CourseRichText';
import CourseEmbed from '@/components/CourseEmbed';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedCourses, courseField, courseLearn } from '@/hooks/useCourses';

const copy = {
  cs: {
    back: 'Všechny kurzy',
    learnTitle: 'Co se v tomto kurzu naučíte',
    aboutTitle: 'O kurzu',
    courseTitle: 'Kurz',
    soon: 'Obsah kurzu sem vložíme během chvilky. Mezitím si projděte, co vás v kurzu čeká.',
    notFound: 'Takový kurz jsme nenašli.',
    freeBadge: 'Zdarma',
    loading: 'Načítáme kurz…',
    ctaTitle: 'Potřebujete pomoc s vlastním projektem?',
    ctaBody: 'Spočítejte si rozsah webu nebo si projděte navigátor kreativních voucherů.',
    ctaCalc: 'Kalkulačka webu',
    ctaGrant: 'Navigátor voucherů',
  },
  en: {
    back: 'All courses',
    learnTitle: 'What you will learn in this course',
    aboutTitle: 'About this course',
    courseTitle: 'The course',
    soon: 'The course content is being added shortly. In the meantime, see what it covers.',
    notFound: 'We could not find that course.',
    freeBadge: 'Free',
    loading: 'Loading the course…',
    ctaTitle: 'Need a hand with your own project?',
    ctaBody: 'Price your website scope or walk through the creative voucher navigator.',
    ctaCalc: 'Website calculator',
    ctaGrant: 'Voucher navigator',
  },
} as const;

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'cs';
  const t = copy[lang];
  const { data: courses = [], isLoading } = usePublishedCourses();
  const course = courses.find((c) => c.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-muted-foreground">{t.loading}</div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title={t.notFound} description={t.notFound} pagePath="/courses" />
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <h1 className="font-display text-2xl font-bold">{t.notFound}</h1>
          <Button asChild className="mt-6">
            <Link to="/courses"><ArrowLeft className="mr-2 h-4 w-4" /> {t.back}</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const title = courseField(course, 'title', lang);
  const subtitle = courseField(course, 'subtitle', lang);
  const intro = lang === 'cs' ? course.intro_cs || course.intro_en : course.intro_en || course.intro_cs;
  const learn = courseLearn(course, lang);
  const level = courseField(course, 'level_label', lang);
  const duration = courseField(course, 'duration_label', lang);
  const price = course.is_free || course.price_czk <= 0
    ? t.freeBadge
    : lang === 'cs'
      ? `${course.price_czk.toLocaleString('cs-CZ')} Kč`
      : `${course.price_czk.toLocaleString('en-GB')} CZK`;
  const hasEmbed = Boolean(course.embed_html?.trim() || course.embed_url?.trim());

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${title} | FastMedia`} description={subtitle || title} pagePath={`/courses/${course.slug}`} />
      <Navbar />

      <header className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> {t.back}
          </Link>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mt-6">
            <Badge variant="secondary" className="gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> {t.courseTitle}
            </Badge>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>}
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="gap-1.5"><BadgeCheck className="h-3.5 w-3.5" /> {price}</Badge>
              {level && <Badge variant="outline" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> {level}</Badge>}
              {duration && <Badge variant="outline" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> {duration}</Badge>}
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        {learn.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{t.learnTitle}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {learn.map((item) => (
                <Card key={item}>
                  <CardContent className="flex gap-3 p-5">
                    <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {intro?.trim() && (
          <section className="border-y border-border bg-muted/20 py-12">
            <div className="container mx-auto max-w-3xl px-4">
              <h2 className="mb-6 font-display text-2xl font-bold md:text-3xl">{t.aboutTitle}</h2>
              <CourseRichText html={intro} />
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 py-12 md:py-16">
          {hasEmbed ? (
            <CourseEmbed url={course.embed_url} html={course.embed_html} title={title} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-muted-foreground">{t.soon}</CardContent>
            </Card>
          )}
        </section>

        <section className="container mx-auto px-4 pb-16">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">{t.ctaTitle}</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">{t.ctaBody}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg"><Link to="/calculator">{t.ctaCalc}</Link></Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/grant-wizard">{t.ctaGrant} <ArrowRight className="ml-2 h-4 w-4" /></Link>
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

export default CourseDetail;
