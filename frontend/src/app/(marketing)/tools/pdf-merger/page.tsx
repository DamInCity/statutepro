import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import PdfMergerClient from './PdfMergerClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free PDF Merger Tool for Legal Documents',
  description:
    'Merge multiple PDF files into a single document instantly — free, no sign-up required. Perfect for combining legal exhibits, contracts, and court filings.',
  path: '/tools/pdf-merger',
  keywords: pageKeywordMap.toolPdfMerger,
});

const faqs = [
  {
    question: 'Is this PDF merger free?',
    answer:
      'Yes. You can merge up to 3 sets of PDFs without an account. Creating a free StatutePro account unlocks unlimited merges at no cost.',
  },
  {
    question: 'How many PDFs can I merge at once?',
    answer:
      'You can merge up to 20 PDF files in a single operation. The files are combined in the order you select them.',
  },
  {
    question: 'Are my documents uploaded to a server?',
    answer:
      'No. All merging happens locally in your browser. Your PDF files are never sent to any server.',
  },
  {
    question: 'Will bookmarks and links be preserved?',
    answer:
      'This browser-based merger creates a simple combined PDF. Original bookmarks and interactive elements may not be preserved.',
  },
  {
    question: 'Why do lawyers need to merge PDFs?',
    answer:
      'Legal professionals often need to combine multiple exhibits, discovery documents, or case files into a single PDF for court filings or client delivery.',
  },
];

export default function PdfMergerPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'PDF Merger', path: '/tools/pdf-merger' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'PDF Merger — StatutePro',
        description: 'Free browser-based tool to merge multiple PDF files into a single document for legal exhibits and court filings.',
        path: '/tools/pdf-merger',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <PdfMergerClient faqs={faqs} />
    </>
  );
}
