'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUser, FiUsers, FiGlobe, FiArrowRight, FiCheck,
  FiBriefcase, FiTrendingUp, FiShield
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

const segments = [
  {
    icon: <FiUser size={32} />,
    name: 'Solo Practitioners',
    tagline: 'Run your entire practice from one screen',
    description:
      'You didn\'t go to law school to become an office manager. StatutePro handles the operational overhead — case tracking, billing, trust accounting, and client communication — so you can focus on practicing law. Get the capabilities of a large-firm tech stack without the large-firm price tag.',
    challenges: [
      'Juggling cases, billing, and admin with no support staff',
      'Losing revenue to unbilled time and manual invoicing',
      'Clients expecting 24/7 updates via email and phone',
      'Managing trust funds without dedicated accounting help',
    ],
    solutions: [
      'Unified dashboard with all active matters, deadlines, and financials',
      'One-click time tracking and automated invoice generation',
      'Self-service client portal eliminates status-update calls',
      'Built-in IOLTA trust accounting with automatic reconciliation',
    ],
    href: '/solutions/solo-law-firms',
    stat: '72%',
    statLabel: 'of solo attorneys report spending 40%+ of their time on non-billable work',
  },
  {
    icon: <FiUsers size={32} />,
    name: 'Small Law Firms (2–15 Attorneys)',
    tagline: 'Standardize operations, scale with confidence',
    description:
      'Growing firms need consistent processes to avoid the chaos that comes with adding attorneys, practice areas, and clients. StatutePro provides the operational infrastructure to standardize workflows, enforce billing discipline, and give partners real-time visibility into firm performance.',
    challenges: [
      'Inconsistent processes across attorneys and staff',
      'No visibility into firm-wide profitability or utilization',
      'Trust accounting compliance becoming more complex',
      'Client experience varies by who\'s handling the case',
    ],
    solutions: [
      'Customizable workflow templates ensure consistency across matters',
      'Real-time dashboards for revenue, utilization, and collections',
      'Centralized trust accounting with role-based access controls',
      'Branded client portal with standardized communication workflows',
    ],
    href: '/solutions/small-law-firms',
    stat: '3.2x',
    statLabel: 'average ROI for small firms in the first year on StatutePro',
  },
  {
    icon: <FiGlobe size={32} />,
    name: 'Mid-Size Firms (15–100+ Attorneys)',
    tagline: 'Enterprise control without enterprise complexity',
    description:
      'Mid-size firms need sophisticated governance, cross-office collaboration, and integration-ready infrastructure — without the 18-month implementation cycles of legacy enterprise software. StatutePro delivers advanced controls and analytics that scale with your growth trajectory.',
    challenges: [
      'Multi-office coordination and standardization',
      'Complex reporting needs across practice groups',
      'Integration requirements with existing firm systems',
      'Compliance and governance at increasing scale',
    ],
    solutions: [
      'Multi-office, multi-practice-area organizational hierarchy',
      'Advanced analytics with custom KPI dashboards per practice group',
      'Open API and native integrations with Microsoft 365, accounting, and more',
      'Granular RBAC, audit logging, and compliance reporting',
    ],
    href: '/solutions/mid-size-law-firms',
    stat: '45%',
    statLabel: 'reduction in billing cycle time for mid-size firms on StatutePro',
  },
];

export default function SolutionsContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker">Solutions by Firm Size</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title">
            Legal practice management{' '}
            <span className="mp-gradient-text">built for how you work</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle">
            Every law firm is different. Whether you&apos;re a solo practitioner handling 30
            active cases or a mid-size firm managing thousands of matters across multiple offices,
            StatutePro adapts to your operational reality — not the other way around.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-primary">
              Find Your Solution <FiArrowRight />
            </Link>
            <Link href="/pricing" className="mp-btn-ghost">
              Compare Plans
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Firm Segments Deep Dives ── */}
      {segments.map((segment, i) => (
        <section
          key={segment.name}
          className={`mp-section ${i % 2 !== 0 ? 'mp-section-alt' : ''}`}
        >
          <div className="mp-container">
            {/* Header */}
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div className="mp-feature-icon" style={{ margin: '0 auto 1rem' }}>
                  {segment.icon}
                </div>
                <h2 className="mp-section-title">{segment.name}</h2>
                <p className="mp-section-lead" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text, #101828)' }}>
                  {segment.tagline}
                </p>
                <p className="mp-section-lead">{segment.description}</p>
              </div>
            </Reveal>

            {/* Challenges vs Solutions */}
            <div className="mp-grid-2">
              <Reveal>
                <div className="mp-card mp-card-elevated">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1.25rem' }}>
                    ⚠ The Challenges
                  </h3>
                  <ul className="mp-check-list" style={{ listStyle: 'none', padding: 0 }}>
                    {segment.challenges.map((c) => (
                      <li key={c} style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text, #101828)' }}>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mp-card mp-card-elevated" style={{ borderColor: 'var(--accent, #2f6ef2)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1.25rem' }}>
                    <FiCheck /> The StatutePro Solution
                  </h3>
                  <ul className="mp-check-list">
                    {segment.solutions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* Stat + CTA */}
            <Reveal delay={0.15}>
              <div className="mp-highlight" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="mp-stat-value">{segment.stat}</div>
                  <div className="mp-stat-label" style={{ maxWidth: 200 }}>{segment.statLabel}</div>
                </div>
                <Link href={segment.href} className="mp-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Explore {segment.name.split(' (')[0]} Solution <FiArrowRight />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* ── What Every Firm Gets ── */}
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">What every StatutePro firm gets</h2>
            <p className="mp-section-lead">
              Regardless of your firm size, every plan includes the core operational
              infrastructure modern law firms need to thrive.
            </p>
          </Reveal>
          <div className="mp-grid-3">
            {[
              { icon: <FiBriefcase />, title: 'Complete Matter Management', desc: 'Track every case from intake through resolution with customizable workflows, deadline tracking, and team collaboration.' },
              { icon: <FiTrendingUp />, title: 'Financial Visibility', desc: 'Real-time dashboards for revenue, collections, trust balances, and profitability across every practice area.' },
              { icon: <FiShield />, title: 'Enterprise-Grade Security', desc: '256-bit encryption, role-based access, audit logging, and SOC 2 compliance keep your data protected.' },
            ].map((item, j) => (
              <Reveal key={item.title} delay={j * 0.1}>
                <div className="mp-feature-card">
                  <div className="mp-feature-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mp-cta">
        <Reveal>
          <h2 className="mp-cta-title">Not sure which plan fits your firm?</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            Talk to our legal technology specialists. We&apos;ll map your current workflows and
            recommend the right configuration for your practice areas, team size, and growth goals.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-white">
              Book a Free Consultation <FiArrowRight />
            </Link>
            <Link href="/pricing" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Compare Pricing
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
