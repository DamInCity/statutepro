'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiStar } from 'react-icons/fi';
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

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/user/month',
    description: 'Everything a solo practitioner or small team needs to get organized, bill accurately, and serve clients better.',
    features: [
      'Up to 5 users',
      'Case & matter management',
      'Time tracking & expense logging',
      'Invoice generation & online payments',
      'Client records & contact management',
      'Basic document storage (10 GB)',
      'Email support',
    ],
    cta: 'Start Free Trial',
    featured: false,
  },
  {
    name: 'Professional',
    price: '$89',
    period: '/user/month',
    description: 'Advanced billing, trust accounting, client portal, and analytics for growing firms that need operational control.',
    features: [
      'Everything in Starter, plus:',
      'Unlimited users',
      'Trust & IOLTA accounting',
      'Client portal with branded access',
      'Document automation & templates',
      'Analytics & reporting dashboards',
      'Workflow automation',
      'Calendar sync (Outlook & Google)',
      'Storage (50 GB)',
      'Priority email & chat support',
    ],
    cta: 'Start Free Trial',
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Advanced governance, custom integrations, dedicated onboarding, and white-glove support for firms that demand the highest standards.',
    features: [
      'Everything in Professional, plus:',
      'Custom integrations (API access)',
      'Advanced RBAC & permission sets',
      'Multi-office organizational hierarchy',
      'Custom KPI dashboards',
      'AI-powered legal workflows',
      'Dedicated success manager',
      'Custom onboarding & data migration',
      'SLA-backed uptime guarantee',
      'Unlimited storage',
      'Phone, email & priority support',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

const comparisonFeatures = [
  { name: 'Matter Management', starter: true, professional: true, enterprise: true },
  { name: 'Time Tracking', starter: true, professional: true, enterprise: true },
  { name: 'Invoice Generation', starter: true, professional: true, enterprise: true },
  { name: 'Online Payments', starter: true, professional: true, enterprise: true },
  { name: 'Trust / IOLTA Accounting', starter: false, professional: true, enterprise: true },
  { name: 'Client Portal', starter: false, professional: true, enterprise: true },
  { name: 'Document Automation', starter: false, professional: true, enterprise: true },
  { name: 'Workflow Automation', starter: false, professional: true, enterprise: true },
  { name: 'Analytics & Dashboards', starter: false, professional: true, enterprise: true },
  { name: 'Calendar Integrations', starter: false, professional: true, enterprise: true },
  { name: 'AI Legal Workflows', starter: false, professional: false, enterprise: true },
  { name: 'Custom API Integrations', starter: false, professional: false, enterprise: true },
  { name: 'Multi-Office Hierarchy', starter: false, professional: false, enterprise: true },
  { name: 'Custom KPI Dashboards', starter: false, professional: false, enterprise: true },
  { name: 'Dedicated Success Manager', starter: false, professional: false, enterprise: true },
];

const faqs = [
  {
    q: 'Is there a free trial?',
    a: 'Yes. Every plan includes a 14-day free trial with full access to all features in that tier. No credit card required to start.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Absolutely. You can change plans at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle. Your data is always preserved.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes. Annual plans include a 20% discount compared to monthly billing. Contact our sales team for custom multi-year agreements for larger firms.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'You retain full access to your data for 30 days after cancellation. We provide complete data export tools so you can download all matters, documents, financial records, and client data in standard formats.',
  },
  {
    q: 'Is trust accounting compliant with my state bar requirements?',
    a: 'StatutePro\'s trust accounting module is designed to support IOLTA compliance across all U.S. jurisdictions. It includes three-way reconciliation, matter-level ledgers, and audit-ready reporting. We recommend consulting your state bar for jurisdiction-specific requirements.',
  },
  {
    q: 'Do you help with data migration from other platforms?',
    a: 'Yes. Professional and Enterprise plans include assisted data migration. Our onboarding team will help you transfer matters, client records, financial data, and documents from platforms like Clio, PracticePanther, MyCase, and others.',
  },
];

export default function PricingContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker">Transparent Pricing</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title">
            Simple, predictable pricing.{' '}
            <span className="mp-gradient-text">No hidden fees.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle">
            Choose the plan that matches your firm&apos;s current needs and scale seamlessly
            as you grow. Every plan includes a 14-day free trial — no credit card required.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mp-badge-row">
            <span className="mp-badge">✓ 14-Day Free Trial</span>
            <span className="mp-badge">✓ No Credit Card Required</span>
            <span className="mp-badge">✓ Cancel Anytime</span>
            <span className="mp-badge">✓ 20% Off Annual Plans</span>
          </div>
        </Reveal>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="mp-section">
        <div className="mp-container">
          <div className="mp-grid-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <div className={`mp-pricing-card ${plan.featured ? 'mp-pricing-featured' : ''}`}>
                  {plan.badge && <div className="mp-pricing-badge">{plan.badge}</div>}
                  <div className="mp-pricing-name">{plan.name}</div>
                  <div className="mp-pricing-price">
                    {plan.price}
                    {plan.period && <span>{plan.period}</span>}
                  </div>
                  <div className="mp-pricing-desc">{plan.description}</div>
                  <ul className="mp-pricing-features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/register'}
                    className={plan.featured ? 'mp-btn-primary' : 'mp-btn-ghost'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {plan.cta} <FiArrowRight />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Detailed feature comparison</h2>
            <p className="mp-section-lead">
              See exactly what&apos;s included in each plan so you can make the right choice for your firm.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ overflowX: 'auto' }}>
              <table className="mp-comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th style={{ textAlign: 'center' }}>Starter</th>
                    <th style={{ textAlign: 'center' }}>Professional</th>
                    <th style={{ textAlign: 'center' }}>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        {row.starter ? <span className="mp-check">✓</span> : <span className="mp-dash">—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {row.professional ? <span className="mp-check">✓</span> : <span className="mp-dash">—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {row.enterprise ? <span className="mp-check">✓</span> : <span className="mp-dash">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Social Proof Stats ── */}
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <div className="mp-stats-bar">
              <div className="mp-stat">
                <div className="mp-stat-value">14 Days</div>
                <div className="mp-stat-label">Free Trial, No Risk</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">4.8<FiStar style={{ fontSize: '1.5rem' }} /></div>
                <div className="mp-stat-label">Average Customer Rating</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">96%</div>
                <div className="mp-stat-label">Client Retention Rate</div>
              </div>
              <div className="mp-stat">
                <div className="mp-stat-value">&lt; 2hr</div>
                <div className="mp-stat-label">Average Support Response</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Frequently asked questions</h2>
            <p className="mp-section-lead">
              Have questions about pricing, plans, or getting started? Here are the answers
              our customers ask most.
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
          <h2 className="mp-cta-title">Start your free trial today</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            No credit card required. Set up your firm in under 5 minutes and
            experience the full power of StatutePro risk-free for 14 days.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/register" className="mp-btn-white">
              Start Free Trial <FiArrowRight />
            </Link>
            <Link href="/demo" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Book a Demo Instead
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
