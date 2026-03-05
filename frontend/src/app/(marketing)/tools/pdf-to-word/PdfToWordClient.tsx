'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiFile, FiChevronRight, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import ToolDropzone from '@/components/tools/ToolDropzone';
import UsageGateModal from '@/components/tools/UsageGateModal';
import {
  incrementUseCount,
  isLimitReached,
  isAuthenticated,
  remainingUses,
} from '@/lib/tools/usage-guard';
import styles from '@/components/tools/Tools.module.css';

// Configure pdf.js worker - use local worker file from public directory
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const TOOL_SLUG = 'pdf-to-word';

interface FaqItem {
  question: string;
  answer: string;
}

export default function PdfToWordClient({ faqs }: { faqs: FaqItem[] }) {
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

      // Load PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const textParts: string[] = [];

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        textParts.push(pageText);
      }

      const allText = textParts.join('\n\n');

      if (!allText || allText.trim().length === 0) {
        throw new Error('No text found in PDF (may be scanned/image-based)');
      }

      // Create DOCX document
      const paragraphs = allText.split(/\n+/).map(
        (para) =>
          new Paragraph({
            children: [new TextRun(para.trim())],
            spacing: { after: 200 },
          }),
      );

      const doc = new Document({
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      const outputName = file.name.replace(/\.pdf$/i, '') + '.docx';

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputName;
      a.click();
      URL.revokeObjectURL(url);

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
        <span>PDF to Word</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiFile size={24} />
        </div>
        <h1 className={styles.toolTitle}>PDF to Word Converter</h1>
        <p className={styles.toolDesc}>
          Convert text-based PDF files to editable Microsoft Word (.docx) format instantly. Ideal
          for editing contracts, agreements, and legal documents. Works entirely in your browser –
          no upload required.
        </p>
      </header>

      <section>
        <ToolDropzone
          accept=".pdf"
          multiple={false}
          files={files}
          onFiles={setFiles}
          hint="Text-based PDFs only (not scanned images)"
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
                Convert to Word
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
            <span>Word document downloaded successfully!</span>
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
            <h3>1. Upload PDF</h3>
            <p>Select your text-based PDF file (scanned/image PDFs not supported).</p>
          </div>
          <div className={styles.infoCard}>
            <h3>2. Auto-extract</h3>
            <p>Text is extracted from the PDF and converted to Word format in your browser.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>3. Download DOCX</h3>
            <p>Your editable Word document is generated locally and downloads automatically.</p>
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

      {showGate && <UsageGateModal toolName="PDF to Word" onDismiss={() => setShowGate(false)} />}
    </div>
  );
}
