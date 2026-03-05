'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiGrid, FiChevronRight, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
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

// Configure pdf.js worker - use local worker file from public directory
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const TOOL_SLUG = 'pdf-merger';

interface FaqItem {
  question: string;
  answer: string;
}

export default function PdfMergerClient({ faqs }: { faqs: FaqItem[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [working, setWorking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [remaining, setRemaining] = useState(remainingUses(TOOL_SLUG));

  const authed = isAuthenticated();

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setWorking(true);
    setSuccess(false);
    setError('');

    if (!authed && isLimitReached(TOOL_SLUG)) {
      setShowGate(true);
      setWorking(false);
      return;
    }

    try {
      const mergedPdf = new jsPDF('p', 'pt', 'letter');
      let isFirstPage = true;

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas context not available');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          } as any).promise;

          // Convert canvas to image
          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          // Add to merged PDF
          if (!isFirstPage) {
            mergedPdf.addPage();
          }
          isFirstPage = false;

          const pageWidth = mergedPdf.internal.pageSize.getWidth();
          const pageHeight = mergedPdf.internal.pageSize.getHeight();
          
          mergedPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
        }
      }

      mergedPdf.save('merged-document.pdf');
      setSuccess(true);

      const newCount = incrementUseCount(TOOL_SLUG);
      setRemaining(remainingUses(TOOL_SLUG));

      if (!authed && newCount >= 3) {
        setTimeout(() => setShowGate(true), 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed');
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
        <span>PDF Merger</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiGrid size={24} />
        </div>
        <h1 className={styles.toolTitle}>PDF Merger Tool</h1>
        <p className={styles.toolDesc}>
          Merge multiple PDF files into a single document instantly. Perfect for combining legal
          exhibits, discovery documents, contracts, and court filings. Works entirely in your
          browser – no upload required.
        </p>
      </header>

      <section>
        <ToolDropzone
          accept=".pdf"
          multiple
          files={files}
          onFiles={setFiles}
          hint="Select 2 or more PDF files — they will be merged in order"
        />

        <div className={styles.actionBar}>
          <button
            type="button"
            className={styles.convertBtn}
            onClick={handleMerge}
            disabled={files.length < 2 || working}
          >
            {working ? (
              <>
                <span className={styles.spinner} />
                Merging {files.length} PDFs...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Merge {files.length} {files.length === 1 ? 'PDF' : 'PDFs'}
              </>
            )}
          </button>
          {files.length > 0 && (
            <button type="button" className={styles.clearBtn} onClick={handleClear}>
              Clear all
            </button>
          )}
        </div>

        {success && (
          <div className={`${styles.statusRow} ${styles.success}`}>
            <FiCheck size={16} />
            <span>Merged PDF downloaded successfully!</span>
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
            <h3>1. Select PDFs</h3>
            <p>Choose 2 or more PDF files from your device. Order matters — they'll merge in sequence.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>2. Auto-merge</h3>
            <p>Click Merge and all pages from all PDFs are combined into a single document.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>3. Download</h3>
            <p>Your merged PDF is generated in your browser and downloads automatically.</p>
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

      {showGate && <UsageGateModal toolName="PDF Merger" onDismiss={() => setShowGate(false)} />}
    </div>
  );
}
