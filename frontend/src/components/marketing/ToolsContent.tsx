'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiImage, FiFileText, FiFile, FiLayers, FiMinimize2,
  FiType, FiCalendar, FiArrowRight, FiZap
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

const tools = [
  {
    icon: <FiImage />,
    iconClass: '',
    title: 'Image to PDF Converter',
    description: 'Convert photos of documents, evidence, client records, and exhibits into professional PDF files. Perfect for digitizing physical case files or preparing exhibit binders.',
    useCase: 'Digitize physical evidence photos, signed documents, and handwritten notes into case-ready PDFs.',
    href: '/tools/image-to-pdf',
  },
  {
    icon: <FiFileText />,
    iconClass: 'mp-feature-icon-purple',
    title: 'Word to PDF Converter',
    description: 'Convert Word documents to PDF with perfect formatting preservation. Ideal for finalizing contracts, briefs, pleadings, and client correspondence before filing or sharing.',
    useCase: 'Finalize legal briefs, contracts, and correspondence into universally readable PDF format.',
    href: '/tools/word-to-pdf',
  },
  {
    icon: <FiFile />,
    iconClass: 'mp-feature-icon-teal',
    title: 'PDF to Word Converter',
    description: 'Need to edit a received PDF? Convert it to an editable Word document while preserving formatting. Essential for revising opposing counsel documents, court forms, and templates.',
    useCase: 'Edit received contracts, court forms, and opposing counsel documents without retyping.',
    href: '/tools/pdf-to-word',
  },
  {
    icon: <FiLayers />,
    iconClass: 'mp-feature-icon-amber',
    title: 'PDF Merger',
    description: 'Combine multiple PDFs into a single document with drag-and-drop reordering. Perfect for assembling exhibit packets, discovery bundles, and filing packages.',
    useCase: 'Assemble exhibit binders, discovery packages, and multi-document court filings.',
    href: '/tools/pdf-merger',
  },
  {
    icon: <FiMinimize2 />,
    iconClass: 'mp-feature-icon-rose',
    title: 'PDF Compressor',
    description: 'Reduce PDF file sizes without sacrificing readability. Many courts impose file size limits for electronic filings — compress your documents to meet requirements.',
    useCase: 'Meet court e-filing size limits and reduce email attachment sizes for client documents.',
    href: '/tools/pdf-compressor',
  },
  {
    icon: <FiType />,
    iconClass: 'mp-feature-icon-green',
    title: 'Word & Character Counter',
    description: 'Check word counts, character counts, sentence counts, and reading time for legal documents. Essential for court filings with strict word or page limits.',
    useCase: 'Verify compliance with court-imposed word limits on briefs, motions, and memoranda.',
    href: '/tools/word-count',
  },
  {
    icon: <FiCalendar />,
    iconClass: 'mp-feature-icon-purple',
    title: 'Court Date Calculator',
    description: 'Calculate deadlines based on filing dates, court rules, and jurisdiction-specific requirements. Account for weekends, holidays, and service-by-mail extensions automatically.',
    useCase: 'Never miss a filing deadline — calculate response dates, discovery deadlines, and court appearances.',
    href: '/tools/court-date-calculator',
  },
];

export default function ToolsContent() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="mp-hero mp-hero-pattern">
        <Reveal>
          <span className="mp-kicker">Free Legal Tools</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mp-hero-title">
            Free tools built for{' '}
            <span className="mp-gradient-text">legal professionals</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mp-hero-subtitle">
            Powerful document conversion, compression, and calculation tools designed
            specifically for attorneys, paralegals, and legal support staff. No sign-up
            required — use them right now, completely free.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mp-badge-row">
            <span className="mp-badge"><FiZap /> 100% Free</span>
            <span className="mp-badge">🔒 Files Processed Locally</span>
            <span className="mp-badge">✓ No Account Required</span>
          </div>
        </Reveal>
      </section>

      {/* ── Tools Grid ── */}
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">7 essential tools for every legal professional</h2>
            <p className="mp-section-lead">
              From document conversion to deadline calculation, these tools solve the everyday
              problems legal professionals face — without the overhead of installing software.
            </p>
          </Reveal>
          <div className="mp-grid-3" style={{ marginTop: '1rem' }}>
            {tools.slice(0, 6).map((tool, i) => (
              <Reveal key={tool.title} delay={i * 0.08}>
                <div className="mp-feature-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className={`mp-feature-icon ${tool.iconClass}`}>
                    {tool.icon}
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    💡 {tool.useCase}
                  </p>
                  <div style={{ marginTop: 'auto' }}>
                    <Link href={tool.href} className="mp-feature-link">
                      Use this tool <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {/* 7th tool full-width */}
          <Reveal delay={0.1}>
            <div className="mp-split" style={{ marginTop: '2rem' }}>
              <div className="mp-split-text">
                <div className={`mp-feature-icon ${tools[6].iconClass}`}>
                  {tools[6].icon}
                </div>
                <h2>{tools[6].title}</h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                  {tools[6].description}
                </p>
                <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  💡 {tools[6].useCase}
                </p>
                <div style={{ marginTop: '1.5rem' }}>
                  <Link href={tools[6].href} className="mp-btn-primary">
                    Open Court Date Calculator <FiArrowRight />
                  </Link>
                </div>
              </div>
              <div className="mp-split-visual">
                <div className="mp-split-visual-inner">
                  <FiCalendar />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why Free? ── */}
      <section className="mp-section mp-section-alt">
        <div className="mp-container">
          <Reveal>
            <h2 className="mp-section-title">Why are these tools free?</h2>
            <p className="mp-section-lead">
              We believe every legal professional deserves access to essential productivity tools,
              regardless of their firm&apos;s budget. These tools showcase the quality and
              attention to detail you&apos;ll find throughout the full StatutePro platform.
            </p>
          </Reveal>
          <div className="mp-grid-3">
            {[
              { title: 'No Sign-Up Required', desc: 'Use any tool instantly without creating an account. Your workflow shouldn\'t be interrupted by registration walls.' },
              { title: 'Privacy First', desc: 'Documents are processed in your browser whenever possible. We don\'t store, read, or retain your files on our servers.' },
              { title: 'Built for Legal', desc: 'Unlike generic converters, our tools are designed with legal use cases in mind — court filing limits, exhibit formatting, and deadline rules.' },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="mp-card mp-card-elevated">
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
          <h2 className="mp-cta-title">Like these tools? See the full platform.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mp-cta-text">
            These free tools are just the beginning. StatutePro includes complete case management,
            automated billing, trust accounting, client portal, and firm analytics — all in one platform.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mp-cta-group">
            <Link href="/demo" className="mp-btn-white">
              Book a Free Demo <FiArrowRight />
            </Link>
            <Link href="/features" className="mp-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Explore All Features
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
