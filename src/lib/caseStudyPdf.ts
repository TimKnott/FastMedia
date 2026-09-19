import jsPDF from 'jspdf';
import { caseField, statLabel, type CaseStudy } from '@/hooks/useCaseStudies';
import { useUnicodeFont } from '@/lib/pdfFont';

/**
 * Builds a one-page PDF summary for a case study that has no uploaded file yet,
 * so every case study can always be opened and downloaded.
 * Uses an embedded Unicode font so Czech diacritics render correctly.
 */
export const buildCaseStudyPdf = async (
  item: CaseStudy,
  lang: 'cs' | 'en' | string
): Promise<jsPDF> => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const font = await useUnicodeFont(doc);
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  doc.setFont(font, 'bold');
  doc.setFontSize(10);
  doc.text('FastMedia.Pro', margin, y);
  y += 28;

  doc.setFontSize(20);
  doc.text(doc.splitTextToSize(item.brand, width), margin, y);
  y += 30;

  const tag = caseField(item, 'tag', lang);
  if (tag) {
    doc.setFont(font, 'normal');
    doc.setFontSize(11);
    doc.text(tag, margin, y);
    y += 24;
  }

  doc.setFont(font, 'normal');
  doc.setFontSize(12);
  const summary = caseField(item, 'summary', lang);
  if (summary) {
    const lines = doc.splitTextToSize(summary, width);
    doc.text(lines, margin, y);
    y += lines.length * 16 + 12;
  }

  const body = caseField(item, 'body', lang);
  if (body) {
    const lines = doc.splitTextToSize(body, width);
    doc.text(lines, margin, y);
    y += lines.length * 16 + 12;
  }

  if (item.stats.length) {
    doc.setFont(font, 'bold');
    doc.setFontSize(13);
    doc.text(lang === 'cs' ? 'Výsledky' : 'Results', margin, y);
    y += 20;
    doc.setFontSize(12);
    item.stats.forEach((stat) => {
      doc.setFont(font, 'bold');
      doc.text(stat.value, margin, y);
      doc.setFont(font, 'normal');
      doc.text(statLabel(stat, lang), margin + 110, y);
      y += 18;
    });
    y += 12;
  }

  doc.setFont(font, 'normal');
  doc.setFontSize(9);
  doc.text(
    lang === 'cs'
      ? 'Ukázková případová studie. Uvedená čísla vycházejí z modelového projektu. fastmedia.pro'
      : 'Illustrative case study. Figures are based on a model project. fastmedia.pro',
    margin,
    doc.internal.pageSize.getHeight() - 40,
    { maxWidth: width }
  );

  return doc;
};

export const caseStudyPdfFilename = (item: CaseStudy) => `case-study-${item.slug}.pdf`;
