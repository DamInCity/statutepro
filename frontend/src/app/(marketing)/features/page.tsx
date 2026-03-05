import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import FeaturesContent from '@/components/marketing/FeaturesContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Practice Management Software Features | Case, Billing, Trust & Portal',
  description:
    'Explore StatutePro\'s complete legal software features: case management, time tracking, billing, trust accounting, client portal, document automation, analytics, and AI-powered workflows.',
  path: '/features',
  keywords: pageKeywordMap.features,
});

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
        ])}
      />
      <FeaturesContent />
    </>
  );
}
