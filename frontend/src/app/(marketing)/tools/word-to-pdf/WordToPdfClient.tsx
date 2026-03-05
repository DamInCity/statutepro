'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiFileText, FiChevronRight, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import ToolDropzone from '@/components/tools/ToolDropzone';
import UsageGateModal from '@/components/tools/UsageGateModal';
import {
  incrementUseCount,
  isLimitReached,
  isAuthenticated,
  remainingUses,
} from '@/lib/tools/usage-guard';
import styles from '@/components/tools/Tools.module.css';

const TOOL_SLUG = 'word-to-pdf';

interface FaqItem {
  question: string;
  answer: string;
}

export default function WordToPdfClient({ faqs }: { faqs: FaqItem[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [working, setWorking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [remaining, setRemaining] = useState(remainingUses(TOOL_SLUG));

  const authed = isAuthenticated();

  const handleConvert = async () => {
    if (files.length === 0) return;

    setWorking(true);
    setSuccess(false);
    setError('');

    if (!authed && isLimitReached(TOOL_SLUG)) {
      setShowGate(true);
      setWorking(false);
      return;
    }

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Extract text via mammoth
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text: string = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('No text found in document');
      }

      // Create PDF with jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const maxLineWidth = pageWidth - 2 * margin;
      const lineHeight = 6;
      const fontSize = 11;

      pdf.setFontSize(fontSize);

      // Split text into lines and paragraphs
      const paragraphs = text.split(/\n+/);
      let y = margin;

      for (const para of paragraphs) {
        if (!para.trim()) continue;

        const lines = pdf.splitTextToSize(para, maxLineWidth);
        for (const line of lines) {
          if (y + lineHeight > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += lineHeight;
        }
        y += lineHeight * 0.3; // paragraph spacing
      }

      const outputName = file.name.replace(/\.docx?$/i, '') + '.pdf';
      pdf.save(outputName);
      setSuccess(true);

      const newCount = incrementUseCount(TOOL_SLUG);
      setRemaining(remainingUses(TOOL_SLUG));

      if (!authed && newCount >= 3) {
        setTimeout(() => setShowGate(true), 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setWorking(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setSuccess(false);
    setError('');
  };

  return (
    <div className={styles.toolPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FiChevronRight size={13} />
        <Link href="/tools">Legal Tools</Link>
        <FiChevronRight size={13} />
        <span>Word to PDF</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiFileText size={24} />
        </div>
        <h1 className={styles.toolTitle}>Word to PDF Converter</h1>
        <p className={styles.toolDesc}>
          Convert Microsoft Word (.docx) files to PDF format instantly. Ideal for contracts, legal
          briefs, motions, and court filings. Works entirely in your browser – no upload required.
        </p>
      </header>

      <section>
        <ToolDropzone
          accept=".docx"
          multiple={false}
          files={files}
          onFiles={setFiles}
          hint="Only .docx files (Word 2007+)"
        />

        <div className={styles.actionBar}>
          <button
            type="button"
            className={styles.convertBtn}
            onClick={handleConvert}
            disabled={files.length === 0 || working}
          >
            {working ? (
              <>
                <span className={styles.spinner} />
                Converting...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Convert to PDF
              </>
            )}
          </button>
          {files.length > 0 && (
            <button type="button" className={styles.clearBtn} onClick={handleClear}>
              Clear
            </button>
          )}
        </div>

        {success && (
          <div className={`${styles.statusRow} ${styles.success}`}>
            <FiCheck size={16} />
            <span>PDF downloaded successfully!</span>
          </div>
        )}
        {error && (
          <div className={`${styles.statusRow} ${styles.error}`}>
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>1. Upload DOCX</h3>
            <p>Select your Microsoft Word document (.docx format only).</p>
          </div>
          <div className={styles.infoCard}>
            <h3>2. Auto-convert</h3>
            <p>Text and basic formatting are extracted and rendered as PDF in your browser.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>3. Download PDF</h3>
            <p>Your PDF is generated locally and automatically downloads — no server upload.</p>
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

      {showGate && <UsageGateModal toolName="Word to PDF" onDismiss={() => setShowGate(false)} />}
    </div>
  );
}
