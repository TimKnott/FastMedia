import jsPDF from 'jspdf';

type Lang = 'cs' | 'en';

// Standard PDF fonts cannot render Czech diacritics, so the document text
// is written without them; the on-page content keeps full Czech.
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const L = {
  cs: {
    title: 'Kreativni vouchery - vzor zadosti (pracovni podklad)',
    intro:
      'Tento vzor odpovida strukture oficialni zadosti o dotaci z vyzev Kreativni vouchery (Ministerstvo kultury CR / Narodni plan obnovy). Vyplnte jej a preneste udaje do oficialniho formulare sveho regionalniho partnera nebo portalu DPMK. Nejde o oficialni formular.',
    s1: '1. IDENTIFIKACE ZADATELE',
    f1: [
      'Obchodni nazev / jmeno a prijmeni (OSVC):',
      'ICo:',
      'DIC (pokud jste platce DPH):',
      'Sidlo / misto podnikani:',
      'Kraj realizace projektu:',
      'Pravni forma (OSVC / s.r.o.):',
      'Velikost podniku (mikro / maly / stredni):',
      'Zahajeni podnikatelske cinnosti (datum):',
      'Statutarni zastupce:',
      'E-mail:',
      'Telefon:',
      'Bankovni spojeni pro vyplatu dotace:',
    ],
    s2: '2. POPIS PROJEKTU',
    s2items: [
      'Nazev projektu:',
      'Popis projektu (co vznikne, proc je reseni kreativni, jaky ma prinos pro podnikani):',
      'Cile projektu a meritelne vystupy:',
      'Harmonogram (zacatek a konec realizace):',
      'Jmeno a role kreativniho dodavatele:',
    ],
    s3: '3. ROZPOCET PROJEKTU',
    s3rows: [
      ['Celkovy rozpocet (bez DPH u platcu)', '________________ Kc'],
      ['Pozadovana dotace (max. 85 %, nejvyse 150 000 Kc)', '________________ Kc'],
      ['Vlastni spoluucast zadatele (min. 15 %)', '________________ Kc'],
    ],
    s3note:
      'Pozor: projekt musite nejprve cely predfinancovat z vlastnich prostredku. Dotace je vyplacena zpetne po schvaleni zaverecne zpravy.',
    s4: '4. PROHLASENI ZADATELE',
    s4items: [
      'Podnikam nejmene 3 mesice pred podanim zadosti.',
      'Nemam nedoplatky vuci statu (dane, socialni a zdravotni pojisteni) a nejsem v insolvenci.',
      'Za posledni 3 roky jsem necerpal/a statni podporu rezimu de minimis presahujici 300 000 EUR.',
      'Uvedene udaje jsou pravdive a jsem si vedom/a dusledku nepravdivych udaju.',
    ],
    s5: '5. POVINNE PRILOHY A DALSÍ KROKY'.replace('Í', 'I'),
    s5items: [
      'Vypis z obchodniho nebo zivnostenskeho rejstriku',
      'Potvrzeni o bezdluznosti (financni urad, CSSZ, zdravotni pojistovna)',
      'Cenova nabidka kreativniho dodavatele',
      'Prohlaseni de minimis s vypoctem podpory za posledni 3 roky',
    ],
    s6: '6. JAK A KAM ZADOST PODAT',
    s6items: [
      '1. Zaregistrujte se u sveho regionalniho partnera (napr. JIC, ICUK, SIC - viz mapa hubu na fastmedia.pro/grant-hubs).',
      '2. Zadost podavejte elektricky pres portal DPMK (dpmk.cz) nebo dle pokynu regionalniho partnera, s overenou identitou (Bank iD / datova schranka).',
      '3. Kontrolujte si terminy aktualni vyzvy - kazde kolo ma vlastni podminky, cile a rozpoctova pravidla.',
      '4. Pred podanim si vzdy prectete aktualni zneni vyzvy na mk.gov.cz.',
    ],
    footer: 'FastMedia.Pro - navod, nikoli oficialni formular. Poskytovatelem dotace je Ministerstvo kultury CR.',
  },
  en: {
    title: 'Creative Vouchers - application template (working draft)',
    intro:
      'This template mirrors the structure of the official Creative Vouchers grant application (Ministry of Culture of the Czech Republic / National Recovery Plan). Complete it and transfer the details into the official form of your regional partner or the DPMK portal. This is not the official form.',
    s1: '1. APPLICANT IDENTIFICATION',
    f1: [
      'Business name / full name (sole trader):',
      'ICo (Business ID):',
      'DIC (VAT ID, if VAT-registered):',
      'Registered address:',
      'Region of project delivery:',
      'Legal form (OSVC / s.r.o.):',
      'Company size (micro / small / medium):',
      'Business activity started (date):',
      'Statutory representative:',
      'E-mail:',
      'Phone:',
      'Bank account for the grant payout:',
    ],
    s2: '2. PROJECT DESCRIPTION',
    s2items: [
      'Project title:',
      'Project description (what will be created, why the solution is creative, business benefit):',
      'Project goals and measurable outputs:',
      'Timeline (start and end dates):',
      'Creative supplier name and role:',
    ],
    s3: '3. PROJECT BUDGET',
    s3rows: [
      ['Total budget (excl. VAT for VAT payers)', '________________ CZK'],
      ['Requested grant (max. 85%, capped at 150,000 CZK)', '________________ CZK'],
      ['Applicant co-financing (min. 15%)', '________________ CZK'],
    ],
    s3note:
      'Note: you must pre-finance the entire project from your own funds. The grant is reimbursed after the final report is approved.',
    s4: '4. APPLICANT DECLARATIONS',
    s4items: [
      'I have been in business for at least 3 months before applying.',
      'I have no outstanding debts to the state (tax, social and health insurance) and no insolvency proceedings.',
      'Over the past 3 years I have not received de minimis state aid exceeding EUR 300,000.',
      'The information provided is true and I am aware of the consequences of false statements.',
    ],
    s5: '5. REQUIRED ATTACHMENTS',
    s5items: [
      'Extract from the Commercial or Trade Register',
      'Certificates of no outstanding debt (tax office, CSSZ, health insurer)',
      'Priced proposal from the creative supplier',
      'De minimis declaration with a 3-year aid calculation',
    ],
    s6: '6. HOW AND WHERE TO APPLY',
    s6items: [
      '1. Register with your regional partner (e.g. JIC, ICUK, SIC - see the hub map at fastmedia.pro/grant-hubs).',
      '2. Submit the application electronically via the DPMK portal (dpmk.cz) or as instructed by your regional partner, with verified identity (Bank iD / data box).',
      '3. Check the deadlines of the current call - each round has its own conditions, goals and budget rules.',
      '4. Always read the current call text at mk.gov.cz before applying.',
    ],
    footer: 'FastMedia.Pro - guidance only, not an official form. The grant provider is the Ministry of Culture of the Czech Republic.',
  },
} as const;

const drawFieldLine = (doc: jsPDF, label: string, y: number, margin: number, width: number, lines = 1) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(strip(label), margin, y);
  y += 5;
  doc.setDrawColor(180);
  doc.setLineWidth(0.6);
  for (let i = 0; i < lines; i++) {
    doc.line(margin, y + 4 * i, margin + width, y + 4 * i);
  }
  return y + 4 * lines + 6;
};

export const downloadGrantTemplatePdf = (lang: Lang) => {
  const t = L[lang];
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const width = pageW - margin * 2;
  let y = margin;

  const ensure = (need: number) => {
    if (y > pageH - margin - need) {
      doc.addPage();
      y = margin;
    }
  };

  // Header band
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 78, 'F');
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(strip(t.title), margin, 40);
  doc.setTextColor(0);
  y = 100;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  for (const line of doc.splitTextToSize(strip(t.intro), width)) {
    doc.text(line, margin, y);
    y += 13;
  }
  y += 12;

  const section = (title: string) => {
    ensure(30);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin - 6, y - 12, width + 12, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(strip(title), margin, y + 2);
    y += 24;
  };

  section(t.s1);
  for (const f of t.f1) {
    ensure(26);
    y = drawFieldLine(doc, f, y, margin, width);
  }

  section(t.s2);
  for (const f of t.s2items) {
    ensure(40);
    y = drawFieldLine(doc, f, y, margin, width, 2);
  }

  section(t.s3);
  doc.setFontSize(9.5);
  for (const [label, value] of t.s3rows) {
    ensure(20);
    doc.setFont('helvetica', 'normal');
    doc.text(strip(label), margin, y);
    doc.setFont('courier', 'normal');
    doc.text(value, margin + width, y, { align: 'right' });
    y += 18;
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  for (const line of doc.splitTextToSize(strip(t.s3note), width)) {
    ensure(14);
    doc.text(line, margin, y);
    y += 11;
  }
  y += 8;

  section(t.s4);
  for (const item of t.s4items) {
    ensure(18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.rect(margin, y - 7, 9, 9);
    for (const [i, line] of doc.splitTextToSize(strip(item), width - 20).entries()) {
      doc.text(line, margin + 16, y + i * 11);
    }
    y += Math.max(1, doc.splitTextToSize(strip(item), width - 20).length) * 11 + 6;
  }

  section(t.s5);
  for (const item of t.s5items) {
    ensure(16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`-  ${strip(item)}`, margin, y);
    y += 14;
  }
  y += 6;

  section(t.s6);
  for (const item of t.s6items) {
    ensure(26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    for (const line of doc.splitTextToSize(strip(item), width)) {
      doc.text(line, margin, y);
      y += 12;
    }
    y += 4;
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140);
    doc.text(strip(t.footer), pageW / 2, pageH - 24, { align: 'center' });
    doc.setTextColor(0);
  }

  doc.save(lang === 'cs' ? 'kreativni-vouchery-vzor-zadosti.pdf' : 'creative-vouchers-application-template.pdf');
};
