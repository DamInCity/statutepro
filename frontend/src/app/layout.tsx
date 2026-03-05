import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import { Providers } from "./providers";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CustomCursor } from "@/components/CustomCursor";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'StatutePro — Legal Practice Management Platform',
    template: '%s | StatutePro',
  },
  description: 'AI-powered legal practice management software for modern law firms.',
  applicationName: 'StatutePro',
  keywords: [
    'legal practice management software',
    'law firm management software',
    'legal billing software',
    'legal trust accounting software',
    'legal case management',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StatutePro — Legal Practice Management Platform',
    description: 'AI-powered legal practice management software for modern law firms.',
    url: '/',
    siteName: 'StatutePro',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StatutePro — Legal Practice Management Platform',
    description: 'AI-powered legal practice management software for modern law firms.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SmoothScroll>
            <ScrollProgress />
            <CustomCursor />
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
