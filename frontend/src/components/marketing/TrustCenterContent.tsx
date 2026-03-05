'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiShield, FiFileText, FiDatabase, FiUsers, FiGlobe,
  FiCheckCircle, FiArrowRight, FiBook, FiAlertCircle
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

const governanceAreas = [
  {
    icon: <FiShield />,
    title: 'IOLTA & Trust Fund Compliance',
    description: 'StatutePro\'s trust accounting module is purpose-built for state bar IOLTA compliance. Maintain segregated client ledgers, perform three-way reconciliation, and generate audit-ready reports that satisfy regulatory requirements across all U.S. jurisdictions.',
    items: [
      'Matter-level trust ledgers with real-time balances',
      'Automated three-way reconciliation (bank, book, client)',
      'Tamper-evident transaction records with full audit trail',
      'Trust-to-operating transfer controls with approval workflows',
      'IOLTA interest allocation and reporting',
    ],
  },
  {
    icon: <FiFileText />,
    title: 'ABA Model Rules Alignment',
    description: 'Our platform is designed to help firms maintain compliance with key ABA Model Rules of Professional Conduct, including confidentiality (1.6), safekeeping of client property (1.15), and supervisory obligations (5.1/5.3).',
    items: [
      'Client confidentiality protections at the infrastructure level',
      'Segregated trust accounting per Rule 1.15',
      'Role-based supervision controls per Rules 5.1 and 5.3',
      'Conflict-of-interest detection safeguards',
      'Detailed audit logs for ethical compliance verification',
    ],
  },
  {
    icon: <FiDatabase />,
    title: 'Data Governance & Privacy',
    description: 'Control how data is collected, stored, accessed, and destroyed across your entire firm. Our data governance framework ensures compliance with privacy regulations and professional obligations.',
    items: [
      'Data retention policies configurable by matter type',
      'Secure data destruction with certified deletion',
      'Data residency options for jurisdictional requirements',
      'GDPR and CCPA compliant data handling workflows',
      'Export tools for complete data portability',
    ],
  },
  {
    icon: <FiUsers />,
    title: 'Access Governance',
    description: 'Define who can see, edit, and manage every area of the platform. From partner-level financial access to paralegal document permissions, every access point is controlled and auditable.',
    items: [
      'Granular role-based access control (RBAC)',
      'Practice area and matter-level permission boundaries',
      'Multi-factor authentication (MFA) on all accounts',
      'IP allowlisting for sensitive access',
      'Session management and forced logout capabilities',
    ],
  },
  {
    icon: <FiGlobe />,
    title: 'Vendor & Infrastructure Governance',
    description: 'StatutePro maintains rigorous vendor management and infrastructure controls. Our supply chain is audited, our partners are vetted, and our infrastructure meets the highest security standards.',
    items: [
      'SOC 2 Type II certified cloud infrastructure',
      'Vetted third-party vendor and subprocessor list',
      'Encrypted backups with 30-day retention',
      'Disaster recovery with geographic redundancy',
      'Regular third-party penetration testing',
    ],
  },
  {
    icon: <FiAlertCircle />,
    title: 'Incident Response & Transparency',
    description: 'In the unlikely event of a security incident, our documented response plan ensures rapid containment, thorough investigation, and transparent communication with affected customers.',
    items: [
      '24/7 security monitoring and threat detection',
      'Documented incident response procedures',
      'Customer notification within 24 hours of confirmed incidents',
      'Post-incident review and remediation reports',
      'Continuous improvement from security lessons learned',
    ],
  },
];

const implementationSteps = [
  {
    number: '1',
    title: 'Discovery & Assessment',
    description: 'We review your firm\'s current workflows, compliance requirements, and security posture to create a tailored implementation plan.',
  },
  {
    number: '2',
    title: 'Configuration & Migration',
    description: 'Our team configures roles, permissions, and workflows to match your firm structure, then migrates data from your existing systems.',
  },
  {
    number: '3',
    title: 'Training & Validation',
    description: 'Role-specific training for attorneys, paralegals, and staff ensures everyone is confident and effective from day one.',
  },
  {
    number: '4',
    title: 'Ongoing Compliance Support',
    description: 'Regular security reviews, platform updates, and dedicated support keep your firm compliant and protected as requirements evolve.',
  },
];

export default function TrustCenterContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-dark mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            Trust Center
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title" style={{ color: '#f7faff' }}>
            Compliance isn&apos;t a feature.{' '}
            <span className="mp-gradient-text">It&apos;s our foundation.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle" style={{ color: '#9baac2' }}>
            Your clients trust you with their most sensitive matters. You need technology
            that earns the same level of trust. StatutePro&apos;s governance framework is designed
            to support your compliance obligations across trust accounting, data privacy,
            access control, and ethical standards.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mp-badge-row" style={{ marginBottom: '2rem' }}>
            <span className="mp-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <FiCheckCircle /> IOLTA Compliant
            </span>
            <span className="mp-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <FiCheckCircle /> SOC 2 Type II
            </span>
            <span className="mp-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <FiCheckCircle /> ABA Aligned
            </span>
            <span className="mp-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <FiCheckCircle /> GDPR Ready
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-primary">
              Book Compliance Review <FiArrowRight />
            </Link>
            <Link href="/security" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Security Overview
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Governance Areas ── */}
      {governanceAreas.map((area, i) => (
        <section
          key={area.title}
          className={`mp-section ${i % 2 === 0 ? '' : 'mp-section-alt'}`}
        >
          <div className="mp-container">
            <div className={`mp-split ${i % 2 !== 0 ? 'mp-split-reverse' : ''}`}>
              <Reveal>
                <div className="mp-split-text">
                  <div className="mp-feature-icon mp-feature-icon-green">
                    {area.icon}
                  </div>
                  <h2>{area.title}</h2>
                  <p>{area.description}</p>
                  <ul className="mp-check-list">
                    {area.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mp-split-visual">
                  <div className="mp-split-visual-inner">
                    {area.icon}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* ── Implementation Process ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Compliance-ready onboarding</h2>
            <p className="mp-section-lead">
              Our structured implementation process ensures your firm is set up for compliance
              from day one — with the right roles, permissions, and workflows in place.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mp-steps">
              {implementationSteps.map((step) => (
                <div key={step.number} className="mp-step">
                  <div className="mp-step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <div className="mp-testimonial">
              <div className="mp-testimonial-quote">
                As a managing partner, trust accounting compliance keeps me up at night.
                StatutePro&apos;s three-way reconciliation and audit trail gave me peace of mind
                I didn&apos;t know was possible with software. Our last bar audit was the smoothest
                we&apos;ve ever had.
              </div>
              <div className="mp-testimonial-author">Michael Torres, Managing Partner</div>
              <div className="mp-testimonial-role">Torres Legal Group — Family Law, 12 attorneys</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Request Documentation ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <div className="mp-highlight" style={{ textAlign: 'center', maxWidth: '700px' }}>
              <div style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '1rem' }}>
                <FiBook />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-strong)' }}>
                Request Compliance Documentation
              </h3>
              <p style={{ margin: '0 0 1.5rem' }}>
                Need our SOC 2 report, data processing agreement, security whitepaper, or
                vendor assessment questionnaire? Contact our compliance team.
              </p>
              <Link href="/contact" className="mp-btn-primary">
                Request Documentation <FiArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mp-cta">
        <Reveal>
          <h2 className="mp-cta-title">Let&apos;s review your compliance requirements</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            Schedule a compliance-focused session with our team. We&apos;ll walk through
            trust accounting, access governance, data handling, and security controls
            specific to your firm&apos;s jurisdictional requirements.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-white">
              Book Compliance Review <FiArrowRight />
            </Link>
            <Link href="/security" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Security Overview
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
