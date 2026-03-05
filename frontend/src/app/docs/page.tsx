import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/components/marketing/Marketing.module.css';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Documentation',
  description:
    'Read StatutePro platform documentation and technical references for backend APIs, frontend architecture, and operational setup.',
  path: '/docs',
  noIndex: true,
});

export default function DocsPage() {
  return (
    <div className={styles.siteShell}>
      <MarketingHeader />
      <main className={styles.siteMain}>
        <div className={styles.container}>
          <JsonLd
            data={breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Docs', path: '/docs' },
            ])}
          />
          <section className={styles.surfaceCard}>
            <span className={styles.kicker}>Documentation</span>
            <h1 className={styles.heroTitle}>Technical and product references</h1>
            <p className={styles.heroText}>Documentation for platform setup, API usage, and architecture context.</p>
            <ul className={styles.list}>
              <li>
                API Docs:{' '}
                <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
                  http://localhost:8000/docs
                </a>
              </li>
              <li>Backend: FastAPI + SQLAlchemy</li>
              <li>Frontend: Next.js 15 + React Bootstrap</li>
            </ul>
            <div className={styles.heroCtas}>
              <Link href="/features" className={styles.ghostBtn}>Features</Link>
              <Link href="/demo" className={styles.ghostBtn}>Book Demo</Link>
              <Link href="/" className={styles.primaryBtn}>Back to Home</Link>
            </div>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
