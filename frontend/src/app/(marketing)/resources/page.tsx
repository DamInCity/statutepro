import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Resources',
  description:
    'Browse StatutePro legal operations resources including implementation guides, workflow playbooks, and product planning content.',
  path: '/resources',
  keywords: pageKeywordMap.resources,
});

const resources = [
  'Legal practice management implementation checklist',
  'Trust accounting workflow readiness guide',
  'Legal billing operations optimization framework',
  'Law firm reporting and KPI baseline worksheet',
  'Client portal rollout communication template',
  'Migration planning playbook for law firms',
];

export default function ResourcesPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' },
        ])}
      />

      <section className={styles.surfaceCard}>
        <span className={styles.kicker}>Resources</span>
        <h1 className={styles.heroTitle}>Practical guides for legal operations teams</h1>
        <p className={styles.heroText}>
          Use these resources to evaluate platform fit, improve process quality, and plan
          implementation with less risk.
        </p>
        <ul className={styles.list}>
          {resources.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className={styles.heroCtas}>
          <Link href="/blog" className={styles.ghostBtn}>Visit Blog</Link>
          <Link href="/demo" className={styles.primaryBtn}>Book Implementation Demo</Link>
          <Link href="/contact" className={styles.ghostBtn}>Talk to Sales</Link>
        </div>
      </section>
    </div>
  );
}
