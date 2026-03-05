import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import WordToPdfClient from './WordToPdfClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Word to PDF Converter for Legal Documents',
  description:
    'Convert Microsoft Word DOCX files to PDF instantly — free, no sign-up required. Perfect for legal contracts, briefs, and court filings.',
  path: '/tools/word-to-pdf',
  keywords: pageKeywordMap.toolWordToPdf,
});

const faqs = [
  {
    question: 'Is this Word to PDF converter free?',
    answer:
      'Yes. You can convert up to 3 documents without an account. Creating a free StatutePro account unlocks unlimited conversions at no cost.',
  },
  {
    question: 'Do I need Microsoft Word installed?',
    answer:
      'No. The conversion happens entirely in your browser without requiring Microsoft Word or any other software.',
  },
  {
    question: 'Are my documents uploaded to a server?',
    answer:
      'No. All conversion happens locally in your browser. Your Word documents are never sent to any server.',
  },
  {
    question: 'What Word formats are supported?',
    answer:
      'Only .docx (Microsoft Word 2007 and later). If you have an older .doc file, open it in Word and save as .docx first.',
  },
  {
    question: 'Will complex formatting be preserved?',
    answer:
      'Basic text formatting, headings, and paragraphs are preserved. Complex layouts, tables, and embedded objects may have limited support in this browser-based converter.',
  },
];

export default function WordToPdfPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'Word to PDF', path: '/tools/word-to-pdf' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'Word to PDF Converter — StatutePro',
        description: 'Free browser-based tool to convert Microsoft Word DOCX files to PDF for legal contracts, briefs, and court filings.',
        path: '/tools/word-to-pdf',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <WordToPdfClient faqs={faqs} />
    </>
  );
}
