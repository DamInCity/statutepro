import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import PdfToWordClient from './PdfToWordClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free PDF to Word Converter for Legal Documents',
  description:
    'Convert PDF files to editable Microsoft Word format instantly — free, no sign-up required. Perfect for editing contracts, agreements, and legal documents.',
  path: '/tools/pdf-to-word',
  keywords: pageKeywordMap.toolPdfToWord,
});

const faqs = [
  {
    question: 'Is this PDF to Word converter free?',
    answer:
      'Yes. You can convert up to 3 PDFs without an account. Creating a free StatutePro account unlocks unlimited conversions at no cost.',
  },
  {
    question: 'What happens to my PDF after conversion?',
    answer:
      'Nothing. All conversion happens entirely in your browser. Your PDF is never uploaded to any server.',
  },
  {
    question: 'Can this convert scanned PDFs or images?',
    answer:
      'No. This tool extracts text from text-based PDFs only. Scanned PDFs (images) require OCR which is not supported in this browser-based tool.',
  },
  {
    question: 'Will complex formatting be preserved?',
    answer:
      'Basic text and paragraphs are preserved. Complex layouts, tables, headers, and images are not fully supported in this browser-based converter.',
  },
  {
    question: 'Why do lawyers need PDF to Word conversion?',
    answer:
      'Legal professionals often need to edit contracts, agreements, or court documents that are provided in PDF format. Converting to Word enables editing and redlining.',
  },
];

export default function PdfToWordPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'PDF to Word', path: '/tools/pdf-to-word' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'PDF to Word Converter — StatutePro',
        description: 'Free browser-based tool to convert PDF files to editable Microsoft Word format for legal contracts and documents.',
        path: '/tools/pdf-to-word',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <PdfToWordClient faqs={faqs} />
    </>
  );
}
