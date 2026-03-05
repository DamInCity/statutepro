#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());

const routeFileMap = {
  '/': 'src/app/page.tsx',
  '/about': 'src/app/(marketing)/about/page.tsx',
  '/contact': 'src/app/(marketing)/contact/page.tsx',
  '/careers': 'src/app/(marketing)/careers/page.tsx',
  '/features': 'src/app/(marketing)/features/page.tsx',
  '/features/case-management': 'src/app/(marketing)/features/case-management/page.tsx',
  '/features/document-automation': 'src/app/(marketing)/features/document-automation/page.tsx',
  '/features/billing-time-tracking': 'src/app/(marketing)/features/billing-time-tracking/page.tsx',
  '/features/trust-accounting': 'src/app/(marketing)/features/trust-accounting/page.tsx',
  '/features/client-portal': 'src/app/(marketing)/features/client-portal/page.tsx',
  '/features/analytics-reporting': 'src/app/(marketing)/features/analytics-reporting/page.tsx',
  '/features/legal-ai': 'src/app/(marketing)/features/legal-ai/page.tsx',
  '/solutions': 'src/app/(marketing)/solutions/page.tsx',
  '/solutions/solo-law-firms': 'src/app/(marketing)/solutions/solo-law-firms/page.tsx',
  '/solutions/small-law-firms': 'src/app/(marketing)/solutions/small-law-firms/page.tsx',
  '/solutions/mid-size-law-firms': 'src/app/(marketing)/solutions/mid-size-law-firms/page.tsx',
  '/integrations': 'src/app/(marketing)/integrations/page.tsx',
  '/resources': 'src/app/(marketing)/resources/page.tsx',
  '/blog': 'src/app/(marketing)/blog/page.tsx',
  '/pricing': 'src/app/(marketing)/pricing/page.tsx',
  '/demo': 'src/app/(marketing)/demo/page.tsx',
  '/security': 'src/app/(marketing)/security/page.tsx',
  '/trust-center': 'src/app/(marketing)/trust-center/page.tsx',
  '/privacy': 'src/app/privacy/page.tsx',
  '/docs': 'src/app/docs/page.tsx',
};

const internalLinkRules = {
  '/': ['/features', '/pricing', '/demo', '/security'],
  '/about': ['/features', '/demo', '/contact'],
  '/contact': ['/demo', '/pricing', '/security'],
  '/careers': ['/about', '/contact', '/demo'],
  '/features': ['/pricing', '/demo', '/security'],
  '/features/case-management': ['/features/document-automation', '/features/client-portal', '/demo'],
  '/features/document-automation': ['/features/case-management', '/features/legal-ai', '/demo'],
  '/features/billing-time-tracking': ['/features/trust-accounting', '/pricing', '/demo'],
  '/features/trust-accounting': ['/trust-center', '/features/billing-time-tracking', '/demo'],
  '/features/client-portal': ['/features/case-management', '/security', '/demo'],
  '/features/analytics-reporting': ['/features/billing-time-tracking', '/solutions/mid-size-law-firms', '/demo'],
  '/features/legal-ai': ['/features/document-automation', '/trust-center', '/demo'],
  '/solutions': ['/solutions/solo-law-firms', '/solutions/small-law-firms', '/solutions/mid-size-law-firms'],
  '/solutions/solo-law-firms': ['/features/case-management', '/pricing', '/demo'],
  '/solutions/small-law-firms': ['/features/analytics-reporting', '/features/trust-accounting', '/demo'],
  '/solutions/mid-size-law-firms': ['/integrations', '/trust-center', '/demo'],
  '/integrations': ['/demo', '/features', '/trust-center'],
  '/resources': ['/blog', '/demo', '/contact'],
  '/blog': ['/resources', '/features/legal-ai', '/demo'],
  '/pricing': ['/demo', '/features', '/security'],
  '/demo': ['/pricing', '/features', '/trust-center'],
  '/security': ['/trust-center', '/features', '/demo'],
  '/trust-center': ['/security', '/features', '/demo'],
  '/privacy': ['/trust-center', '/security', '/'],
  '/docs': ['/features', '/demo', '/'],
};

const errors = [];
const warnings = [];

for (const [route, relativeFile] of Object.entries(routeFileMap)) {
  const filePath = path.join(projectRoot, relativeFile);
  const source = await readFile(filePath, 'utf8');

  const hasMetadata = source.includes('export const metadata');
  if (!hasMetadata) {
    errors.push(`${route}: missing metadata export (${relativeFile})`);
  }

  const h1Count = (source.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) {
    errors.push(`${route}: expected exactly 1 <h1>, found ${h1Count} (${relativeFile})`);
  }

  if (!source.includes('path:')) {
    warnings.push(`${route}: metadata path field not found (${relativeFile})`);
  }

  if (!source.includes('<JsonLd')) {
    warnings.push(`${route}: JSON-LD component not found (${relativeFile})`);
  }

  const expectedLinks = internalLinkRules[route] || [];
  for (const expectedLink of expectedLinks) {
    if (!source.includes(`href="${expectedLink}"`) && !source.includes(`href='${expectedLink}'`)) {
      warnings.push(`${route}: missing recommended internal link to ${expectedLink} (${relativeFile})`);
    }
  }
}

if (warnings.length > 0) {
  console.warn('\nSEO audit warnings:\n');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length > 0) {
  console.error('\nSEO audit failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('\nSEO audit passed for core marketing pages.');
