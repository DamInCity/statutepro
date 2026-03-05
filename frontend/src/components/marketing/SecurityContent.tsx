'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiShield, FiLock, FiEye, FiServer, FiKey, FiActivity,
  FiArrowRight, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import '../marketing/MarketingPages.css';

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const securityPillars = [
  {
    icon: <FiLock />,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted with 256-bit AES encryption at rest and TLS 1.3 in transit. Your client communications, case files, and financial records are protected at every layer.',
  },
  {
    icon: <FiKey />,
    title: 'Role-Based Access Control',
    description: 'Granular permission sets ensure attorneys, paralegals, and staff only access what they need. Define custom roles per practice area, office, or matter type.',
  },
  {
    icon: <FiEye />,
    title: 'Complete Audit Trail',
    description: 'Every action in the system is logged — document views, record changes, financial transactions, and login events. Meet your ethical obligations with verifiable accountability.',
  },
  {
    icon: <FiServer />,
    title: 'SOC 2 Type II Infrastructure',
    description: 'StatutePro is hosted on SOC 2 Type II certified infrastructure with automated backups, geographic redundancy, and 99.9% uptime SLA.',
  },
  {
    icon: <FiShield />,
    title: 'IOLTA & Trust Compliance',
    description: 'Built-in trust accounting controls help you maintain compliance with state bar IOLTA requirements. Three-way reconciliation, segregated ledgers, and tamper-evident records.',
  },
  {
    icon: <FiActivity />,
    title: 'Continuous Monitoring',
    description: 'Real-time threat detection, automated vulnerability scanning, and proactive incident response keep your data safe around the clock.',
  },
];

const certifications = [
  { name: 'SOC 2 Type II', desc: 'Audited security, availability, and confidentiality controls' },
  { name: 'AES-256 Encryption', desc: 'Military-grade encryption for data at rest and in transit' },
  { name: 'TLS 1.3', desc: 'Latest transport layer security for all connections' },
  { name: 'IOLTA Compliant', desc: 'Trust accounting designed for state bar compliance' },
  { name: 'GDPR Ready', desc: 'Data privacy controls for international client data' },
  { name: '99.9% Uptime SLA', desc: 'Guaranteed availability backed by service level agreement' },
];

const faqs = [
  {
    q: 'Where is my data stored?',
    a: 'StatutePro data is stored in SOC 2 Type II certified data centers with geographic redundancy. Primary hosting is in the United States with options for data residency in other regions for Enterprise customers.',
  },
  {
    q: 'How do you handle data backups?',
    a: 'We perform automated encrypted backups every 6 hours with 30-day retention. Backups are stored in geographically separate facilities from primary data to ensure disaster recovery capability.',
  },
  {
    q: 'Can I control who sees what in my firm?',
    a: 'Yes. Our role-based access control (RBAC) system allows you to define granular permissions by role, practice area, office, and even individual matter. You control exactly who can view, edit, or manage each area of the platform.',
  },
  {
    q: 'Do you support single sign-on (SSO)?',
    a: 'Yes. Enterprise plans include SAML 2.0 SSO integration with identity providers like Okta, Azure AD, and Google Workspace. Multi-factor authentication (MFA) is available on all plans.',
  },
  {
    q: 'How do you handle security incidents?',
    a: 'We maintain a documented incident response plan with 24/7 monitoring. In the event of a security incident, affected customers are notified within 24 hours with full transparency about scope, impact, and remediation steps.',
  },
];

export default function SecurityContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-dark mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker" style={{ background: 'rgba(114,160,255,0.15)', color: '#72a0ff' }}>
            Security & Compliance
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title" style={{ color: '#f7faff' }}>
            Enterprise-grade security.{' '}
            <span className="mp-gradient-text">Legal-grade trust.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle" style={{ color: '#9baac2' }}>
            Law firms handle some of the most sensitive information in any industry — client
            confidences, financial records, privileged communications, and trust funds. StatutePro
            is built from the ground up to protect it all with the security controls your
            ethical obligations demand.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mp-cta-group">
            <Link href="/trust-center" className="mp-btn-primary">
              Visit Trust Center <FiArrowRight />
            </Link>
            <Link href="/demo" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Book Security Walkthrough
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Certification Badges ── */}
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Security certifications & standards</h2>
            <p className="mp-section-lead">
              StatutePro meets the highest industry standards for data protection, privacy, and infrastructure reliability.
            </p>
          </Reveal>
          <div className="mp-grid-3">
            {certifications.map((cert, i) => (
              <Reveal key={cert.name} delay={i * 0.05}>
                <div className="mp-card mp-card-elevated" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '0.75rem' }}>
                    <FiCheckCircle />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-strong)' }}>
                    {cert.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{cert.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Pillars ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">How we protect your firm&apos;s data</h2>
            <p className="mp-section-lead">
              Six layers of security work together to ensure your data is protected,
              access is controlled, and every action is accountable.
            </p>
          </Reveal>
          <div className="mp-shield-grid">
            {securityPillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.05}>
                <div className="mp-shield-item">
                  <div className="mp-shield-icon">{pillar.icon}</div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Handling Split ── */}
      <section className="mp-section">
        <div className="mp-container">
          <div className="mp-split">
            <Reveal>
              <div className="mp-split-text">
                <div className="mp-feature-icon mp-feature-icon-amber">
                  <FiAlertTriangle />
                </div>
                <h2>Your ethical obligations, our engineering commitment</h2>
                <p>
                  Rule 1.6 of the ABA Model Rules of Professional Conduct requires lawyers to make
                  &quot;reasonable efforts to prevent the inadvertent or unauthorized disclosure of, or
                  unauthorized access to, information relating to the representation of a client.&quot;
                </p>
                <p>
                  StatutePro is engineered to help you meet this obligation with technical controls
                  that go beyond &quot;reasonable efforts&quot; — including encryption, access controls,
                  audit trails, and infrastructure security that many larger firms struggle to
                  implement on their own.
                </p>
                <ul className="mp-check-list">
                  <li>Client data isolation per matter and per client</li>
                  <li>Conflict-of-interest safeguards at the data layer</li>
                  <li>Privileged communication protections</li>
                  <li>Compliant data retention and destruction policies</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mp-split-visual">
                <div className="mp-split-visual-inner">
                  <FiShield />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Security FAQ</h2>
            <p className="mp-section-lead">
              Common questions from IT teams, managing partners, and compliance officers.
            </p>
          </Reveal>
          <div className="mp-faq-grid">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.05}>
                <div className="mp-faq-item">
                  <div className="mp-faq-question">{faq.q}</div>
                  <div className="mp-faq-answer">{faq.a}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mp-cta">
        <Reveal>
          <h2 className="mp-cta-title">See our security controls in action</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            Book a dedicated security walkthrough with our team. We&apos;ll show you exactly
            how StatutePro protects your firm&apos;s data, meets compliance requirements,
            and supports your ethical obligations.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-white">
              Book Security Walkthrough <FiArrowRight />
            </Link>
            <Link href="/trust-center" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Visit Trust Center
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
