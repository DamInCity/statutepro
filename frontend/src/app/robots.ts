import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
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
          '/docs',
        ],
        disallow: ['/admin', '/dashboard', '/login', '/register', '/forgot-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
