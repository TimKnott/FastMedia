// Remote target markets (no physical offices outside Louny, CZ).
export const ORG_AREA_SERVED = [
  { '@type': 'Country', name: 'Czech Republic' },
  { '@type': 'Country', name: 'United Kingdom' },
  { '@type': 'Country', name: 'United States' },
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'Australia' },
];

// Portfolio site showing FastMedia work: a creative work about the business, not a separate identity profile.
export const ORG_PORTFOLIO = { '@type': 'WebSite', name: 'FastMedia.Pro portfolio', url: 'https://myname.co.uk/' };

export const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": "https://www.fastmedia.pro/#organization",
  name: "FastMedia.Pro",
  url: "https://www.fastmedia.pro/",
  logo: "https://www.fastmedia.pro/favicon.jpeg",
  image: "https://www.fastmedia.pro/pwa-512x512.png",
  email: "support@fastmedia.pro",
  telephone: "+420797864432",
  founder: { "@type": "Person", name: "Timothy Knott" },
  taxID: "17308551",
  identifier: { "@type": "PropertyValue", propertyID: "IČO", value: "17308551" },
  address: { "@type": "PostalAddress", addressLocality: "Louny", postalCode: "440 01", addressRegion: "Ústecký kraj", addressCountry: "CZ" },
  areaServed: ORG_AREA_SERVED,
  subjectOf: ORG_PORTFOLIO,
  knowsLanguage: ["bg","hr","cs","da","nl","en","et","fi","fr","de","el","hu","ga","it","lv","lt","mt","pl","pt","ro","sk","sl","es","sv"],
  contactPoint: { "@type": "ContactPoint", telephone: "+420797864432", email: "support@fastmedia.pro", contactType: "sales", availableLanguage: ["cs", "en"] },
};
