import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Client Portal Software',
  description:
    'Improve client communication and transparency with a secure legal client portal connected to matter workflows.',
  path: '/features/client-portal',
  keywords: pageKeywordMap.featureClientPortal,
});

export default function ClientPortalFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Client Portal', path: '/features/client-portal' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>Secure client collaboration from one portal</h1>
        <p className={styles.heroText}>
          Keep communication centralized and contextual by linking client messages, files, and
          matter updates in one secure interface.
        </p>
        <ul className={styles.list}>
          <li>Secure document and status sharing</li>
          <li>Client communication linked to matter records</li>
          <li>Reduced email fragmentation across teams</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/case-management" className={styles.ghostBtn}>Case Management</Link>
          <Link href="/security" className={styles.ghostBtn}>Security</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
