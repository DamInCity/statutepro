import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import CourtDateClient from './CourtDateClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Court Date Calculator for Legal Deadlines',
  description:
    'Calculate court filing deadlines and due dates with automatic business day counting — free, no sign-up required. Perfect for lawyers managing case calendars.',
  path: '/tools/court-date-calculator',
  keywords: pageKeywordMap.toolCourtDate,
});

const faqs = [
  {
    question: 'Is this court date calculator free?',
    answer:
      'Yes, completely free with unlimited use. No account required.',
  },
  {
    question: 'Does it exclude weekends and holidays?',
    answer:
      'Yes, the calculator automatically excludes weekends (Saturday and Sunday) and common federal holidays when computing business days.',
  },
  {
    question: 'Can I use this for state court deadlines?',
    answer:
      'This tool uses federal holidays. State holidays may differ. Always verify deadlines with your local court rules and calendar.',
  },
  {
    question: 'What is the difference between calendar days and business days?',
    answer:
      'Calendar days include every day. Business days exclude weekends and holidays. Most courts use business days for filing deadlines.',
  },
  {
    question: 'Why do lawyers need a date calculator?',
    answer:
      'Courts impose strict filing deadlines, often counting only business days. Missing a deadline can result in dismissed motions or adverse rulings.',
  },
];

export default function CourtDatePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'Court Date Calculator', path: '/tools/court-date-calculator' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'Court Date Calculator — StatutePro',
        description: 'Free tool to calculate court filing deadlines and due dates with automatic business day counting for legal professionals.',
        path: '/tools/court-date-calculator',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <CourtDateClient faqs={faqs} />
    </>
  );
}
