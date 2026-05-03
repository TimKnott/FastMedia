import jsPDF from 'jspdf';
import { renderAgreement, type AgreementContext } from '@/lib/agreementTemplate';

export interface AgreementPdfOptions {
  template: string;
  context: AgreementContext;
  filename?: string;
}

/**
 * Render the agreement (with all {{tokens}} replaced from fees/context)
 * into a paginated A4 PDF and trigger a browser download.
 */
export const downloadAgreementPdf = ({ template, context, filename }: AgreementPdfOptions) => {
  const text = renderAgreement(template, context);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Sales Agreement — ${context.project_name}`, margin, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `${context.service_provider_name} · ${context.date}`,
    margin,
    margin + 14,
  );
  doc.setTextColor(0);

  // Body
  doc.setFontSize(10.5);
  const lineHeight = 14;
  let cursorY = margin + 40;

  const paragraphs = text.split(/\n/);
  for (const raw of paragraphs) {
    const isHeading = /^(DOCUMENT \d|\d+\.\d+|[A-Z][A-Z &]{6,})/.test(raw.trim()) && raw.trim().length < 80;
    if (isHeading) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    const lines = raw.trim() === '' ? [''] : doc.splitTextToSize(raw, maxWidth);
    for (const line of lines) {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }
  }

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(
      `${context.project_name} · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 24,
      { align: 'center' },
    );
    doc.setTextColor(0);
  }

  const safeName = (filename || `agreement-${context.project_name || 'project'}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  doc.save(`${safeName}.pdf`);
};
