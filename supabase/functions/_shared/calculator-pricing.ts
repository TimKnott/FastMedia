// Server-side canonical calculator prices (CZK). Shared so lead scoring and
// checkout never trust prices or totals supplied by the browser.
export type CalculatorFeatureDef = { name: string; oneTimePrice: number; monthlyPrice: number; laborHours: number; allowMultiple?: boolean };

export const BASE_WEBSITE_PRICE = 4990;
export const BASE_HOSTING_PRICE = 1500;
export const LABOR_RATE = 800;

const calculatorFeatureMap: Record<string, CalculatorFeatureDef> = {
  "contact-form": { name: "Contact Form", oneTimePrice: 1500, monthlyPrice: 0, laborHours: 2 },
  "booking-system": { name: "Booking System", oneTimePrice: 4500, monthlyPrice: 300, laborHours: 6, allowMultiple: true },
  gallery: { name: "Project Gallery", oneTimePrice: 2500, monthlyPrice: 100, laborHours: 3 },
  reviews: { name: "Reviews System", oneTimePrice: 2000, monthlyPrice: 100, laborHours: 3 },
  "google-maps": { name: "Google Maps", oneTimePrice: 1000, monthlyPrice: 0, laborHours: 1 },
  "social-media": { name: "Social Media Integration", oneTimePrice: 1500, monthlyPrice: 0, laborHours: 2 },
  blog: { name: "Blog / News", oneTimePrice: 3500, monthlyPrice: 200, laborHours: 5 },
  newsletter: { name: "Newsletter", oneTimePrice: 2500, monthlyPrice: 200, laborHours: 3 },
  analytics: { name: "Google Analytics", oneTimePrice: 1500, monthlyPrice: 0, laborHours: 2 },
  "seo-advanced": { name: "Advanced SEO", oneTimePrice: 3000, monthlyPrice: 0, laborHours: 4 },
  "live-chat": { name: "Live Chat", oneTimePrice: 3000, monthlyPrice: 300, laborHours: 4 },
  "multi-language": { name: "Multi-language", oneTimePrice: 5000, monthlyPrice: 200, laborHours: 8, allowMultiple: true },
  video: { name: "Video Section", oneTimePrice: 2500, monthlyPrice: 150, laborHours: 3 },
  ecommerce: { name: "E-commerce", oneTimePrice: 15000, monthlyPrice: 500, laborHours: 20 },
  crm: { name: "CRM System", oneTimePrice: 8000, monthlyPrice: 400, laborHours: 12 },
  "virtual-tour": { name: "Virtual Tour", oneTimePrice: 6000, monthlyPrice: 200, laborHours: 8 },
  "ai-chatbot": { name: "AI Chatbot", oneTimePrice: 8000, monthlyPrice: 500, laborHours: 10 },
  "unified-inbox": { name: "Unified Inbox", oneTimePrice: 6000, monthlyPrice: 400, laborHours: 8 },
  "auto-invoicing": { name: "Auto Invoicing & Accounting", oneTimePrice: 8000, monthlyPrice: 500, laborHours: 10 },
  "customer-portal": { name: "Customer Portal", oneTimePrice: 10000, monthlyPrice: 500, laborHours: 15 },
  "whatsapp-button": { name: "WhatsApp Button", oneTimePrice: 500, monthlyPrice: 0, laborHours: 1 },
  "testimonial-video": { name: "Video Testimonials", oneTimePrice: 3000, monthlyPrice: 150, laborHours: 4 },
  "price-calculator": { name: "Price Calculator", oneTimePrice: 5000, monthlyPrice: 200, laborHours: 6 },
  "before-after": { name: "Before & After Gallery", oneTimePrice: 2000, monthlyPrice: 100, laborHours: 3 },
  "lead-scoring": { name: "Lead Scoring", oneTimePrice: 4000, monthlyPrice: 300, laborHours: 5 },
  "sms-notifications": { name: "SMS Notifications", oneTimePrice: 2000, monthlyPrice: 200, laborHours: 3 },
  "payment-gateway": { name: "Payment Gateway", oneTimePrice: 5000, monthlyPrice: 300, laborHours: 6 },
  heatmaps: { name: "Heatmaps & Behavior Analysis", oneTimePrice: 2000, monthlyPrice: 150, laborHours: 2 },
  "ab-testing": { name: "A/B Testing", oneTimePrice: 3000, monthlyPrice: 200, laborHours: 4 },
  "error-monitoring": { name: "Error Monitoring", oneTimePrice: 1500, monthlyPrice: 100, laborHours: 2 },
};


/** Recompute the quote from feature ids only; unknown ids are dropped. */
export function computeCalculatorQuote(selected: { id: unknown; quantity: unknown }[]) {
  const seen = new Set<string>();
  const items: { id: string; quantity: number }[] = [];
  let oneTime = BASE_WEBSITE_PRICE;
  let monthly = BASE_HOSTING_PRICE;
  let laborHours = 0;
  for (const s of selected) {
    const id = typeof s?.id === 'string' ? s.id : '';
    const def = calculatorFeatureMap[id];
    if (!def || seen.has(id)) continue;
    seen.add(id);
    const q = def.allowMultiple ? Math.max(1, Math.min(20, Math.floor(Number(s.quantity) || 1))) : 1;
    items.push({ id, quantity: q });
    oneTime += def.oneTimePrice * q;
    monthly += def.monthlyPrice * q;
    laborHours += def.laborHours * q;
  }
  return { items, quoteOneTime: oneTime + laborHours * LABOR_RATE, quoteMonthly: monthly, laborHours };
}
