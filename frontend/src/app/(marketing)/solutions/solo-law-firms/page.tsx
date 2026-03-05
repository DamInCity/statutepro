import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Software for Solo Law Firms',
  description:
    'StatutePro helps solo lawyers streamline casework, billing, trust operations, and client communication without tool sprawl.',
  path: '/solutions/solo-law-firms',
  keywords: pageKeywordMap.solutionSolo,
});

export default function SoloFirmsPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions/solo-law-firms' },
          { name: 'Solo Law Firms', path: '/solutions/solo-law-firms' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Solutions</span>
        <h1 className={styles.heroTitle}>Solo law firm management without the overhead</h1>
        <p className={styles.heroText}>
          Solo practices need speed and simplicity. StatutePro gives one place to manage matters,
          deadlines, invoices, trust balances, and client updates.
        </p>
        <ul className={styles.list}>
          <li>Case lifecycle visibility in one dashboard</li>
          <li>Faster invoice generation and follow-up</li>
          <li>Secure client collaboration without extra tools</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/case-management" className={styles.ghostBtn}>Case Management</Link>
          <Link href="/pricing" className={styles.ghostBtn}>Pricing</Link>
          <Link href="/demo" className={styles.primaryBtn}>Book Demo</Link>
        </div>
      </section>
    </div>
  );
}
