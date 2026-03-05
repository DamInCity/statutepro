import type { Metadata } from 'next';

interface BuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}

const FALLBACK_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

function clampDescription(value: string): string {
  const normalized = value.trim();
  return normalized.length <= 160 ? normalized : `${normalized.slice(0, 157)}...`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const cleanDescription = clampDescription(description);

  return {
    title,
    description: cleanDescription,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: path,
      siteName: 'StatutePro',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: cleanDescription,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
