import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI for Law Firms',
  description:
    'Use legal AI workflows to reduce repetitive operational work while preserving quality, control, and professional accountability.',
  path: '/features/legal-ai',
  keywords: pageKeywordMap.featureLegalAi,
});

export default function LegalAiFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Legal AI', path: '/features/legal-ai' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>AI workflows for legal operations</h1>
        <p className={styles.heroText}>
          Accelerate repetitive operational tasks with AI-assisted workflows designed to support
          legal productivity, not replace professional judgment.
        </p>
        <ul className={styles.list}>
          <li>Faster drafting and workflow preparation</li>
          <li>Operational support for matter management teams</li>
          <li>Security-aware AI adoption path</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/document-automation" className={styles.ghostBtn}>Document Automation</Link>
          <Link href="/trust-center" className={styles.ghostBtn}>Trust Center</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
