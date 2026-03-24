import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import FAQJsonLd from '@/components/FAQJsonLd';
import { getTradeFaqs } from '@/data/tradeFaqs';

interface DemoFAQSectionProps {
  tradeId: string;
  tradeName: string;
  gradientClass: string;
}

const DemoFAQSection = ({ tradeId, tradeName, gradientClass }: DemoFAQSectionProps) => {
  const { language } = useLanguage();
  const faqs = getTradeFaqs(tradeId, tradeName);

  const labels = {
    cs: { title: 'Často kladené otázky', subtitle: 'Odpovědi na nejčastější dotazy našich zákazníků' },
    en: { title: 'Frequently Asked Questions', subtitle: 'Answers to our customers\' most common questions' },
    de: { title: 'Häufig gestellte Fragen', subtitle: 'Antworten auf die häufigsten Fragen unserer Kunden' },
  };

  const l = labels[language];

  return (
    <section id="faq" className="py-16 lg:py-24 bg-muted/30" itemScope itemType="https://schema.org/FAQPage">
      <FAQJsonLd faqs={faqs.map(f => ({ question: f.q[language], answer: f.a[language] }))} />
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center justify-center w-14 h-14 ${gradientClass} rounded-2xl mb-4`}>
            <HelpCircle className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            {l.title}
          </h2>
          <p className="text-muted-foreground text-lg">{l.subtitle}</p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  <span itemProp="name">{faq.q[language]}</span>
                </AccordionTrigger>
                <AccordionContent
                  className="text-muted-foreground pb-5 leading-relaxed"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <span itemProp="text">{faq.a[language]}</span>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DemoFAQSection;
