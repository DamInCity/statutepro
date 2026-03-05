import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import PricingContent from '@/components/marketing/PricingContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Practice Management Software Pricing | Plans from $49/user/month',
  description:
    'Transparent pricing for StatutePro legal practice management software. Plans for solo, small, and mid-size law firms. 14-day free trial, no credit card required.',
  path: '/pricing',
  keywords: pageKeywordMap.pricing,
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ])}
      />
      <JsonLd
        data={faqSchema([
          {
            question: 'Is there a free trial?',
            answer: 'Yes. Every plan includes a 14-day free trial with full access to all features in that tier. No credit card required.',
          },
          {
            question: 'Does StatutePro support trust accounting workflows?',
            answer: 'Yes. Trust accounting controls and IOLTA-compliant reporting are available on Professional and Enterprise plans.',
          },
          {
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'You can change plans at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle.',
          },
          {
            question: 'Do you help with data migration from other platforms?',
            answer: 'Yes. Professional and Enterprise plans include assisted data migration from platforms like Clio, PracticePanther, MyCase, and others.',
          },
        ])}
      />
      <PricingContent />
    </>
  );
}
