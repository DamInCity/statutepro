import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import LeadForm from '@/components/marketing/LeadForm';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Sales',
  description:
    'Contact StatutePro sales for legal practice management pricing, implementation support, and product fit consultation.',
  path: '/contact',
  keywords: pageKeywordMap.contact,
});

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <JsonLd
        data={faqSchema([
          {
            question: 'Can we discuss migration from an existing legal platform?',
            answer:
              'Yes. We provide migration planning and onboarding guidance based on your current setup and data structure.',
          },
          {
            question: 'Do you support trust accounting and compliance workflows?',
            answer:
              'Yes. Our platform includes trust-aware legal finance workflows and security-first controls.',
          },
        ])}
      />

      <section className={styles.hero}>
        <article className={styles.surfaceCard}>
          <span className={styles.kicker}>Contact Sales</span>
          <h1 className={styles.heroTitle}>Talk to our team</h1>
          <p className={styles.heroText}>
            Share your firm size, workflow priorities, and reporting needs. We will map the right
            rollout path for your legal practice management goals.
          </p>
          <ul className={styles.list}>
            <li>Email: sales@statutepro.local</li>
            <li>Demo-led requirement review</li>
            <li>Pricing and implementation planning</li>
          </ul>
          <div className={styles.heroCtas}>
            <Link href="/demo" className={styles.primaryBtn}>Book Demo</Link>
            <Link href="/pricing" className={styles.ghostBtn}>View Pricing</Link>
            <Link href="/security" className={styles.ghostBtn}>Security Overview</Link>
          </div>
        </article>

        <aside className={styles.surfaceCard}>
          <LeadForm intent="contact" title="Send your requirements" />
        </aside>
      </section>
    </div>
  );
}
