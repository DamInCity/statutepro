'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit3, FiChevronRight, FiUpload } from 'react-icons/fi';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import styles from '@/components/tools/Tools.module.css';

// Configure pdf.js worker - use local worker file from public directory
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface FaqItem {
  question: string;
  answer: string;
}

interface Stats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
  pages: number;
  readingTime: number;
}

export default function WordCountClient({ faqs }: { faqs: FaqItem[] }) {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    sentences: 0,
    pages: 0,
    readingTime: 0,
  });

  const calculateStats = (content: string) => {
    if (!content.trim()) {
      setStats({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        sentences: 0,
        pages: 0,
        readingTime: 0,
      });
      return;
    }

    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const pages = Math.ceil(words / 250); // Standard: 250 words per page
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 wpm

    setStats({
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      sentences,
      pages,
      readingTime,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    calculateStats(newText);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let extractedText = '';

      if (file.name.endsWith('.txt')) {
        extractedText = await file.text();
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const textParts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          textParts.push(pageText);
        }

        extractedText = textParts.join('\n\n');
      }

      setText(extractedText);
      calculateStats(extractedText);
    } catch (err) {
      alert('Failed to read file: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleClear = () => {
    setText('');
    calculateStats('');
  };

  return (
    <div className={styles.toolPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FiChevronRight size={13} />
        <Link href="/tools">Legal Tools</Link>
        <FiChevronRight size={13} />
        <span>Word Count</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiEdit3 size={24} />
        </div>
        <h1 className={styles.toolTitle}>Word Count Tool</h1>
        <p className={styles.toolDesc}>
          Count words, characters, paragraphs, sentences, and estimate pages in legal documents.
          Perfect for ensuring compliance with court filing word limits. Paste text or upload TXT,
          DOCX, or PDF files.
        </p>
      </header>

      <section>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label
            htmlFor="fileUpload"
            className={styles.ghostBtn}
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiUpload size={14} />
            Upload Document
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".txt,.docx,.pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          {text && (
            <button type="button" className={styles.clearBtn} onClick={handleClear}>
              Clear
            </button>
          )}
        </div>

        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Paste or type your legal document here, or upload a TXT, DOCX, or PDF file above..."
          style={{
            width: '100%',
            minHeight: '280px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            background: 'var(--surface)',
            color: 'var(--text)',
            resize: 'vertical',
          }}
          aria-label="Document text input"
        />

        <div
          style={{
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.9rem',
          }}
        >
          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.words.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Words</p>
          </div>

          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.characters.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Characters</p>
          </div>

          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.charactersNoSpaces.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Chars (no spaces)</p>
          </div>

          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.paragraphs.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Paragraphs</p>
          </div>

          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.sentences.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sentences</p>
          </div>

          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.pages.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Pages (est.)</p>
          </div>

          <div className={styles.infoCard}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.3rem' }}>
              {stats.readingTime.toLocaleString()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Min. to read</p>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>1. Add text</h3>
            <p>Paste directly, type, or upload a TXT, DOCX, or PDF file.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>2. Live stats</h3>
            <p>See real-time word, character, paragraph, and page counts as you type or edit.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>3. Check compliance</h3>
            <p>Verify your document meets court word limits and formatting requirements.</p>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <dl className={styles.faqList}>
          {faqs.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <dt>{faq.question}</dt>
              <dd>{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
