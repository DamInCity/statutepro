import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'About StatutePro',
  description:
    'Learn about StatutePro and our mission to help law firms run secure, profitable, and operationally efficient practices.',
  path: '/about',
  keywords: pageKeywordMap.about,
});

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Company</span>
        <h1 className={styles.heroTitle}>Purpose-built legal operations software</h1>
        <p className={styles.heroText}>
          StatutePro exists to help law firms reduce operational friction by unifying matter
          workflows, legal billing, trust visibility, and reporting in one platform.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/features" className={styles.ghostBtn}>Explore Features</Link>
          <Link href="/demo" className={styles.primaryBtn}>Book Demo</Link>
          <Link href="/contact" className={styles.ghostBtn}>Contact Sales</Link>
        </div>
      </section>
    </div>
  );
}
