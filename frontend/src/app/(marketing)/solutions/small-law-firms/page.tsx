import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Software for Small Law Firms',
  description:
    'Enable your small law firm to standardize workflows, improve billing consistency, and increase visibility across teams.',
  path: '/solutions/small-law-firms',
  keywords: pageKeywordMap.solutionSmall,
});

export default function SmallFirmsPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/small-law-firms' },
          { name: 'Small Law Firms', path: '/solutions/small-law-firms' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Solutions</span>
        <h1 className={styles.heroTitle}>Operational consistency for growing small firms</h1>
        <p className={styles.heroText}>
          Standardize intake, matter workflows, billing, and trust operations so teams can scale
          without creating process debt.
        </p>
        <ul className={styles.list}>
          <li>Cross-team task and deadline visibility</li>
          <li>Billing, trust, and debtor workflow control</li>
          <li>Performance reporting for partners and managers</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/analytics-reporting" className={styles.ghostBtn}>Analytics</Link>
          <Link href="/features/trust-accounting" className={styles.ghostBtn}>Trust Accounting</Link>
          <Link href="/demo" className={styles.primaryBtn}>Book Demo</Link>
        </div>
      </section>
    </div>
  );
}
