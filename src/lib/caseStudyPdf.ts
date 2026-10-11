import jsPDF from 'jspdf';
import { caseField, statLabel, type CaseStudy } from '@/hooks/useCaseStudies';
import { useUnicodeFont } from '@/lib/pdfFont';

// PDF palette mirrors the site's deep blue / coral identity (PDFs cannot read CSS tokens).
const NAVY: [number, number, number] = [15, 23, 42];
const CORAL: [number, number, number] = [255, 107, 87];
const MUTED: [number, number, number] = [100, 116, 139];

interface LoadedImage { data: string; w: number; h: number }

/** Fetches an image and re-encodes it as JPEG so jsPDF can embed any format. */
const loadImage = async (url: string): Promise<LoadedImage | null> => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const bitmap = await createImageBitmap(await res.blob());
    const scale = Math.min(1, 1400 / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/jpeg', 0.82), w: canvas.width, h: canvas.height };
  } catch {
    return null;
  }
};

/**
 * Builds a branded multi-page PDF for a case study: cover with hero screenshot,
 * story and results, then every gallery screenshot with its caption.
 */
export const buildCaseStudyPdf = async (item: CaseStudy, lang: 'cs' | 'en' | string): Promise<jsPDF> => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const font = await useUnicodeFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const width = pageW - margin * 2;
  // Site is locked to British English, so PDF labels are English.
  const cs = false;

  const gallery = [...item.gallery_images];
  const urls = [item.thumbnail_url, ...gallery.map((g) => g.url)].filter(Boolean) as string[];
  const loaded = new Map<string, LoadedImage | null>();
  await Promise.all([...new Set(urls)].map(async (u) => loaded.set(u, await loadImage(u))));

  const footer = () => {
    doc.setFont(font, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('FastMedia.Pro · www.fastmedia.pro · support@fastmedia.pro', margin, pageH - 24);
    doc.text(String(doc.getNumberOfPages()), pageW - margin, pageH - 24, { align: 'right' });
  };

  const ensure = (y: number, need: number) => {
    if (y + need <= pageH - 50) return y;
    footer();
    doc.addPage();
    doc.setFont(font, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    return margin;
  };

  const drawImage = (img: LoadedImage, y: number, maxH: number) => {
    let w = width;
    let h = (img.h / img.w) * w;
    if (h > maxH) { h = maxH; w = (img.w / img.h) * h; }
    const x = margin + (width - w) / 2;
    doc.setDrawColor(226, 232, 240);
    doc.addImage(img.data, 'JPEG', x, y, w, h);
    doc.rect(x, y, w, h);
    return y + h;
  };

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 110, 'F');
  doc.setFillColor(...CORAL);
  doc.rect(0, 110, pageW, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(font, 'bold');
  doc.setFontSize(9);
  doc.text(cs ? 'PŘÍPADOVÁ STUDIE · FASTMEDIA.PRO' : 'CASE STUDY · FASTMEDIA.PRO', margin, 40);
  doc.setFontSize(24);
  doc.text(doc.splitTextToSize(item.brand, width)[0], margin, 74);
  const tag = caseField(item, 'tag', lang);
  if (tag) {
    doc.setFont(font, 'normal');
    doc.setFontSize(11);
    doc.text(tag, margin, 96);
  }

  let y = 140;
  const heroUrl = item.thumbnail_url || gallery[0]?.url;
  const hero = heroUrl ? loaded.get(heroUrl) : null;
  if (hero) y = drawImage(hero, y, 280) + 24;
  if (!item.thumbnail_url && gallery.length) gallery.shift();

  doc.setTextColor(...NAVY);
  const summary = caseField(item, 'summary', lang);
  if (summary) {
    doc.setFont(font, 'bold');
    doc.setFontSize(13);
    const lines = doc.splitTextToSize(summary, width);
    y = ensure(y, lines.length * 18);
    doc.text(lines, margin, y);
    y += lines.length * 18 + 10;
  }

  if (item.stats.length) {
    y = ensure(y, 70);
    const colW = width / Math.min(item.stats.length, 4);
    item.stats.slice(0, 4).forEach((stat, i) => {
      const x = margin + i * colW;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x + 2, y, colW - 4, 58, 6, 6, 'F');
      doc.setFont(font, 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...CORAL);
      doc.text(stat.value, x + 12, y + 26);
      doc.setFont(font, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(doc.splitTextToSize(statLabel(stat, lang), colW - 24).slice(0, 2), x + 12, y + 40);
    });
    y += 76;
  }

  const body = caseField(item, 'body', lang);
  if (body) {
    doc.setFont(font, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    for (const line of doc.splitTextToSize(body, width) as string[]) {
      y = ensure(y, 16);
      doc.text(line, margin, y);
      y += 15;
    }
  }

  const shots = gallery.filter((g) => loaded.get(g.url));
  if (shots.length) {
    footer();
    doc.addPage();
    y = margin;
    doc.setFont(font, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...NAVY);
    doc.text(cs ? 'Snímky obrazovky' : 'Screenshots', margin, y);
    y += 24;
    for (const shot of shots) {
      const img = loaded.get(shot.url)!;
      const h = Math.min(320, (img.h / img.w) * width);
      y = ensure(y, h + 40);
      y = drawImage(img, y, 320) + 14;
      const caption = shot.caption || shot.alt;
      if (caption) {
        doc.setFont(font, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        const lines = doc.splitTextToSize(caption, width);
        doc.text(lines, margin, y);
        y += lines.length * 12;
      }
      y += 18;
    }
  }

  footer();
  return doc;
};

export const caseStudyPdfFilename = (item: CaseStudy) => `case-study-${item.slug}.pdf`;
