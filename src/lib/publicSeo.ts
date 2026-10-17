import { type PublicLanguage, translatedPaths } from './publicLanguage';

export interface PublicPageSeo { title: string; description: string; content: string[] }
export const publicSeo: Record<string, Record<PublicLanguage, PublicPageSeo>> = {
  '/offer': {
    cs: { title: 'Web pro řemeslníky od 6 900 Kč | FastMedia.Pro', description: 'Jednostránkový web za 6 900 Kč včetně prvního roku hostingu a .cz domény, nebo 990 Kč měsíčně bez platby předem. Přehledné podmínky.', content: ['Jednostránkový web stojí 6 900 Kč jednorázově. Hosting a .cz doména jsou první rok v ceně, poté 2 490 Kč ročně.', 'Druhá možnost je 990 Kč měsíčně bez vstupní platby, s počáteční dobou 12 měsíců. Větší projekty z kalkulačky začínají od 18 900 Kč a nevztahuje se na ně 30denní garance malých balíčků.'] },
    en: { title: 'Websites for trades from 6,900 Kč | FastMedia.Pro', description: 'A one-page website for 6,900 Kč including first-year hosting and .cz domain, or 990 Kč monthly with nothing upfront. Clear renewal terms.', content: ['A one-page website costs 6,900 Kč once. Hosting and a .cz domain are included in the first year; renewal is 2,490 Kč annually.', 'Alternatively, pay 990 Kč monthly with no upfront payment and a 12-month initial term. Larger calculator projects start from 18,900 Kč and are excluded from the small-package 30-day guarantee.'] },
    de: { title: 'Webdesign für Handwerksbetriebe ab 6.900 Kč | FastMedia.Pro', description: 'Eine einseitige Website für 6.900 Kč mit Hosting und .cz-Domain im ersten Jahr oder 990 Kč monatlich ohne Anzahlung. Transparente Folgekosten.', content: ['Eine einseitige Website kostet 6.900 Kč einmalig. Hosting und .cz-Domain sind im ersten Jahr enthalten, danach 2.490 Kč jährlich.', 'Alternativ bezahlen Sie 990 Kč monatlich ohne Anzahlung bei 12 Monaten Mindestlaufzeit. Größere Projekte aus dem Kalkulator beginnen bei 18.900 Kč und sind von der 30-Tage-Garantie für kleine Pakete ausgeschlossen.'] },
  },
  '/contact': {
    cs: { title: 'Kontaktujte FastMedia.Pro — webové stránky na míru', description: 'Kontaktujte nás kvůli novému webu, redesignu nebo podpoře. Odpovíme do jednoho pracovního dne.', content: ['Napište nám o svém podnikání, požadavcích a termínu. Kontakt: support@fastmedia.pro nebo +420 797 864 432.', 'Sídlíme v České republice a projekty dodáváme na dálku. Podrobnosti o cenách najdete v nabídce; větší projekty můžete naplánovat v kalkulačce.'] },
    en: { title: 'Contact FastMedia.Pro — Talk to Our Web Team', description: 'Ask about a new website, redesign or ongoing support. We reply within one working day.', content: ['Tell us about your business, requirements and timeline. Contact support@fastmedia.pro or +420 797 864 432.', 'We are based in the Czech Republic and deliver projects remotely. See the offer for prices or plan a larger website in the calculator.'] },
    de: { title: 'Kontakt zu FastMedia.Pro – Webdesign für Ihr Unternehmen', description: 'Fragen Sie nach einer neuen Website, einem Relaunch oder Betreuung. Wir antworten innerhalb eines Arbeitstages.', content: ['Beschreiben Sie Ihr Unternehmen, Ihre Wünsche und Ihren Zeitrahmen. Kontakt: support@fastmedia.pro oder +420 797 864 432.', 'Wir sitzen in Tschechien und betreuen Projekte aus der Ferne. Die Angebotsseite erklärt die Preise; für größere Websites steht der Kalkulator bereit.'] },
  },
};

export function translatedPageSeo(path: string, language: PublicLanguage): PublicPageSeo | undefined {
  return translatedPaths.some(p => p === path) ? publicSeo[path]?.[language] : undefined;
}