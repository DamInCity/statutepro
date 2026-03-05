import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Careers',
  description:
    'Join StatutePro and help build modern legal practice management software for law firms across growth stages.',
  path: '/careers',
  keywords: pageKeywordMap.careers,
});

export default function CareersPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
        ])}
      />

      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Careers</span>
        <h1 className={styles.heroTitle}>Build legal technology that matters</h1>
        <p className={styles.heroText}>
          We are building secure, AI-enabled operations software for law firms. If you care
          about product quality, reliability, and practical impact, we would like to hear from you.
        </p>
        <ul className={styles.list}>
          <li>Remote-first collaboration model</li>
          <li>Product, design, and engineering roles</li>
          <li>Customer-centric execution culture</li>
        </ul>
        <div className={styles.heroCtas}>
          <a href="mailto:careers@statutepro.local" className={styles.primaryBtn}>Apply via Email</a>
          <Link href="/about" className={styles.ghostBtn}>About Us</Link>
          <Link href="/contact" className={styles.ghostBtn}>Contact Team</Link>
          <Link href="/demo" className={styles.ghostBtn}>Book Demo</Link>
        </div>
      </section>
    </div>
  );
}
