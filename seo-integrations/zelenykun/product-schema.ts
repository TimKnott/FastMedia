/**
 * Zelený Kůň homepage Product JSON-LD.
 * Source: current published homepage and src/components/site.tsx
 * This module intentionally omits stock availability, ratings, reviews,
 * medical benefits and delivery promises not guaranteed for every order.
 *
 * Integration: in the existing Zelený Kůň homepage route, append a
 * { type: "application/ld+json", children: JSON.stringify(fodderProductSchema(lang)) }
 * entry to the scripts returned by head(), preserving the existing
 * WebPage and LocalBusiness scripts.
 */
export function fodderProductSchema(lang: "cs" | "en" = "cs") {
  const english = lang === "en";
  const url = "https://zelenykun.com/" + (english ? "?lang=en" : "");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://zelenykun.com/#fresh-barley-fodder",
    name: english ? "Fresh hydroponic barley fodder" : "Čerstvé hydroponické ječné krmivo",
    description: english
      ? "Fresh barley shoots and roots grown as a moisture-rich fodder mat for animals. Available for local orders around Louny."
      : "Čerstvé ječné výhonky s kořínky pěstované jako vlhké zelené krmivo pro zvířata. Místní objednávky v okolí Loun.",
    url,
    inLanguage: lang,
    category: english ? "Animal feed" : "Krmivo pro zvířata",
    brand: { "@type": "Brand", name: "Zelený Kůň" },
    offers: {
      "@type": "Offer",
      url,
      price: "25.00",
      priceCurrency: "CZK",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "25.00",
        priceCurrency: "CZK",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "KGM" },
      },
      seller: {
        "@type": "Organization",
        name: "Zelený Kůň",
        url: "https://zelenykun.com/",
      },
    },
  };
}
