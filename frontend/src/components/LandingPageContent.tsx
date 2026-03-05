'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  FiBriefcase, FiDollarSign, FiShield, FiClock, FiUsers, 
  FiFileText, FiTrendingUp, FiCheckCircle, FiZap 
} from 'react-icons/fi';
import './LandingPage.css';

const features = [
  {
    icon: <FiBriefcase />,
    title: 'Matter Management',
    description: 'Track cases, clients, and deadlines with intelligent workflows that adapt to your practice area.',
    gradient: 'linear-gradient(135deg, #2f6ef2 0%, #16a34a 100%)',
  },
  {
    icon: <FiDollarSign />,
    title: 'Legal Billing',
    description: 'Time tracking, invoicing, and trust accounting with real-time revenue analytics.',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #d97706 100%)',
  },
  {
    icon: <FiShield />,
    title: 'Security & Compliance',
    description: 'Role-based access, audit logs, and encryption ensure your firm stays protected.',
    gradient: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
  },
  {
    icon: <FiUsers />,
    title: 'Client Portal',
    description: 'Secure client collaboration with document sharing and real-time updates.',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #2f6ef2 100%)',
  },
  {
    icon: <FiTrendingUp />,
    title: 'Analytics',
    description: 'Firm performance metrics, utilization rates, and revenue forecasting.',
    gradient: 'linear-gradient(135deg, #2f6ef2 0%, #8b5cf6 100%)',
  },
  {
    icon: <FiZap />,
    title: 'AI Assistance',
    description: 'Built-in AI for document drafting, email generation, and billing descriptions.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #16a34a 100%)',
  },
];

const stats = [
  { value: '10+', label: 'Practice Areas', icon: <FiBriefcase /> },
  { value: '99.9%', label: 'Uptime SLA', icon: <FiCheckCircle /> },
  { value: '< 100ms', label: 'Response Time', icon: <FiClock /> },
  { value: 'SOC 2', label: 'Compliant', icon: <FiShield /> },
];

export default function LandingPageContent() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="landing-page">
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-bg-pattern"></div>
        <motion.div 
          className="hero-content"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <motion.span 
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Legal Practice Management Software
          </motion.span>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Run your entire law firm{' '}
            <span className="gradient-text">in one platform</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Case management, legal billing, trust accounting, client portal, and analytics—unified 
            for modern legal teams who demand speed, security, and profitability.
          </motion.p>
          
          <motion.div 
            className="hero-ctas"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/demo" className="btn-primary">
              Book a Demo
            </Link>
            <Link href="/login" className="btn-ghost">
              Sign In
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="stats-grid"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Creative Layout */}
      <section className="features-section">
        <div className="section-header">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Everything your firm needs to{' '}
            <span className="gradient-text">operate at scale</span>
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Built from the ground up for legal professionals who need more than just case tracking.
          </motion.p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon-wrapper" style={{ background: feature.gradient }}>
                <div className="feature-icon">{feature.icon}</div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Split Section - 2 Column */}
      <section className="split-section">
        <div className="split-content">
          <motion.div 
            className="split-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="split-title">
              Built for <span className="gradient-text">productivity</span>
            </h2>
            <p className="split-description">
              Competitor research across MyCase, PracticePanther, Actionstep, LEAP, and Filevine 
              shows firms prioritize end-to-end workflows, secure client collaboration, and accurate legal billing.
            </p>
            <ul className="split-list">
              <li><FiCheckCircle /> Unified matter and client management</li>
              <li><FiCheckCircle /> Time tracking with smart invoice generation</li>
              <li><FiCheckCircle /> Trust accounting with full audit trail</li>
              <li><FiCheckCircle /> Role-based permissions and security</li>
              <li><FiCheckCircle /> Real-time firm performance analytics</li>
            </ul>
            <Link href="/features" className="btn-primary">
              Explore All Features
            </Link>
          </motion.div>
          
          <motion.div 
            className="split-visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="visual-placeholder">
              <div className="visual-grid"></div>
              <div className="visual-accent"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Radial Gradient */}
      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="cta-title">Ready to modernize your practice?</h2>
          <p className="cta-subtitle">
            Join forward-thinking law firms using StatutePro to streamline operations and grow revenue.
          </p>
          <div className="cta-buttons">
            <Link href="/demo" className="btn-primary-large">
              Schedule a Demo
            </Link>
            <Link href="/pricing" className="btn-ghost-large">
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
