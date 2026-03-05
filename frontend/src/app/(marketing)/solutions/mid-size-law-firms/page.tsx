import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Software for Mid-Size Law Firms',
  description:
    'Scale multi-team legal operations with stronger controls, analytics, trust workflows, and integration-ready architecture.',
  path: '/solutions/mid-size-law-firms',
  keywords: pageKeywordMap.solutionMid,
});

export default function MidSizeFirmsPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/mid-size-law-firms' },
          { name: 'Mid-Size Law Firms', path: '/solutions/mid-size-law-firms' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Solutions</span>
        <h1 className={styles.heroTitle}>Control and visibility for mid-size legal teams</h1>
        <p className={styles.heroText}>
          Mid-size firms need stronger operational control without slowing execution. StatutePro
          centralizes workflows, finance operations, and firm-level reporting.
        </p>
        <ul className={styles.list}>
          <li>Role-based controls across teams</li>
          <li>Trust and billing consistency at scale</li>
          <li>Cross-office reporting and performance insights</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/integrations" className={styles.ghostBtn}>Integrations</Link>
          <Link href="/trust-center" className={styles.ghostBtn}>Trust Center</Link>
          <Link href="/demo" className={styles.primaryBtn}>Book Demo</Link>
        </div>
      </section>
    </div>
  );
}
