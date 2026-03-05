import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import ToolsContent from '@/components/marketing/ToolsContent';
import { pageKeywordMap } from '@/lib/seo/keyword-map';
import { buildPageMetadata } from '@/lib/seo/toolkit';
import { breadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Legal Document Tools | PDF Converter, Merger, Compressor & Court Date Calculator',
  description:
    'Free online tools for lawyers: Image to PDF, Word to PDF, PDF to Word, PDF Merger, PDF Compressor, Word Counter, and Court Date Calculator. No sign-up required.',
  path: '/tools',
  keywords: pageKeywordMap.tools,
});

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Free Legal Tools', path: '/tools' },
        ])}
      />
      <ToolsContent />
    </>
  );
}
