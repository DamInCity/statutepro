'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiImage, FiChevronRight, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';
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

const TOOL_SLUG = 'image-to-pdf';

interface FaqItem {
  question: string;
  answer: string;
}

export default function ImageToPdfClient({ faqs }: { faqs: FaqItem[] }) {
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

    // Check limit before converting (if not authed)
    if (!authed && isLimitReached(TOOL_SLUG)) {
      setShowGate(true);
      setWorking(false);
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imgData = await readImageAsDataURL(file);

        // Load image to get dimensions
        const img = await loadImageElement(imgData);
        const imgWidth = img.width;
        const imgHeight = img.height;

        // Scale to fit page with margins
        const ratio = Math.min(
          (pageWidth - 2 * margin) / imgWidth,
          (pageHeight - 2 * margin) / imgHeight,
        );
        const scaledW = imgWidth * ratio;
        const scaledH = imgHeight * ratio;

        // Center on page
        const x = (pageWidth - scaledW) / 2;
        const y = (pageHeight - scaledH) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', x, y, scaledW, scaledH);
      }

      pdf.save('converted-images.pdf');
      setSuccess(true);

      // Increment usage count
      const newCount = incrementUseCount(TOOL_SLUG);
      setRemaining(remainingUses(TOOL_SLUG));

      // After 3, show gate (but still allow the download)
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
        <span>Image to PDF</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiImage size={24} />
        </div>
        <h1 className={styles.toolTitle}>Image to PDF Converter</h1>
        <p className={styles.toolDesc}>
          Instantly convert JPG, PNG, WebP and other image formats into a single PDF. Perfect for
          legal exhibits, court filings, and organized document submissions. Works entirely in your
          browser – nothing is uploaded.
        </p>
      </header>

      <section>
        <ToolDropzone
          accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
          multiple
          files={files}
          onFiles={setFiles}
          hint="JPG, PNG, WebP, GIF, BMP — multiple images allowed"
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
              Clear all
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
            <h3>1. Upload images</h3>
            <p>Select one or more images from your device. All common formats supported.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>2. Auto-convert</h3>
            <p>
              Click Convert and your images are combined into a single PDF in the order selected.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>3. Download PDF</h3>
            <p>Your PDF is generated in your browser and automatically downloads — no upload.</p>
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

      {showGate && <UsageGateModal toolName="Image to PDF" onDismiss={() => setShowGate(false)} />}
    </div>
  );
}

function readImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageElement(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataURL;
  });
}
