import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import IntegrationsContent from '@/components/marketing/IntegrationsContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Software Integrations | Microsoft 365, Google, QuickBooks & 5,000+ Apps',
  description:
    'Connect StatutePro with Microsoft Outlook, Google Workspace, QuickBooks, LawPay, SharePoint, Dropbox, Zapier, and 5,000+ apps for seamless legal workflows.',
  path: '/integrations',
  keywords: pageKeywordMap.integrations,
});

export default function IntegrationsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Integrations', path: '/integrations' },
        ])}
      />
      <IntegrationsContent />
    </>
  );
}
