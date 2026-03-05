import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import TrustCenterContent from '@/components/marketing/TrustCenterContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Trust Center | IOLTA Compliance, Data Governance & Legal Operations Security',
  description:
    'StatutePro Trust Center: IOLTA trust accounting compliance, ABA Model Rules alignment, SOC 2 certification, data governance, and access controls for law firms.',
  path: '/trust-center',
  keywords: pageKeywordMap.trustCenter,
});

export default function TrustCenterPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Trust Center', path: '/trust-center' },
        ])}
      />
      <JsonLd
        data={faqSchema([
          {
            question: 'Does StatutePro support IOLTA trust accounting compliance?',
            answer: 'Yes. StatutePro includes three-way reconciliation, matter-level trust ledgers, and audit-ready reporting for state bar IOLTA compliance.',
          },
          {
            question: 'Can we evaluate your security controls before onboarding?',
            answer: 'Yes. We provide SOC 2 reports, data processing agreements, security whitepapers, and vendor assessment questionnaires upon request.',
          },
          {
            question: 'How does StatutePro help with ABA Model Rules compliance?',
            answer: 'Our platform supports compliance with key ABA rules including Rule 1.6, Rule 1.15, and Rules 5.1/5.3 through technical controls.',
          },
        ])}
      />
      <TrustCenterContent />
    </>
  );
}
