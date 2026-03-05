import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import SecurityContent from '@/components/marketing/SecurityContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Software Security | Enterprise-Grade Data Protection for Law Firms',
  description:
    'StatutePro security: 256-bit encryption, SOC 2 Type II compliance, role-based access control, audit logging, and IOLTA trust accounting safeguards for law firm data protection.',
  path: '/security',
  keywords: pageKeywordMap.security,
});

export default function SecurityPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Security', path: '/security' },
        ])}
      />
      <JsonLd
        data={faqSchema([
          {
            question: 'Where is my data stored?',
            answer: 'StatutePro data is stored in SOC 2 Type II certified data centers with geographic redundancy in the United States.',
          },
          {
            question: 'Do you support single sign-on (SSO)?',
            answer: 'Yes. Enterprise plans include SAML 2.0 SSO integration with Okta, Azure AD, and Google Workspace. MFA is available on all plans.',
          },
          {
            question: 'How do you handle security incidents?',
            answer: 'We maintain a documented incident response plan with 24/7 monitoring. Affected customers are notified within 24 hours.',
          },
        ])}
      />
      <SecurityContent />
    </>
  );
}
