import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import SolutionsContent from '@/components/marketing/SolutionsContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Practice Management Solutions for Solo, Small & Mid-Size Law Firms',
  description:
    'Find the right legal practice management solution for your firm size. StatutePro adapts to solo practitioners, small firms, and mid-size law firms with tailored workflows and analytics.',
  path: '/solutions',
  keywords: pageKeywordMap.solutionsHub,
});

export default function SolutionsHubPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
        ])}
      />
      <SolutionsContent />
    </>
  );
}
