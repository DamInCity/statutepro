import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, webAppToolSchema, faqSchema } from '@/lib/seo/schemas';
import ImageToPdfClient from './ImageToPdfClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Image to PDF Converter for Legal Documents',
  description:
    'Convert JPG, PNG and other images to a single PDF instantly — free, no sign-up required. Perfect for legal documents, exhibits, and court filings.',
  path: '/tools/image-to-pdf',
  keywords: pageKeywordMap.toolImageToPdf,
});

const faqs = [
  {
    question: 'Is this image to PDF converter free?',
    answer:
      'Yes. You can convert up to 3 batches without an account. Creating a free StatutePro account unlocks unlimited conversions at no cost.',
  },
  {
    question: 'What image formats are supported?',
    answer:
      'JPG, JPEG, PNG, WebP, GIF and BMP. For best quality in legal filings use high-resolution JPG or PNG.',
  },
  {
    question: 'Are my files uploaded to a server?',
    answer:
      'No. All conversion happens entirely in your browser. Your images are never sent to any server.',
  },
  {
    question: 'Can I combine multiple images into one PDF?',
    answer:
      'Yes. Add as many images as you need and they will all be merged into a single PDF in the order you select them.',
  },
  {
    question: 'Why do lawyers use image to PDF converters?',
    answer:
      'Courts and legal platforms commonly require PDF format for exhibits, affidavits, and evidentiary photographs. Converting images to PDF ensures consistent formatting and accepted file types.',
  },
];

export default function ImageToPdfPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Legal Tools', path: '/tools' },
        { name: 'Image to PDF', path: '/tools/image-to-pdf' },
      ])} />
      <JsonLd data={webAppToolSchema({
        name: 'Image to PDF Converter — StatutePro',
        description: 'Free browser-based tool to convert JPG, PNG, and other images into a single PDF for legal documents and court filings.',
        path: '/tools/image-to-pdf',
      })} />
      <JsonLd data={faqSchema(faqs)} />
      <ImageToPdfClient faqs={faqs} />
    </>
  );
}
