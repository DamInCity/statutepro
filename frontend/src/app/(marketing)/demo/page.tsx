import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import LeadForm from '@/components/marketing/LeadForm';
import styles from '@/components/marketing/Marketing.module.css';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Book a Legal Software Demo',
  description:
    'Book a StatutePro demo to see legal case management, billing, trust accounting, client portal, and analytics workflows in action.',
  path: '/demo',
  keywords: pageKeywordMap.demo,
});

export default function DemoPage() {
  return (
    <div className={styles.container}>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Demo', path: '/demo' },
        ])}
      />
      <JsonLd
        data={faqSchema([
          {
            question: 'What will be covered in the demo?',
            answer:
              'The demo covers case management, billing workflows, trust accounting visibility, client collaboration, and reporting.',
          },
          {
            question: 'Is the demo tailored to our firm workflow?',
            answer:
              'Yes. We tailor the walkthrough to your practice setup, team roles, and operational priorities.',
          },
        ])}
      />

      <section className={styles.hero}>
        <article className={styles.surfaceCard}>
          <span className={styles.kicker}>Book a Demo</span>
          <h1 className={styles.heroTitle}>See StatutePro with your workflow in mind</h1>
          <p className={styles.heroText}>
            Get a focused walkthrough of the modules your team cares about most: intake,
            matters, billing, trust, and operational analytics.
          </p>
          <ul className={styles.list}>
            <li>Tailored product walkthrough</li>
            <li>Implementation and migration discussion</li>
            <li>Pricing options based on your team structure</li>
          </ul>
          <p className={styles.sectionLead}>
            Need security and compliance context first? Visit the <Link href="/trust-center">Trust Center</Link>.
          </p>
          <div className={styles.heroCtas}>
            <a href="mailto:sales@statutepro.local" className={styles.primaryBtn}>Request Demo</a>
            <Link href="/pricing" className={styles.ghostBtn}>View Pricing</Link>
            <Link href="/features" className={styles.ghostBtn}>Review Features</Link>
          </div>
        </article>

        <aside className={styles.surfaceCard}>
          <LeadForm intent="demo" title="Request a tailored demo" />
        </aside>
      </section>
    </div>
  );
}
