'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiBriefcase, FiClock, FiDollarSign, FiUsers, FiFileText,
  FiBarChart2, FiShield, FiCpu, FiArrowRight
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

const features = [
  {
    icon: <FiBriefcase />,
    iconClass: '',
    title: 'Case & Matter Management',
    description:
      'Track every matter from client intake to resolution. Organize deadlines, court dates, documents, and team assignments in a centralized workspace — so nothing falls through the cracks.',
    points: [
      'Full matter lifecycle tracking from intake to closure',
      'Custom workflow templates for every practice area',
      'Automated deadline and court date awareness',
      'Real-time task assignment and status tracking',
    ],
    href: '/features/case-management',
  },
  {
    icon: <FiClock />,
    iconClass: 'mp-feature-icon-purple',
    title: 'Time Tracking & Legal Billing',
    description:
      'Capture billable time effortlessly, generate professional invoices in minutes, and accelerate collections. Stop leaving revenue on the table with manual billing processes.',
    points: [
      'One-click time capture from any matter view',
      'Flexible fee structures: hourly, flat, contingency, hybrid',
      'Batch invoice generation with custom templates',
      'Automated payment reminders and collections tracking',
    ],
    href: '/features/billing-time-tracking',
  },
  {
    icon: <FiDollarSign />,
    iconClass: 'mp-feature-icon-green',
    title: 'Trust & IOLTA Accounting',
    description:
      'Maintain full compliance with bar association trust accounting rules. Three-way reconciliation, matter-level ledgers, and audit-ready reporting keep your firm protected.',
    points: [
      'Three-way trust reconciliation built in',
      'Matter-level trust ledger visibility',
      'IOLTA-compliant transaction workflows',
      'Audit-ready financial reporting and exports',
    ],
    href: '/features/trust-accounting',
  },
  {
    icon: <FiUsers />,
    iconClass: 'mp-feature-icon-teal',
    title: 'Client Portal & Communication',
    description:
      'Give clients 24/7 access to case status, documents, and messages through a branded, secure portal. Reduce "any updates?" calls by 80% and build trust through transparency.',
    points: [
      'Branded client portal with your firm\'s identity',
      'Secure document sharing and e-signatures',
      'Real-time case status updates for clients',
      'Centralized communication history per matter',
    ],
    href: '/features/client-portal',
  },
  {
    icon: <FiFileText />,
    iconClass: 'mp-feature-icon-amber',
    title: 'Document Automation & Management',
    description:
      'Eliminate hours of repetitive drafting. Use template-driven document generation, automated field population, and centralized cloud storage to produce accurate legal documents faster.',
    points: [
      'Template library for fee agreements, pleadings, and more',
      'Auto-populate client and matter data into templates',
      'Version control with full revision history',
      'Cloud-native storage with instant search',
    ],
    href: '/features/document-automation',
  },
  {
    icon: <FiBarChart2 />,
    iconClass: 'mp-feature-icon-rose',
    title: 'Analytics & Firm Intelligence',
    description:
      'Transform your firm\'s data into actionable insights. Track revenue trends, attorney utilization, matter profitability, and collection rates in real-time dashboards.',
    points: [
      'Firm-wide revenue and profitability dashboards',
      'Attorney utilization and productivity tracking',
      'Accounts receivable aging and collection analytics',
      'Custom reports with scheduled delivery',
    ],
    href: '/features/analytics-reporting',
  },
  {
    icon: <FiShield />,
    iconClass: 'mp-feature-icon-green',
    title: 'Security & Access Control',
    description:
      'Enterprise-grade security built for the sensitivity of legal data. Role-based permissions, audit logging, and encryption protect your firm and your clients.',
    points: [
      '256-bit AES encryption at rest and in transit',
      'Role-based access control (RBAC) with granular permissions',
      'Complete audit trail for every action',
      'SOC 2 Type II compliant infrastructure',
    ],
    href: '/security',
  },
  {
    icon: <FiCpu />,
    iconClass: 'mp-feature-icon-purple',
    title: 'AI-Powered Legal Workflows',
    description:
      'Leverage artificial intelligence to draft documents faster, summarize case files, surface relevant precedents, and automate routine administrative tasks — while keeping attorneys in control.',
    points: [
      'AI-assisted document drafting and review',
      'Intelligent matter summarization',
      'Smart time entry suggestions',
      'Workflow automation recommendations',
    ],
    href: '/features/legal-ai',
  },
];

export default function FeaturesContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker">Platform Features</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title">
            Everything your law firm needs.{' '}
            <span className="mp-gradient-text">One&nbsp;platform.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle">
            StatutePro replaces the patchwork of disconnected tools most law firms rely on.
            Manage cases, automate billing, track trust accounts, collaborate with clients,
            and get firm-wide analytics — all from a single, secure platform built exclusively
            for legal professionals.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-primary">
              Book a Free Demo <FiArrowRight />
            </Link>
            <Link href="/pricing" className="mp-btn-ghost">
              View Pricing
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Stats Bar ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <div className="mp-stats-bar">
              <div className="mp-stat">
                <div className="mp-stat-value">8+</div>
                <div className="mp-stat-label">Integrated Modules</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">50%</div>
                <div className="mp-stat-label">Less Time on Admin</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">3x</div>
                <div className="mp-stat-label">Faster Invoice Cycles</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">99.9%</div>
                <div className="mp-stat-label">Uptime SLA</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Feature Deep Dives ── */}
      {features.map((feature, i) => (
        <section
          key={feature.title}
          className={`mp-section ${i % 2 === 0 ? '' : 'mp-section-alt'}`}
        >
          <div className="mp-container">
            <div className={`mp-split ${i % 2 !== 0 ? 'mp-split-reverse' : ''}`}>
              <Reveal>
                <div className="mp-split-text">
                  <div className={`mp-feature-icon ${feature.iconClass}`}>
                    {feature.icon}
                  </div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <ul className="mp-check-list">
                    {feature.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '1.5rem' }}>
                    <Link href={feature.href} className="mp-feature-link">
                      Learn more <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mp-split-visual">
                  <div className="mp-split-visual-inner">
                    {feature.icon}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* ── Why Firms Choose StatutePro ── */}
      <section className="mp-section mp-testimonial-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Why law firms choose StatutePro</h2>
            <p className="mp-section-lead">
              Legal professionals deserve software designed for how they actually work —
              not generic project management tools with a legal skin.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mp-grid-3" style={{ marginTop: '2rem' }}>
              <div className="mp-card mp-card-elevated">
                <h3>Built Exclusively for Legal</h3>
                <p>
                  Every feature is designed around legal workflows — from matter-centric
                  organization to IOLTA-compliant trust accounting. No awkward workarounds
                  or generic templates.
                </p>
              </div>
              <div className="mp-card mp-card-elevated">
                <h3>Replace 6+ Tools With One</h3>
                <p>
                  Stop paying for separate case management, billing, document storage,
                  client portals, time tracking, and reporting tools. StatutePro unifies
                  them all.
                </p>
              </div>
              <div className="mp-card mp-card-elevated">
                <h3>Scales With Your Practice</h3>
                <p>
                  Whether you&apos;re a solo practitioner or a 50-attorney firm, StatutePro
                  grows with you. Add users, practice areas, and advanced features as
                  your firm evolves.
                </p>
              </div>
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
                StatutePro transformed how we operate. We cut our billing cycle from 45 days
                to 12 days, and our clients love the transparency of the portal. It&apos;s the
                single best investment we&apos;ve made in our practice.
              </div>
              <div className="mp-testimonial-author">Sarah Chen, Managing Partner</div>
              <div className="mp-testimonial-role">Chen & Associates — Litigation, 18 attorneys</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mp-cta">
        <Reveal>
          <h2 className="mp-cta-title">
            Ready to run your firm on one platform?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            Join thousands of legal professionals who&apos;ve eliminated tool sprawl,
            accelerated collections, and gained complete operational visibility with StatutePro.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-white">
              Book a Free Demo <FiArrowRight />
            </Link>
            <Link href="/pricing" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              See Pricing Plans
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
