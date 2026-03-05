import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Trust Accounting Software',
  description:
    'Manage trust workflows with legal finance controls, matter-level visibility, and compliance-oriented reporting support.',
  path: '/features/trust-accounting',
  keywords: pageKeywordMap.featureTrustAccounting,
});

export default function TrustAccountingFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Trust Accounting', path: '/features/trust-accounting' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>Trust accounting with legal workflow clarity</h1>
        <p className={styles.heroText}>
          Support trust-sensitive operations with structured records, ledger visibility, and
          finance-aware approvals.
        </p>
        <ul className={styles.list}>
          <li>Trust-aware billing and reconciliation workflows</li>
          <li>Matter-level financial traceability</li>
          <li>Reporting support for audit-ready operations</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/trust-center" className={styles.ghostBtn}>Trust Center</Link>
          <Link href="/features/billing-time-tracking" className={styles.ghostBtn}>Billing & Time</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
