import type { Metadata } from 'next';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import JsonLd from '@/components/seo/JsonLd';
import LandingPageContent from '@/components/LandingPageContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema, organizationSchema, softwareApplicationSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Practice Management Software for Modern Law Firms',
  description:
    'Run matters, billing, trust accounting, client portal, and analytics in one AI-powered legal practice management platform.',
  path: '/',
  keywords: pageKeywordMap.home,
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
        ])}
      />
      <MarketingHeader />
      <LandingPageContent />
      <MarketingFooter />
    </>
  );
}
