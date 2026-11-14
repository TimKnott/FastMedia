/**
 * Zelený Kůň homepage Product JSON-LD.
 * Source: current published homepage and src/components/site.tsx
 * This module intentionally omits stock availability, ratings, reviews,
 * medical benefits and delivery promises not guaranteed for every order.
 *
 * Integration: add this Product to the existing homepage LocalBusiness
 * JSON-LD script as an array, preserving the WebPage script. This avoids
 * SSR head-script deduplication of separately emitted JSON-LD entries.
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
      eligibleQuantity: { "@type": "QuantitativeValue", minValue: 8, unitCode: "KGM" },
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
