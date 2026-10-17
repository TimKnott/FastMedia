import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedCaseStudies } from '@/hooks/useCaseStudies';
import CaseStudyCard from '@/components/CaseStudyCard';

/** Homepage summary of the case studies, with a thumbnail for each. */
const CaseStudiesSection = () => {
  const { language } = useLanguage();
  const isEnglish = language !== 'cs';
  const { data } = usePublishedCaseStudies();
  const items = (data ?? []).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section id="case-studies" className="py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {language === 'de' ? 'Projektbeispiele' : isEnglish ? 'Case studies' : 'Případové studie'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'de' ? 'Echte Website-Projekte mit Screenshots. Beschreibungen und PDFs stehen in der verfügbaren Originalsprache bereit.' : isEnglish
              ? 'Real projects and the numbers that followed. Open any study as a PDF.'
              : 'Skutečné projekty a čísla, která přinesly. Každou studii lze otevřít jako PDF.'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <CaseStudyCard key={item.id} item={item} compact />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link to="/case-studies">
              {language === 'de' ? 'Alle Projektbeispiele' : isEnglish ? 'All case studies' : 'Všechny případové studie'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
