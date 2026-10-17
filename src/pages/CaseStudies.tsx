import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SEOHead from '@/components/SEOHead';
import CaseStudyCard from '@/components/CaseStudyCard';
import CaseStudyEditorDialog from '@/components/admin/CaseStudyEditorDialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAllCaseStudies, usePublishedCaseStudies, type CaseStudy } from '@/hooks/useCaseStudies';

const CaseStudies = () => {
  const { language } = useLanguage();
  const isEnglish = language !== 'cs';
  const { isEditor } = useUserRole();
  const published = usePublishedCaseStudies();
  const all = useAllCaseStudies();
  const items = (isEditor ? all.data : published.data) ?? [];
  const isLoading = isEditor ? all.isLoading : published.isLoading;

  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: CaseStudy) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const nextSortOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Projektbeispiele – Websites von FastMedia.Pro' : (isEnglish ? 'Case Studies — Real Website Results | FastMedia.Pro' : 'Případové studie — skutečné výsledky webů | FastMedia.Pro')}
        description={
          language === 'de' ? 'Website-Projekte von FastMedia.Pro mit Screenshots und Beschreibungen. PDFs stehen in der verfügbaren Originalsprache bereit.' : isEnglish
            ? 'Case studies from FastMedia.Pro website projects: enquiry growth, booking numbers, load times and shop conversions. Each study can be opened and downloaded as a PDF.'
            : 'Případové studie webů od FastMedia.Pro: růst poptávek, rezervace, rychlost načtení a konverze e-shopů. Každou studii lze otevřít a stáhnout jako PDF.'
        }
        canonical="/case-studies"
        pagePath="/case-studies"
      />
      <div className="min-h-screen">
        <Navbar />
        <ScrollToTop />
        <main id="main-site">
          <section className="container mx-auto px-4 pt-28 pb-12 md:pt-32">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {language === 'de' ? 'Projektbeispiele' : (isEnglish ? 'Case studies' : 'Případové studie')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {language === 'de' ? 'Sehen Sie sich unsere Website-Projekte mit Screenshots an. Projektbeschreibungen und PDFs bleiben in der verfügbaren Originalsprache.' : isEnglish
                  ? 'Website projects with the numbers that followed: enquiries, bookings, order values and load times. Open any study as a PDF or download it to share with your team.'
                  : 'Webové projekty a čísla, která přinesly: poptávky, rezervace, hodnota objednávek a rychlost načtení. Každou studii si můžete otevřít jako PDF nebo stáhnout a poslat kolegům.'}
              </p>
              {isEditor && (
                <Button className="mt-6" onClick={openNew}>
                  <Plus className="w-4 h-4" />
                  {language === 'de' ? 'Projektbeispiel hinzufügen' : (isEnglish ? 'Add case study' : 'Přidat případovou studii')}
                </Button>
              )}
            </div>
          </section>

          <section className="container mx-auto px-4 pb-16">
            {isLoading ? (
              <p className="text-muted-foreground">{language === 'de' ? 'Wird geladen…' : (isEnglish ? 'Loading…' : 'Načítám…')}</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">
                {language === 'de' ? 'Noch keine Projektbeispiele veröffentlicht.' : (isEnglish ? 'No case studies published yet.' : 'Zatím nejsou zveřejněné žádné případové studie.')}
              </p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {items.map((item) => (
                  <CaseStudyCard key={item.id} item={item} canEdit={isEditor} onEdit={openEdit} />
                ))}
              </div>
            )}
          </section>

          <section className="container mx-auto px-4 pb-20">
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                {language === 'de' ? 'Planen Sie Ihr nächstes Website-Projekt?' : (isEnglish ? 'Want results like these?' : 'Chcete podobné výsledky?')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'de' ? 'Planen Sie ein größeres Projekt im Kalkulator oder informieren Sie sich über Fördermöglichkeiten und deren Voraussetzungen.' : isEnglish
                  ? 'Get an instant estimate for your own project, or see which grant could cover part of the cost.'
                  : 'Spočítejte si odhad pro svůj projekt nebo zjistěte, jaká dotace může část ceny pokrýt.'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild>
                  <Link to="/calculator">
                    {language === 'de' ? 'Preis kalkulieren' : (isEnglish ? 'Get an estimate' : 'Spočítat cenu')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/grant-wizard">{language === 'de' ? 'Fördermöglichkeiten prüfen' : (isEnglish ? 'Check grant eligibility' : 'Ověřit dotaci')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      {isEditor && (
        <CaseStudyEditorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editing}
          nextSortOrder={nextSortOrder}
        />
      )}
    </>
  );
};

export default CaseStudies;
