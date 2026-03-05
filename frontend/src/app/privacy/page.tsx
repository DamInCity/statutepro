import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/components/marketing/Marketing.module.css';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Review the StatutePro privacy policy and understand how we process, protect, and manage data within the platform.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className={styles.siteShell}>
      <MarketingHeader />
      <main className={styles.siteMain}>
        <div className={styles.container}>
          <JsonLd
            data={breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Privacy Policy', path: '/privacy' },
            ])}
          />
          <section className={styles.surfaceCard}>
            <span className={styles.kicker}>Policy</span>
            <h1 className={styles.heroTitle}>Privacy Policy</h1>
            <p className={styles.heroText}>
              We process information with security and confidentiality in mind. This page outlines
              how data is handled, retained, and protected in StatutePro.
            </p>
            <ul className={styles.list}>
              <li>Purpose-limited data handling</li>
              <li>Role-based access controls</li>
              <li>Operational and security safeguards</li>
            </ul>
            <div className={styles.heroCtas}>
              <Link href="/trust-center" className={styles.ghostBtn}>Trust Center</Link>
              <Link href="/security" className={styles.ghostBtn}>Security</Link>
              <Link href="/" className={styles.primaryBtn}>Back to Home</Link>
            </div>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
