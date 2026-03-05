import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Legal Case Management Software',
  description:
    'Track every matter from intake to closure with legal case management workflows built for visibility, speed, and accountability.',
  path: '/features/case-management',
  keywords: pageKeywordMap.featureCaseManagement,
});

export default function CaseManagementFeaturePage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: 'Case Management', path: '/features/case-management' },
        ])}
      />
      <section className={styles.surfaceCard}>
        <h1 className={styles.heroTitle}>Legal case management that keeps teams aligned</h1>
        <p className={styles.heroText}>
          Manage deadlines, communications, documents, and task progress from a centralized
          matter workspace.
        </p>
        <ul className={styles.list}>
          <li>Matter lifecycle visibility from intake to closure</li>
          <li>Workflow-driven task assignment and status tracking</li>
          <li>Deadline and date awareness across team members</li>
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/features/document-automation" className={styles.ghostBtn}>Document Automation</Link>
          <Link href="/features/client-portal" className={styles.ghostBtn}>Client Portal</Link>
          <Link href="/demo" className={styles.primaryBtn}>See It in Demo</Link>
        </div>
      </section>
    </div>
  );
}
