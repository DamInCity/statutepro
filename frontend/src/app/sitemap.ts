import type { MetadataRoute } from 'next';

const marketingRoutes = [
  '/',
  '/about',
  '/contact',
  '/careers',
  '/features',
  '/features/case-management',
  '/features/document-automation',
  '/features/billing-time-tracking',
  '/features/trust-accounting',
  '/features/client-portal',
  '/features/analytics-reporting',
  '/features/legal-ai',
  '/solutions',
  '/solutions/solo-law-firms',
  '/solutions/small-law-firms',
  '/solutions/mid-size-law-firms',
  '/integrations',
  '/resources',
  '/blog',
  '/pricing',
  '/demo',
  '/security',
  '/trust-center',
  '/privacy',
  '/tools',
  '/tools/image-to-pdf',
  '/tools/word-to-pdf',
  '/tools/pdf-to-word',
  '/tools/pdf-merger',
  '/tools/pdf-compressor',
  '/tools/word-count',
  '/tools/court-date-calculator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return marketingRoutes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.75,
  }));
}
