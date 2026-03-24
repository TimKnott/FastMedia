import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BASE_URL = "https://fastmedia.pro";

    // Core structured data feed optimized for AI search crawlers
    const feed = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          name: "FastMedia.Pro",
          url: BASE_URL,
          description: "Professional conversion-optimized websites for tradespeople and service businesses. AI chatbot, online booking, lead collection. 37 industry templates, delivery within 10 days.",
          inLanguage: ["cs", "en", "de"],
          publisher: { "@id": `${BASE_URL}/#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: `${BASE_URL}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          "@id": `${BASE_URL}/#organization`,
          name: "FastMedia.Pro",
          url: BASE_URL,
          logo: `${BASE_URL}/favicon.jpeg`,
          description: "Czech Republic-based web development agency with native English speakers, serving clients worldwide. Specializing in conversion-optimized websites for tradespeople and service businesses.",
          address: {
            "@type": "PostalAddress",
            addressCountry: "CZ",
          },
          areaServed: { "@type": "GeoShape", name: "Worldwide" },
          knowsLanguage: ["cs", "en", "de"],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            availableLanguage: ["Czech", "English", "German"],
          },
        },
        {
          "@type": "ItemList",
          "@id": `${BASE_URL}/#services`,
          name: "Web Development Services",
          itemListElement: [
            { "@type": "ListItem", position: 1, item: { "@type": "Service", name: "Starter Website", description: "Single-page website for small businesses", offers: { "@type": "Offer", price: "15000", priceCurrency: "CZK" } } },
            { "@type": "ListItem", position: 2, item: { "@type": "Service", name: "Basic Website", description: "Multi-page website with lead generation", offers: { "@type": "Offer", price: "25000", priceCurrency: "CZK" } } },
            { "@type": "ListItem", position: 3, item: { "@type": "Service", name: "Professional Website", description: "Full-featured website with AI chatbot and booking", offers: { "@type": "Offer", price: "45000", priceCurrency: "CZK" } } },
            { "@type": "ListItem", position: 4, item: { "@type": "Service", name: "Enterprise Solution", description: "Custom enterprise web solution with e-shop", offers: { "@type": "Offer", price: "80000", priceCurrency: "CZK" } } },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": `${BASE_URL}/#faq`,
          mainEntity: [
            { "@type": "Question", name: "How long does it take to build a website?", acceptedAnswer: { "@type": "Answer", text: "We deliver most websites within 10 business days, depending on the package and complexity." } },
            { "@type": "Question", name: "Do you offer websites for specific trades?", acceptedAnswer: { "@type": "Answer", text: "Yes, we have 25 industry-specific templates for trades like plumbing, electrical, roofing, and more." } },
            { "@type": "Question", name: "Can I see a demo before ordering?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. We offer live demos for each trade at fastmedia.pro with interactive previews." } },
            { "@type": "Question", name: "What languages do you support?", acceptedAnswer: { "@type": "Answer", text: "Our platform supports Czech, English, and German with full localization." } },
          ],
        },
      ],
    };

    return new Response(JSON.stringify(feed, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/ld+json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("ai-feed error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
