import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Document Automation',
  description:
    'Reduce manual drafting effort with legal document automation, templates, and workflow-driven review steps.',
  path: '/features/document-automation',
  keywords: pageKeywordMap.featureDocumentAutomation,
});

export default function DocumentAutomationFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Document Automation', path: '/features/document-automation' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>Legal document workflows with less manual work</h1>
        <p className={styles.heroText}>
          Standardize documents, reduce drafting time, and keep approvals consistent with
          template-based legal document automation.
        </p>
        <ul className={styles.list}>
          <li>Reusable templates for recurring legal workflows</li>
          <li>Centralized document access within each matter</li>
          <li>Approval-friendly process handoffs</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/case-management" className={styles.ghostBtn}>Case Management</Link>
          <Link href="/features/legal-ai" className={styles.ghostBtn}>Legal AI</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
