'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiMail, FiCalendar, FiCloud, FiDollarSign, FiDatabase,
  FiCode, FiArrowRight, FiLink, FiZap
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

const integrationCategories = [
  {
    title: 'Email & Communication',
    icon: <FiMail />,
    iconClass: '',
    description: 'Keep all client communications linked to their matters automatically. No more hunting through inboxes.',
    integrations: [
      { name: 'Microsoft Outlook', desc: 'Bi-directional email sync, calendar integration, and contact sync' },
      { name: 'Gmail & Google Workspace', desc: 'Email capture, Google Calendar sync, and Google Drive access' },
      { name: 'Microsoft Teams', desc: 'Matter-linked channels, notifications, and video conferencing links' },
      { name: 'Slack', desc: 'Real-time notifications for deadlines, assignments, and client activity' },
    ],
  },
  {
    title: 'Calendar & Scheduling',
    icon: <FiCalendar />,
    iconClass: 'mp-feature-icon-purple',
    description: 'Never miss a court date or client meeting. Sync deadlines across every calendar your team uses.',
    integrations: [
      { name: 'Microsoft Outlook Calendar', desc: 'Two-way sync of appointments, deadlines, and court dates' },
      { name: 'Google Calendar', desc: 'Automatic event creation from matter deadlines and tasks' },
      { name: 'Calendly', desc: 'Client-facing scheduling links connected to matter records' },
      { name: 'Court Rule Calendaring', desc: 'Automated court deadline calculation and scheduling' },
    ],
  },
  {
    title: 'Document Storage & Management',
    icon: <FiCloud />,
    iconClass: 'mp-feature-icon-teal',
    description: 'Connect your preferred cloud storage or use our built-in document management. Your files, your way.',
    integrations: [
      { name: 'SharePoint & OneDrive', desc: 'Direct access to firm documents with matter-level folder sync' },
      { name: 'Google Drive', desc: 'Seamless document creation, editing, and storage within matters' },
      { name: 'Dropbox Business', desc: 'Automatic folder organization and shared access controls' },
      { name: 'Box', desc: 'Enterprise-grade document management with compliance controls' },
    ],
  },
  {
    title: 'Accounting & Payments',
    icon: <FiDollarSign />,
    iconClass: 'mp-feature-icon-green',
    description: 'Eliminate double-entry and streamline your financial workflows from billing to bookkeeping.',
    integrations: [
      { name: 'QuickBooks Online', desc: 'Automatic invoice and payment sync, chart of accounts mapping' },
      { name: 'Xero', desc: 'Bi-directional financial data sync with trust account support' },
      { name: 'LawPay', desc: 'PCI-compliant credit card processing with IOLTA trust deposit routing' },
      { name: 'Stripe', desc: 'Modern payment processing with automated reconciliation' },
    ],
  },
  {
    title: 'Legal Research & Compliance',
    icon: <FiDatabase />,
    iconClass: 'mp-feature-icon-amber',
    description: 'Connect legal research and compliance tools directly into your matter workflows.',
    integrations: [
      { name: 'Westlaw', desc: 'Launch research sessions and link results to specific matters' },
      { name: 'LexisNexis', desc: 'Integrated research access with matter-level citation tracking' },
      { name: 'PACER', desc: 'Federal court filing search and document download integration' },
      { name: 'ComplianceHR', desc: 'Employment law compliance tools connected to HR-related matters' },
    ],
  },
  {
    title: 'Automation & Custom Workflows',
    icon: <FiCode />,
    iconClass: 'mp-feature-icon-rose',
    description: 'Build custom integrations and automate cross-platform workflows with our open API.',
    integrations: [
      { name: 'Zapier', desc: 'Connect 5,000+ apps with no-code automation workflows' },
      { name: 'Make (Integromat)', desc: 'Advanced multi-step automation scenarios across platforms' },
      { name: 'REST API', desc: 'Full API access for custom integrations and data sync' },
      { name: 'Webhooks', desc: 'Real-time event notifications for external system triggers' },
    ],
  },
];

export default function IntegrationsContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker">Integrations</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title">
            Connects with the tools{' '}
            <span className="mp-gradient-text">your firm already uses</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle">
            StatutePro isn&apos;t an island. It integrates natively with Microsoft 365, Google Workspace,
            accounting platforms, payment processors, legal research tools, and 5,000+ apps via
            Zapier — so your team can work in their preferred tools without losing data continuity.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-primary">
              See Integrations Live <FiArrowRight />
            </Link>
            <Link href="/features" className="mp-btn-ghost">
              Platform Features
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Stats ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <div className="mp-stats-bar">
              <div className="mp-stat">
                <div className="mp-stat-value">30+</div>
                <div className="mp-stat-label">Native Integrations</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">5,000+</div>
                <div className="mp-stat-label">Apps via Zapier</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">REST</div>
                <div className="mp-stat-label">Open API Access</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">2-Way</div>
                <div className="mp-stat-label">Data Sync</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Integration Categories ── */}
      {integrationCategories.map((category, i) => (
        <section
          key={category.title}
          className={`mp-section ${i % 2 === 0 ? '' : 'mp-section-alt'}`}
        >
          <div className="mp-container">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div className={`mp-feature-icon ${category.iconClass}`} style={{ margin: '0 auto 1rem' }}>
                  {category.icon}
                </div>
                <h2 className="mp-section-title">{category.title}</h2>
                <p className="mp-section-lead">{category.description}</p>
              </div>
            </Reveal>
            <div className="mp-grid-2">
              {category.integrations.map((integration, j) => (
                <Reveal key={integration.name} delay={j * 0.05}>
                  <div className="mp-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiLink style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {integration.name}
                    </h3>
                    <p>{integration.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── API Section ── */}
      <section className="mp-section">
        <div className="mp-container">
          <div className="mp-split">
            <Reveal>
              <div className="mp-split-text">
                <div className="mp-feature-icon mp-feature-icon-rose">
                  <FiCode />
                </div>
                <h2>Build with the StatutePro API</h2>
                <p>
                  Need a custom integration? Our RESTful API gives you programmatic access to
                  matters, contacts, time entries, invoices, documents, and more. Build custom
                  workflows, sync with proprietary systems, or create entirely new experiences
                  on top of the StatutePro platform.
                </p>
                <ul className="mp-check-list">
                  <li>RESTful API with comprehensive documentation</li>
                  <li>OAuth 2.0 authentication for secure access</li>
                  <li>Webhook support for real-time event notifications</li>
                  <li>Rate-limited with generous quotas for Enterprise</li>
                  <li>SDKs for Python, JavaScript, and C#</li>
                </ul>
                <div style={{ marginTop: '1.5rem' }}>
                  <Link href="/docs" className="mp-btn-ghost">
                    <FiZap /> View API Documentation
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mp-split-visual" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(139,92,246,0.08))' }}>
                <div className="mp-split-visual-inner">
                  <FiCode />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mp-cta">
        <Reveal>
          <h2 className="mp-cta-title">Don&apos;t see your tool? Let&apos;s talk.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            Our integration ecosystem is growing every month. Tell us what tools your firm
            relies on and we&apos;ll show you how StatutePro connects — or build it if it&apos;s not
            there yet.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-white">
              Discuss Integrations <FiArrowRight />
            </Link>
            <Link href="/contact" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Request an Integration
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
