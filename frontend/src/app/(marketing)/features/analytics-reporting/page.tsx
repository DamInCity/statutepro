import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Law Firm Analytics and Reporting',
  description:
    'Track law firm performance with legal analytics and reporting across matters, billing, trust, and operational productivity.',
  path: '/features/analytics-reporting',
  keywords: pageKeywordMap.featureAnalytics,
});

export default function AnalyticsFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Analytics & Reporting', path: '/features/analytics-reporting' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>Operational intelligence for legal teams</h1>
        <p className={styles.heroText}>
          Make better management decisions with reporting that connects matter performance,
          billing status, trust context, and team productivity.
        </p>
        <ul className={styles.list}>
          <li>Practice and matter-level performance visibility</li>
          <li>Revenue and debtor trend tracking</li>
          <li>KPI-driven decision support for firm leaders</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/billing-time-tracking" className={styles.ghostBtn}>Billing & Time</Link>
          <Link href="/solutions/mid-size-law-firms" className={styles.ghostBtn}>Mid-Size Solutions</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
