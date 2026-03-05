# Free Legal Document Tools

## Overview

StatutePro provides free browser-based document conversion tools designed specifically for legal professionals. All conversions happen entirely in your browser — no files are uploaded to any server, ensuring client confidentiality and data security.

## Available Tools

### 1. Image to PDF Converter
**URL:** `/tools/image-to-pdf`

Convert images (JPG, PNG, WebP, GIF, BMP) into a single PDF document.

**Perfect for:**
- Court exhibits
- Evidentiary photographs
- Scanned documents
- Legal filing submissions

**Features:**
- Multiple images → single PDF
- Browser-based (no upload)
- Automatic page fitting
- Free with usage limits

### 2. Word to PDF Converter
**URL:** `/tools/word-to-pdf`

Convert Microsoft Word (.docx) files to PDF format.

**Perfect for:**
- Legal contracts
- Briefs and motions
- Court filings
- Client agreements

**Features:**
- Text extraction and formatting
- Browser-based (no upload)
- No Microsoft Word required
- Free with usage limits

### 3. PDF to Word Converter
**URL:** `/tools/pdf-to-word`

Convert text-based PDF files to editable Word (.docx) format.

**Perfect for:**
- Editing received contracts
- Redlining agreements
- Document revisions
- Template creation

**Features:**
- Text extraction from PDFs
- Outputs editable .docx
- Browser-based (no upload)
- Free with usage limits

**Note:** Only works with text-based PDFs. Scanned/image PDFs are not supported.

## Usage Limits

- **Anonymous users:** 3 free conversions per tool
- **Registered users:** Unlimited conversions (always free)
- **No credit card required**

## Coming Soon

Additional tools in development:
- **PDF Merger** — Merge multiple PDFs into one document
- **PDF Compressor** — Reduce PDF file size
- **Court Date Calculator** — Calculate filing deadlines by jurisdiction
- **Word Count Tool** — Count words, characters, and pages

## Technical Implementation

### Client-Side Processing

All tools use browser-based JavaScript libraries for 100% client-side processing:

- **Image to PDF:** `jspdf` — PDF generation from images
- **Word to PDF:** `mammoth` (text extraction) + `jspdf` (PDF rendering)
- **PDF to Word:** `pdfjs-dist` (PDF parsing) + `docx` (DOCX generation)

### Security & Privacy

- ✅ No server uploads
- ✅ All processing in browser
- ✅ Files never leave your device
- ✅ Client confidentiality maintained
- ✅ No data collection

### Usage Tracking

Anonymous usage is tracked via `localStorage`:
- Key: `sp_anon_tool_uses`
- Stores per-tool conversion counts
- Resets after 3 uses → prompts for free signup
- Authenticated users bypass limits

## SEO Optimization

Each tool page includes:
- **Structured data:** `WebApplication` schema
- **Breadcrumbs:** JSON-LD breadcrumb schema
- **FAQ schema:** Answers common questions
- **Keywords:** Legal-specific keyword targeting
- **Sitemap:** All tools indexed
- **Metadata:** Optimized title, description, OG tags

## Development

### File Structure

```
frontend/src/
├── app/(marketing)/tools/
│   ├── page.tsx                          # Tools hub
│   ├── image-to-pdf/
│   │   ├── page.tsx                      # Server component (metadata)
│   │   └── ImageToPdfClient.tsx          # Client component (logic)
│   ├── word-to-pdf/
│   │   ├── page.tsx
│   │   └── WordToPdfClient.tsx
│   └── pdf-to-word/
│       ├── page.tsx
│       └── PdfToWordClient.tsx
├── components/tools/
│   ├── Tools.module.css                  # Shared styles
│   ├── ToolDropzone.tsx                  # File upload component
│   └── UsageGateModal.tsx                # Signup prompt modal
└── lib/tools/
    └── usage-guard.ts                    # Usage tracking logic
```

### Running Locally

```bash
cd frontend
npm install
npm run dev
```

Visit:
- Tools hub: `http://localhost:3000/tools`
- Image to PDF: `http://localhost:3000/tools/image-to-pdf`
- Word to PDF: `http://localhost:3000/tools/word-to-pdf`
- PDF to Word: `http://localhost:3000/tools/pdf-to-word`

### Adding New Tools

1. Create new directory under `app/(marketing)/tools/[tool-slug]/`
2. Add server component `page.tsx` with metadata
3. Add client component `[ToolName]Client.tsx` with conversion logic
4. Update `tools/page.tsx` hub with new tool card
5. Add keywords to `lib/seo/keyword-map.ts`
6. Add route to `app/sitemap.ts`
7. Add FAQ schema with `faqSchema()` and tool schema with `webAppToolSchema()`

## Marketing Strategy

These free tools serve multiple purposes:

1. **SEO Value:** High-ranking keywords like "image to pdf converter" and "free legal tools"
2. **Lead Generation:** 3 free uses → signup prompt → user acquisition
3. **Brand Awareness:** "Legal tools by StatutePro" builds brand recognition
4. **Value Demonstration:** Free tools show product quality before paid features
5. **Organic Traffic:** Tool-specific searches drive qualified legal traffic

## Support

For questions or feature requests:
- Email: support@statutepro.com
- Contact: https://statutepro.com/contact
