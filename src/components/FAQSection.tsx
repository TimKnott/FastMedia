import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection = () => {
  const { t } = useLanguage();

  const faqKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            {t('faq.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            {t('faq.title')}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {t('faq.subtitle')}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqKeys.map((key) => (
            <AccordionItem
              key={key}
              value={`faq-${key}`}
              className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                {t(`faq.q${key}`)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {t(`faq.a${key}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
