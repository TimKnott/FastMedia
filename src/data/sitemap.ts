// Sitemap configuration for FastMedia.Pro
// Used by the sitemap edge function and admin UI

export interface SitemapEntry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  label: string;
  indexable: boolean;
}

export const sitemapEntries: SitemapEntry[] = [
  // Main pages
  { path: '/', changefreq: 'weekly', priority: 1.0, label: 'Homepage', indexable: true },
  { path: '/blog', changefreq: 'daily', priority: 0.8, label: 'Blog', indexable: true },
  { path: '/calculator', changefreq: 'monthly', priority: 0.7, label: 'Calculator', indexable: true },
  { path: '/consultant/tereza', changefreq: 'monthly', priority: 0.6, label: 'Consultant — Tereza', indexable: true },
  { path: '/inquiry', changefreq: 'weekly', priority: 0.8, label: 'Project Inquiry', indexable: true },
  { path: '/contact', changefreq: 'monthly', priority: 0.8, label: 'Contact', indexable: true },
  { path: '/quote-request', changefreq: 'monthly', priority: 0.8, label: 'Request a quote', indexable: true },

  // Demo pages
  { path: '/demo/plumbing', changefreq: 'monthly', priority: 0.6, label: 'Demo: Plumbing', indexable: true },
  { path: '/demo/electrical', changefreq: 'monthly', priority: 0.6, label: 'Demo: Electrical', indexable: true },
  { path: '/demo/building', changefreq: 'monthly', priority: 0.6, label: 'Demo: Building', indexable: true },
  { path: '/demo/roofing', changefreq: 'monthly', priority: 0.6, label: 'Demo: Roofing', indexable: true },
  { path: '/demo/drywall', changefreq: 'monthly', priority: 0.6, label: 'Demo: Drywall', indexable: true },
  { path: '/demo/wells', changefreq: 'monthly', priority: 0.6, label: 'Demo: Wells', indexable: true },
  { path: '/demo/heating', changefreq: 'monthly', priority: 0.6, label: 'Demo: Heating', indexable: true },
  { path: '/demo/solar', changefreq: 'monthly', priority: 0.6, label: 'Demo: Solar', indexable: true },
  { path: '/demo/heatpumps', changefreq: 'monthly', priority: 0.6, label: 'Demo: Heat Pumps', indexable: true },
  { path: '/demo/painting', changefreq: 'monthly', priority: 0.6, label: 'Demo: Painting', indexable: true },
  { path: '/demo/interior', changefreq: 'monthly', priority: 0.6, label: 'Demo: Interior', indexable: true },
  { path: '/demo/exterior', changefreq: 'monthly', priority: 0.6, label: 'Demo: Exterior', indexable: true },
  { path: '/demo/gardening', changefreq: 'monthly', priority: 0.6, label: 'Demo: Gardening', indexable: true },
  { path: '/demo/cleaning', changefreq: 'monthly', priority: 0.6, label: 'Demo: Cleaning', indexable: true },
  { path: '/demo/locksmith', changefreq: 'monthly', priority: 0.6, label: 'Demo: Locksmith', indexable: true },
  { path: '/demo/carpentry', changefreq: 'monthly', priority: 0.6, label: 'Demo: Carpentry', indexable: true },
  { path: '/demo/autorepair', changefreq: 'monthly', priority: 0.6, label: 'Demo: Auto Repair', indexable: true },
  { path: '/demo/pestcontrol', changefreq: 'monthly', priority: 0.6, label: 'Demo: Pest Control', indexable: true },
  { path: '/demo/photography', changefreq: 'monthly', priority: 0.6, label: 'Demo: Photography', indexable: true },
  { path: '/demo/catering', changefreq: 'monthly', priority: 0.6, label: 'Demo: Catering', indexable: true },
  { path: '/demo/fitness', changefreq: 'monthly', priority: 0.6, label: 'Demo: Fitness', indexable: true },
  { path: '/demo/beautysalon', changefreq: 'monthly', priority: 0.6, label: 'Demo: Beauty Salon', indexable: true },
  { path: '/demo/moving', changefreq: 'monthly', priority: 0.6, label: 'Demo: Moving', indexable: true },
  { path: '/demo/itservices', changefreq: 'monthly', priority: 0.6, label: 'Demo: IT Services', indexable: true },

  // Excluded (noindex)
  { path: '/admin', changefreq: 'monthly', priority: 0.0, label: 'Admin Panel', indexable: false },
  { path: '/admin/login', changefreq: 'monthly', priority: 0.0, label: 'Admin Login', indexable: false },
  { path: '/reset-password', changefreq: 'monthly', priority: 0.0, label: 'Reset Password', indexable: false },
];

export const generateSitemapXml = (): string => {
  const BASE_URL = 'https://www.fastmedia.pro';
  const today = new Date().toISOString().split('T')[0];

  const urls = sitemapEntries
    .filter((e) => e.indexable)
    .map(
      (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};
