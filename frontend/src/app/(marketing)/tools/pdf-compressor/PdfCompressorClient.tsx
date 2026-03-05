'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMinimize2, FiChevronRight, FiCheck, FiAlertCircle, FiDownload } from 'react-icons/fi';
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

const TOOL_SLUG = 'pdf-compressor';

interface FaqItem {
  question: string;
  answer: string;
}

type CompressionLevel = 'low' | 'medium' | 'high';

export default function PdfCompressorClient({ faqs }: { faqs: FaqItem[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [working, setWorking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const authed = isAuthenticated();

  const getQualitySetting = (level: CompressionLevel): number => {
    switch (level) {
      case 'low': return 0.95; // Minimal compression
      case 'medium': return 0.7; // Balanced
      case 'high': return 0.5; // Maximum compression
    }
  };

  const getScaleSetting = (level: CompressionLevel): number => {
    switch (level) {
      case 'low': return 1.5;
      case 'medium': return 1.2;
      case 'high': return 1.0;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCompress = async () => {
    if (files.length === 0) return;

    setWorking(true);
    setSuccess(false);
    setError('');
    setOriginalSize(0);
    setCompressedSize(0);

    if (!authed && isLimitReached(TOOL_SLUG)) {
      setShowGate(true);
      setWorking(false);
      return;
    }

    try {
      const file = files[0];
      setOriginalSize(file.size);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const quality = getQualitySetting(compressionLevel);
      const scale = getScaleSetting(compressionLevel);

      // Create compressed PDF
      const compressedPdf = new jsPDF('p', 'pt', 'letter');
      let isFirstPage = true;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

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

        // Convert to image with compression
        const imgData = canvas.toDataURL('image/jpeg', quality);

        // Add to compressed PDF
        if (!isFirstPage) {
          compressedPdf.addPage();
        }
        isFirstPage = false;

        const pageWidth = compressedPdf.internal.pageSize.getWidth();
        const pageHeight = compressedPdf.internal.pageSize.getHeight();

        compressedPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      // Generate blob and get size
      const pdfBlob = compressedPdf.output('blob');
      setCompressedSize(pdfBlob.size);

      // Download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '-compressed.pdf');
      a.click();
      URL.revokeObjectURL(url);

      setSuccess(true);

      const newCount = incrementUseCount(TOOL_SLUG);

      if (!authed && newCount >= 3) {
        setTimeout(() => setShowGate(true), 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed');
    } finally {
      setWorking(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setSuccess(false);
    setError('');
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const compressionRatio = originalSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : '0';

  return (
    <div className={styles.toolPage}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FiChevronRight size={13} />
        <Link href="/tools">Legal Tools</Link>
        <FiChevronRight size={13} />
        <span>PDF Compressor</span>
      </nav>

      <header className={styles.toolHeader}>
        <div className={styles.toolIcon}>
          <FiMinimize2 size={24} />
        </div>
        <h1 className={styles.toolTitle}>PDF Compressor Tool</h1>
        <p className={styles.toolDesc}>
          Reduce PDF file size instantly while maintaining quality. Perfect for compressing large
          legal documents to meet court e-filing limits and email attachment restrictions. Works
          entirely in your browser – no upload required.
        </p>
      </header>

      <section>
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="compressionLevel"
            style={{
              display: 'block',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: 'var(--text)',
            }}
          >
            Compression Level
          </label>
          <select
            id="compressionLevel"
            value={compressionLevel}
            onChange={(e) => setCompressionLevel(e.target.value as CompressionLevel)}
            style={{
              maxWidth: '280px',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.6rem',
              background: 'var(--surface-muted)',
              color: 'var(--text)',
              fontSize: '0.92rem',
            }}
          >
            <option value="low">Low (Best Quality, Less Compression)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Smaller File, Lower Quality)</option>
          </select>
        </div>

        <ToolDropzone
          accept=".pdf"
          multiple={false}
          files={files}
          onFiles={setFiles}
          hint="Select a PDF file to compress"
        />

        <div className={styles.actionBar}>
          <button
            type="button"
            className={styles.convertBtn}
            onClick={handleCompress}
            disabled={files.length === 0 || working}
          >
            {working ? (
              <>
                <span className={styles.spinner} />
                Compressing...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Compress PDF
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
            <span>Compressed PDF downloaded successfully!</span>
          </div>
        )}
        {error && (
          <div className={`${styles.statusRow} ${styles.error}`}>
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {originalSize > 0 && compressedSize > 0 && (
          <div
            style={{
              marginTop: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.9rem',
            }}
          >
            <div className={styles.infoCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 650, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Original Size
              </h3>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                {formatFileSize(originalSize)}
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 650, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Compressed Size
              </h3>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>
                {formatFileSize(compressedSize)}
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 650, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Reduction
              </h3>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
                {compressionRatio}%
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>1. Upload PDF</h3>
            <p>Select your PDF file and choose a compression level based on your needs.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>2. Auto-compress</h3>
            <p>The file is processed in your browser with optimized image quality and resolution.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>3. Download</h3>
            <p>Your compressed PDF downloads automatically. Compare the size reduction.</p>
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

      {showGate && <UsageGateModal toolName="PDF Compressor" onDismiss={() => setShowGate(false)} />}
    </div>
  );
}
