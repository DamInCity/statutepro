# StatutePro Information Website SEO Master Plan (Non-Dashboard)

Date: 2026-02-23  
Owner: Product + Engineering + Content

## 1) Executive Decision

### Recommended number of non-dashboard pages
To maximize SEO without creating thin content, launch with **22 indexable non-dashboard pages** in Phase 1:

- 1 Home page
- 6 Feature pages
- 5 Solution pages (by firm type/use case)
- 3 Trust pages (Security, Compliance, Privacy)
- 3 Commercial pages (Pricing, Demo, Contact)
- 2 Company pages (About, Careers)
- 2 Resource pages (Blog index, Guides/Resources index)

Then scale to **40–70 pages** in Phase 2 with:
- Practice area pages
- Integrations pages
- Feature comparison pages
- Individual high-quality blog articles

Why: competitors winning legal SaaS search have both (a) strong product pages and (b) many intent-specific pages. 22 pages gives enough topical authority while preserving quality.

---

## 2) Competitor Deep Analysis (Legal Practice Management)

Analyzed websites:
- WakiliCMS
- MyCase
- PracticePanther
- Actionstep
- Smokeball
- LEAP
- CosmoLex
- Rocket Matter
- Filevine

## 2.1 Repeating positioning patterns

Across competitors, the highest-frequency messaging themes are:
- “All-in-one legal practice management software”
- “Case/Matter management + billing + trust accounting”
- “Client portal + secure communications”
- “Workflow/document automation”
- “Legal AI for productivity”
- “Compliance/security” (SOC2, encryption, permissions)
- “Get paid faster / profitability / revenue growth”
- “Support + onboarding + migration”

## 2.2 Repeating feature/service categories

Most visible service clusters competitors publish as dedicated pages:
1. Case/Matter Management
2. Document Management + Automation
3. Time Tracking + Billing + Payments
4. Trust Accounting + Compliance
5. CRM/Intake + Client Portal
6. Reporting/Analytics + Firm Performance
7. Integrations
8. Security/Trust Center
9. AI features
10. Practice area solutions (family, PI, litigation, estate, etc.)

## 2.3 Keyword intelligence (high-intent clusters)

### Core commercial cluster
- legal practice management software
- law firm management software
- legal case management software
- legal matter management software
- law office software

### Revenue/operations cluster
- legal billing software
- legal time tracking software
- legal trust accounting software
- law firm accounting software
- legal invoicing software

### Productivity cluster
- legal document automation
- legal workflow automation
- legal calendaring software
- client intake software for law firms

### Client experience cluster
- legal client portal
- law firm CRM
- legal client communication software

### AI cluster
- legal AI software
- AI for law firms
- AI legal drafting
- AI time capture legal

### Trust cluster
- legal software security
- SOC2 legal software
- compliant legal practice software
- legal data governance

## 2.4 WakiliCMS-specific market insight (regional differentiation)

WakiliCMS emphasizes:
- Multi-branch accounting
- HR + payroll inside legal PMS
- Africa/Kenya fit and local support
- Cost savings versus international tools

Implication for StatutePro:
- Include global best-practice pages (AI, trust accounting, integrations, portal)
- Add regional proof points where relevant (multi-office operations, jurisdiction-ready finance/compliance framing)

---

## 3) Dark/Light Mode Research and Standards (from current project)

Source of truth reviewed:
- /ui.md
- frontend/src/app/globals.css
- dashboard/admin layouts and header theme toggle

## 3.1 Token standard to enforce on information site

### Light
- Background: #f6f8fc
- Surface: #ffffff
- Surface muted: #f3f6fb
- Border: #dbe3ee
- Text strong: #0b1220
- Text: #101828
- Text muted: #475467
- Accent: #2f6ef2

### Dark
- Background: #060b16
- Surface: #101826
- Surface muted: #0d1524
- Border: #243247
- Text strong: #f7faff
- Text: #e5ebf7
- Text muted: #9baac2
- Accent: #72a0ff

## 3.2 Behavioral requirements
- Use the existing `data-theme="light|dark"` approach.
- Reuse existing `ThemeProvider` and persistent localStorage theme key (`legalcms-theme`).
- Keep header blur and restrained motion (150–280ms).
- Ensure WCAG AA contrast in both themes.

## 3.3 Current mismatch to fix
Current root home page styling is template-like and not aligned to the dashboard design system. The information site must migrate to shared token-driven styles from globals.

---

## 4) Information Architecture (Phase 1 = 22 Pages)

## 4.1 Primary pages
1. Home
2. Features (hub)
3. Case Management
4. Document Management & Automation
5. Billing & Time Tracking
6. Trust Accounting
7. Client Portal
8. Analytics & Reporting
9. AI for Law Firms
10. Integrations
11. Security
12. Compliance & Trust Center
13. Pricing
14. Book Demo
15. Contact Sales
16. About
17. Careers
18. Solutions for Solo Firms
19. Solutions for Small Firms
20. Solutions for Mid-size Firms
21. Resources (guides/webinars)
22. Blog Index

## 4.2 URL strategy
- /
- /features
- /features/case-management
- /features/document-automation
- /features/billing-time-tracking
- /features/trust-accounting
- /features/client-portal
- /features/analytics-reporting
- /features/legal-ai
- /integrations
- /security
- /trust-center
- /pricing
- /demo
- /contact
- /about
- /careers
- /solutions/solo-law-firms
- /solutions/small-law-firms
- /solutions/mid-size-law-firms
- /resources
- /blog

---

## 5) SEO Tool to Build in Codebase

Goal: one reusable toolset to remove SEO inconsistency across all information pages.

## 5.1 Tool components

1) `seoToolkit` utility
- Generates page metadata (`title`, `description`, `keywords`, canonical, OpenGraph, Twitter).
- Enforces title length and description guards.
- Supports robots per page (`index/follow/noindex`).

2) JSON-LD builder
- Organization schema
- SoftwareApplication schema
- BreadcrumbList schema
- FAQPage schema
- Article schema (for blog)

3) Internal-link recommendation map
- Declares required contextual links per page type
- Warns if a page is missing required internal links

4) SEO audit script (local)
- Checks each info page for:
  - single H1
  - title and meta description
  - canonical
  - JSON-LD presence
  - image alt attributes
  - indexability rules

5) Content brief generator (markdown/json)
- For each target page, outputs:
  - primary keyword
  - secondary keywords
  - search intent
  - required sections
  - FAQ targets

## 5.2 File plan for SEO tool
- frontend/src/lib/seo/toolkit.ts
- frontend/src/lib/seo/schemas.ts
- frontend/src/lib/seo/keyword-map.ts
- frontend/src/lib/seo/internal-link-rules.ts
- frontend/src/components/seo/JsonLd.tsx
- frontend/scripts/seo-audit.mjs
- frontend/content/seo-briefs/*.md

---

## 6) Implementation Plan (Zero Ambiguity)

## Phase A — Foundation
1. Create marketing route group and shared marketing layout.
2. Implement shared header/footer for info pages with theme toggle parity.
3. Replace home page with token-aligned design.
4. Create `/sitemap.ts` and `/robots.ts` in Next app.

## Phase B — SEO tool
1. Implement metadata factory and canonical helper.
2. Implement JSON-LD helpers + reusable component.
3. Implement keyword mapping by page.
4. Implement local SEO audit script and run it on all marketing pages.

## Phase C — Page rollout
1. Build 22 pages above with unique intent and non-duplicative content.
2. Add schema by page type.
3. Add CTAs and conversion routes (`/demo`, `/contact`, `/pricing`).
4. Add strong internal linking between feature/solution/trust pages.

## Phase D — Content and authority
1. Publish first 12 high-value blog/guides articles.
2. Add practice-area pages based on GSC query data.
3. Add integrations and competitor comparison pages.

## Phase E — Measurement
Track weekly:
- Indexed pages count
- Impressions and clicks (GSC)
- Ranking movement for 30 target keywords
- Branded vs non-branded traffic
- Demo request conversion rate from organic landing pages

---

## 7) Technical Acceptance Criteria

Every info page must include:
- Unique `title` and `meta description`
- Canonical URL
- Exactly one H1
- At least one relevant JSON-LD schema
- At least 3 internal contextual links
- Theme-safe styling in both light/dark modes
- Lighthouse SEO score >= 95

Global requirements:
- Dynamic sitemap containing all non-dashboard indexable pages
- robots policy for public pages only
- No duplicate metadata across pages
- No thin pages (< ~600 words) for commercial intent URLs

---

## 8) Immediate Next Build Order

1. Home (new)
2. Features hub
3. Pricing
4. Demo
5. Security
6. Trust Center
7. Top 3 feature pages
8. Solutions pages
9. Resources + Blog index
10. Remaining feature pages

---

## 9) Final Recommendation

For StatutePro’s current stage, **launch 22 non-dashboard information pages first**. This is the right balance between topical breadth, implementation speed, and content quality. Then expand based on search console evidence into practice-area, integration, and long-form resources.
