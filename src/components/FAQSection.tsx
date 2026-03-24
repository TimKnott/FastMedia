import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import EditableText from '@/components/EditableText';
import { useSiteContent } from '@/hooks/useSiteContent';
import FAQJsonLd from '@/components/FAQJsonLd';

const FAQSection = () => {
  const { t } = useLanguage();
  const { getContent, invalidate } = useSiteContent();

  const faqKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const faqItems = faqKeys.map((key) => ({
    question: getContent(`faq.q${key}`, '') || t(`faq.q${key}`),
    answer: getContent(`faq.a${key}`, '') || t(`faq.a${key}`),
  }));

  return (
    <section id="faq" className="py-20 bg-muted/30" itemScope itemType="https://schema.org/FAQPage">
      <FAQJsonLd faqs={faqItems} />
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            {t('faq.label')}
          </span>
          <EditableText
            contentKey="faq.title"
            defaultValue={t('faq.title')}
            value={getContent('faq.title', '') || undefined}
            onSave={invalidate}
            as="h2"
            className="text-3xl md:text-4xl font-bold mt-2 text-foreground"
          />
          <EditableText
            contentKey="faq.subtitle"
            defaultValue={t('faq.subtitle')}
            value={getContent('faq.subtitle', '') || undefined}
            onSave={invalidate}
            as="p"
            className="text-muted-foreground mt-4 text-lg"
          />
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqKeys.map((key) => (
            <AccordionItem
              key={key}
              value={`faq-${key}`}
              className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                <EditableText
                  contentKey={`faq.q${key}`}
                  defaultValue={t(`faq.q${key}`)}
                  value={getContent(`faq.q${key}`, '') || undefined}
                  onSave={invalidate}
                  as="span"
                  className="text-left"
                  itemProp="name"
                />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <EditableText
                  contentKey={`faq.a${key}`}
                  defaultValue={t(`faq.a${key}`)}
                  value={getContent(`faq.a${key}`, '') || undefined}
                  onSave={invalidate}
                  as="span"
                  multiline
                  itemProp="text"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
