import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Operations Blog',
  description:
    'Read insights on legal practice management, billing workflows, trust accounting, client experience, and law firm productivity.',
  path: '/blog',
  keywords: pageKeywordMap.blog,
});

const categories = [
  'Legal Practice Management',
  'Billing & Trust Accounting',
  'Client Intake and Portal Workflows',
  'Law Firm Analytics and KPI Strategy',
  'AI for Legal Operations',
  'Implementation and Change Management',
];

export default function BlogIndexPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />

      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Blog</span>
        <h1 className={styles.heroTitle}>Insights for modern law firm teams</h1>
        <p className={styles.heroText}>
          Content is organized around practical legal operations outcomes: stronger workflow
          consistency, better cash flow, cleaner reporting, and secure client collaboration.
        </p>
        <ul className={styles.list}>
          {categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/resources" className={styles.ghostBtn}>Browse Resources</Link>
          <Link href="/features/legal-ai" className={styles.ghostBtn}>AI Features</Link>
          <Link href="/demo" className={styles.primaryBtn}>See Platform Demo</Link>
        </div>
      </section>
    </div>
  );
}
