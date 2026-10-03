import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculatorFeatures, BASE_WEBSITE_PRICE, BASE_HOSTING_PRICE, LABOR_RATE, type CalculatorFeature } from '@/data/calculatorFeatures';

export interface CalculatorPackage { slug: string; name: string; module_ids: string[]; sort_order: number }

/** Default starting bundles, used until packages are saved in the back office. */
export const DEFAULT_PACKAGES: CalculatorPackage[] = [
  { slug: 'starter', name: 'Starter', module_ids: ['contact-form'], sort_order: 1 },
  { slug: 'basic', name: 'Basic', module_ids: ['contact-form', 'seo-advanced', 'gallery'], sort_order: 2 },
  { slug: 'professional', name: 'Professional', module_ids: ['contact-form', 'booking-system', 'seo-advanced', 'gallery', 'reviews', 'analytics'], sort_order: 3 },
  { slug: 'enterprise', name: 'Enterprise', module_ids: ['contact-form', 'booking-system', 'seo-advanced', 'gallery', 'reviews', 'analytics', 'ecommerce', 'multi-language', 'blog'], sort_order: 4 },
];

type ModuleRow = {
  id: string; icon: string; name_en: string; name_cs: string; desc_en: string; desc_cs: string;
  one_time_price: number; monthly_price: number; labor_hours: number; category: string;
  allow_multiple: boolean; active: boolean; sort_order: number;
};

export const rowToFeature = (r: ModuleRow): CalculatorFeature => ({
  id: r.id, icon: r.icon, nameEn: r.name_en, nameCs: r.name_cs || r.name_en, nameDe: r.name_en,
  descEn: r.desc_en, descCs: r.desc_cs || r.desc_en, descDe: r.desc_en,
  oneTimePrice: r.one_time_price, monthlyPrice: r.monthly_price, laborHours: Number(r.labor_hours),
  category: r.category as CalculatorFeature['category'], allowMultiple: r.allow_multiple,
});

export const featureToRow = (f: CalculatorFeature, i: number) => ({
  id: f.id, icon: f.icon, name_en: f.nameEn, name_cs: f.nameCs, desc_en: f.descEn, desc_cs: f.descCs,
  one_time_price: f.oneTimePrice, monthly_price: f.monthlyPrice, labor_hours: f.laborHours,
  category: f.category, allow_multiple: !!f.allowMultiple, active: true, sort_order: i,
});

/** Modules shown in the calculator: the back-office list, or the built-in list until it is filled. */
export function useCalculatorModules() {
  const q = useQuery({
    queryKey: ['calculator-modules'],
    queryFn: async () => {
      const [{ data: mods }, { data: pkgs }] = await Promise.all([
        supabase.from('calculator_modules').select('*').eq('active', true).order('sort_order'),
        supabase.from('calculator_packages').select('*').order('sort_order'),
      ]);
      return {
        modules: mods && mods.length ? (mods as ModuleRow[]).map(rowToFeature) : calculatorFeatures,
        packages: pkgs && pkgs.length ? (pkgs as CalculatorPackage[]) : DEFAULT_PACKAGES,
      };
    },
    staleTime: 60_000,
  });
  return { modules: q.data?.modules ?? calculatorFeatures, packages: q.data?.packages ?? DEFAULT_PACKAGES, isLoading: q.isLoading };
}

/** Package totals use the calculator's own formula, so a package and the calculator always agree. */
export function packagePrice(pkg: CalculatorPackage, modules: CalculatorFeature[]) {
  const picked = pkg.module_ids.map(id => modules.find(m => m.id === id)).filter(Boolean) as CalculatorFeature[];
  const oneTime = picked.reduce((s, m) => s + m.oneTimePrice + m.laborHours * LABOR_RATE, BASE_WEBSITE_PRICE);
  const monthly = picked.reduce((s, m) => s + m.monthlyPrice, BASE_HOSTING_PRICE);
  return { oneTime, monthly };
}
