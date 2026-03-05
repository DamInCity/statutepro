import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Billing and Time Tracking Software',
  description:
    'Capture billable time, generate invoices, and improve collections with legal billing and time tracking workflows.',
  path: '/features/billing-time-tracking',
  keywords: pageKeywordMap.featureBillingTime,
});

export default function BillingTimeFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Billing & Time Tracking', path: '/features/billing-time-tracking' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>Bill accurately and get paid faster</h1>
        <p className={styles.heroText}>
          Simplify legal billing operations with structured time capture, flexible fee workflows,
          and cleaner invoice generation.
        </p>
        <ul className={styles.list}>
          <li>Time capture and expense visibility</li>
          <li>Invoice generation and tracking workflows</li>
          <li>Collections-oriented operational reporting</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/trust-accounting" className={styles.ghostBtn}>Trust Accounting</Link>
          <Link href="/pricing" className={styles.ghostBtn}>Pricing</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
