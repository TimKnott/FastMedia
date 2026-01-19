export interface Review {
  id: number;
  name: string;
  trade: string;
  rating: number;
  text: {
    cs: string;
    en: string;
    de: string;
  };
  avatar: string;
}

export const reviews: Review[] = [
  {
    id: 1,
    name: 'Jan Novák',
    trade: 'Instalatér',
    rating: 5,
    text: {
      cs: 'Díky FastMedia.Pro mám konečně profesionální web. Zákazníci mě nyní snadno najdou online a zakázky se zdvojnásobily!',
      en: 'Thanks to FastMedia.Pro I finally have a professional website. Customers can now find me easily online and my orders have doubled!',
      de: 'Dank FastMedia.Pro habe ich endlich eine professionelle Website. Kunden finden mich jetzt leicht online und meine Aufträge haben sich verdoppelt!'
    },
    avatar: 'JN'
  },
  {
    id: 2,
    name: 'Petra Svobodová',
    trade: 'Malířka',
    rating: 5,
    text: {
      cs: 'Perfektní spolupráce! Web byl hotový za týden a vypadá naprosto skvěle. Doporučuji všem řemeslníkům.',
      en: 'Perfect collaboration! The website was ready in a week and looks absolutely amazing. I recommend it to all tradespeople.',
      de: 'Perfekte Zusammenarbeit! Die Website war in einer Woche fertig und sieht absolut fantastisch aus. Empfehle ich allen Handwerkern.'
    },
    avatar: 'PS'
  },
  {
    id: 3,
    name: 'Martin Dvořák',
    trade: 'Elektrikář',
    rating: 5,
    text: {
      cs: 'Investice, která se vyplatila. Nový web mi přinesl spoustu nových zákazníků. Jsem nadšený!',
      en: 'An investment that paid off. The new website brought me many new customers. I am thrilled!',
      de: 'Eine Investition, die sich gelohnt hat. Die neue Website brachte mir viele neue Kunden. Ich bin begeistert!'
    },
    avatar: 'MD'
  },
  {
    id: 4,
    name: 'Eva Černá',
    trade: 'Úklidová firma',
    rating: 5,
    text: {
      cs: 'Naše firma potřebovala moderní prezentaci. FastMedia.Pro nám ji dodali přesně podle našich představ.',
      en: 'Our company needed a modern presentation. FastMedia.Pro delivered exactly what we envisioned.',
      de: 'Unser Unternehmen brauchte eine moderne Präsentation. FastMedia.Pro lieferte genau das, was wir uns vorgestellt haben.'
    },
    avatar: 'EČ'
  },
  {
    id: 5,
    name: 'Tomáš Horák',
    trade: 'Pokrývač',
    rating: 4,
    text: {
      cs: 'Rychlá a profesionální práce. Web běží bez problémů a zákazníci ho chválí.',
      en: 'Fast and professional work. The website runs smoothly and customers praise it.',
      de: 'Schnelle und professionelle Arbeit. Die Website läuft reibungslos und Kunden loben sie.'
    },
    avatar: 'TH'
  },
  {
    id: 6,
    name: 'Lucie Marková',
    trade: 'Interiérový design',
    rating: 5,
    text: {
      cs: 'Krásný design, který perfektně reprezentuje mou práci. Portfolio na webu mi přineslo nové projekty.',
      en: 'Beautiful design that perfectly represents my work. The portfolio on the website brought me new projects.',
      de: 'Wunderschönes Design, das meine Arbeit perfekt repräsentiert. Das Portfolio auf der Website brachte mir neue Projekte.'
    },
    avatar: 'LM'
  },
  {
    id: 7,
    name: 'Pavel Kučera',
    trade: 'Stavební firma',
    rating: 5,
    text: {
      cs: 'Skvělá komunikace a výsledek předčil očekávání. Určitě doporučuji!',
      en: 'Great communication and the result exceeded expectations. Definitely recommended!',
      de: 'Tolle Kommunikation und das Ergebnis übertraf die Erwartungen. Auf jeden Fall empfehlenswert!'
    },
    avatar: 'PK'
  },
  {
    id: 8,
    name: 'Anna Veselá',
    trade: 'Zahradnictví',
    rating: 5,
    text: {
      cs: 'Díky novému webu se mi podařilo rozšířit podnikání i do dalších měst. Fantastická práce!',
      en: 'Thanks to the new website, I managed to expand my business to other cities. Fantastic work!',
      de: 'Dank der neuen Website konnte ich mein Geschäft auf andere Städte ausweiten. Fantastische Arbeit!'
    },
    avatar: 'AV'
  },
  {
    id: 9,
    name: 'Jiří Procházka',
    trade: 'Tepelná čerpadla',
    rating: 4,
    text: {
      cs: 'Profesionální přístup a moderní technologie. Web funguje rychle a vypadá skvěle.',
      en: 'Professional approach and modern technology. The website works fast and looks great.',
      de: 'Professioneller Ansatz und moderne Technologie. Die Website funktioniert schnell und sieht großartig aus.'
    },
    avatar: 'JP'
  },
  {
    id: 10,
    name: 'Kateřina Němcová',
    trade: 'Solární panely',
    rating: 5,
    text: {
      cs: 'Nejlepší investice do marketingu, kterou jsem kdy udělala. Vřele doporučuji!',
      en: 'The best marketing investment I have ever made. Highly recommended!',
      de: 'Die beste Marketing-Investition, die ich je getätigt habe. Sehr zu empfehlen!'
    },
    avatar: 'KN'
  },
  {
    id: 11,
    name: 'Václav Pokorný',
    trade: 'Truhlář',
    rating: 5,
    text: {
      cs: 'Galerie mých prací na webu přitahuje nové zákazníky každý den. Výborná práce!',
      en: 'The gallery of my work on the website attracts new customers every day. Excellent work!',
      de: 'Die Galerie meiner Arbeiten auf der Website zieht jeden Tag neue Kunden an. Ausgezeichnete Arbeit!'
    },
    avatar: 'VP'
  },
  {
    id: 12,
    name: 'Marie Králová',
    trade: 'Malířství',
    rating: 5,
    text: {
      cs: 'Skvělý tým, který rozumí potřebám malých podnikatelů. Děkuji za vše!',
      en: 'Great team that understands the needs of small business owners. Thank you for everything!',
      de: 'Tolles Team, das die Bedürfnisse kleiner Unternehmer versteht. Danke für alles!'
    },
    avatar: 'MK'
  },
  {
    id: 13,
    name: 'Radek Malý',
    trade: 'Zámečník',
    rating: 4,
    text: {
      cs: 'Konečně mám web, kterým se mohu pochlubit. Profesionální a moderní.',
      en: 'I finally have a website I can be proud of. Professional and modern.',
      de: 'Endlich habe ich eine Website, auf die ich stolz sein kann. Professionell und modern.'
    },
    avatar: 'RM'
  },
  {
    id: 14,
    name: 'Tereza Holubová',
    trade: 'Topenářství',
    rating: 5,
    text: {
      cs: 'Rychle, kvalitně a za rozumnou cenu. Co víc si přát?',
      en: 'Fast, quality work at a reasonable price. What more could you ask for?',
      de: 'Schnell, Qualitätsarbeit zu einem vernünftigen Preis. Was will man mehr?'
    },
    avatar: 'TH'
  },
  {
    id: 15,
    name: 'Ondřej Fiala',
    trade: 'Sádrokarton',
    rating: 5,
    text: {
      cs: 'Díky FastMedia.Pro jsem se dostal na první stránku vyhledávání. Úžasný výsledek!',
      en: 'Thanks to FastMedia.Pro, I got to the first page of search results. Amazing result!',
      de: 'Dank FastMedia.Pro bin ich auf die erste Seite der Suchergebnisse gekommen. Erstaunliches Ergebnis!'
    },
    avatar: 'OF'
  },
  {
    id: 16,
    name: 'Hana Benešová',
    trade: 'Fasády',
    rating: 5,
    text: {
      cs: 'Web je přehledný, rychlý a zákazníci ho milují. Absolutně spokojená!',
      en: 'The website is clear, fast, and customers love it. Absolutely satisfied!',
      de: 'Die Website ist übersichtlich, schnell und Kunden lieben sie. Absolut zufrieden!'
    },
    avatar: 'HB'
  },
  {
    id: 17,
    name: 'Stanislav Růžička',
    trade: 'Studnařství',
    rating: 4,
    text: {
      cs: 'Spolehlivý partner pro tvorbu webu. Komunikace byla bezproblémová.',
      en: 'Reliable partner for website creation. Communication was smooth.',
      de: 'Zuverlässiger Partner für die Website-Erstellung. Die Kommunikation war reibungslos.'
    },
    avatar: 'SR'
  },
  {
    id: 18,
    name: 'Ivana Urbanová',
    trade: 'Úklidové služby',
    rating: 5,
    text: {
      cs: 'Náš web je nyní naší nejlepší vizitkou. Děkujeme za skvělou práci!',
      en: 'Our website is now our best business card. Thank you for the great work!',
      de: 'Unsere Website ist jetzt unsere beste Visitenkarte. Danke für die tolle Arbeit!'
    },
    avatar: 'IU'
  },
  {
    id: 19,
    name: 'David Šimek',
    trade: 'Elektrikář',
    rating: 5,
    text: {
      cs: 'Profesionální web mi pomohl získat větší zakázky od firem. Investice se vrátila za měsíc!',
      en: 'A professional website helped me get bigger contracts from companies. The investment paid back in a month!',
      de: 'Eine professionelle Website half mir, größere Aufträge von Firmen zu bekommen. Die Investition hat sich in einem Monat ausgezahlt!'
    },
    avatar: 'DŠ'
  },
  {
    id: 20,
    name: 'Simona Krausová',
    trade: 'Interiéry',
    rating: 5,
    text: {
      cs: 'Kreativní tým, který skutečně naslouchá. Výsledek je naprosto dokonalý.',
      en: 'Creative team that truly listens. The result is absolutely perfect.',
      de: 'Kreatives Team, das wirklich zuhört. Das Ergebnis ist absolut perfekt.'
    },
    avatar: 'SK'
  },
  {
    id: 21,
    name: 'Miroslav Vlček',
    trade: 'Stavebnictví',
    rating: 5,
    text: {
      cs: 'Naše stavební firma potřebovala seriózní prezentaci. FastMedia.Pro to zvládli na jedničku!',
      en: 'Our construction company needed a serious presentation. FastMedia.Pro did it perfectly!',
      de: 'Unser Bauunternehmen brauchte eine seriöse Präsentation. FastMedia.Pro hat es perfekt gemacht!'
    },
    avatar: 'MV'
  },
  {
    id: 22,
    name: 'Barbora Tichá',
    trade: 'Malířství',
    rating: 4,
    text: {
      cs: 'Velmi spokojená s celým procesem. Web je krásný a funkční.',
      en: 'Very satisfied with the whole process. The website is beautiful and functional.',
      de: 'Sehr zufrieden mit dem gesamten Prozess. Die Website ist schön und funktional.'
    },
    avatar: 'BT'
  }
];
