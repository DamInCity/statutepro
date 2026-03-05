import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import PdfCompressorClient from './PdfCompressorClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free PDF Compressor Tool for Legal Documents',
  description:
    'Reduce PDF file size instantly while maintaining quality — free, no sign-up required. Perfect for compressing large legal documents for email and court e-filing.',
  path: '/tools/pdf-compressor',
  keywords: pageKeywordMap.toolPdfCompressor,
});

const faqs = [
  {
    question: 'Is this PDF compressor free?',
    answer:
      'Yes. You can compress up to 3 PDFs without an account. Creating a free StatutePro account unlocks unlimited compression at no cost.',
  },
  {
    question: 'How much compression can I expect?',
    answer:
      'Compression depends on your PDF content. Image-heavy PDFs can be reduced by 50-70%. Text-only PDFs have less compression potential. You can choose compression quality levels.',
  },
  {
    question: 'Will my documents be uploaded to a server?',
    answer:
      'No. All compression happens entirely in your browser. Your PDF files are never sent to any server.',
  },
  {
    question: 'Will text remain searchable after compression?',
    answer:
      'Yes. Text-based PDFs remain fully searchable. The compression primarily affects embedded images.',
  },
  {
    question: 'Why do lawyers need PDF compression?',
    answer:
      'Many courts have e-filing size limits (often 10-35 MB per document). Email systems also have attachment limits. Compression ensures documents can be filed and shared without quality loss.',
  },
];

export default function PdfCompressorPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'PDF Compressor', path: '/tools/pdf-compressor' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'PDF Compressor — StatutePro',
        description: 'Free browser-based tool to reduce PDF file size for legal documents, court e-filing, and email attachments.',
        path: '/tools/pdf-compressor',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <PdfCompressorClient faqs={faqs} />
    </>
  );
}
