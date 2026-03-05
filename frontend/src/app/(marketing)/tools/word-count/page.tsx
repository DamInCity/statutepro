import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import WordCountClient from './WordCountClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Word Count Tool for Legal Documents',
  description:
    'Count words, characters, paragraphs, and pages in legal documents instantly — free, no sign-up required. Perfect for briefs, contracts, and court filings.',
  path: '/tools/word-count',
  keywords: pageKeywordMap.toolWordCount,
});

const faqs = [
  {
    question: 'Is this word count tool free?',
    answer:
      'Yes, completely free with unlimited use. No account required.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'This tool supports plain text (.txt), Word documents (.docx), and PDF files. You can also paste text directly.',
  },
  {
    question: 'Why do lawyers need word count tools?',
    answer:
      'Many courts impose strict word or page limits on briefs and motions. Legal professionals need accurate counts to ensure compliance with filing requirements.',
  },
  {
    question: 'Does it count footnotes and citations?',
    answer:
      'Yes, all text including footnotes and citations is counted. Some courts exclude certain elements — check your jurisdiction\'s rules.',
  },
  {
    question: 'How is page count calculated?',
    answer:
      'Page count uses a standard estimate of 250 words per page. Actual pages may vary based on formatting, spacing, and font size.',
  },
];

export default function WordCountPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'Word Count', path: '/tools/word-count' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'Word Count Tool — StatutePro',
        description: 'Free browser-based tool to count words, characters, paragraphs, and pages in legal documents for court filings.',
        path: '/tools/word-count',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <WordCountClient faqs={faqs} />
    </>
  );
}
