import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  publishDate: z.coerce.date(),
  ogImage: z.string().optional(),
  canonical: z.string().url().optional(),
  schemaType: z.enum(['Article', 'HowTo', 'FAQ', 'ComparisonPage']),
});

// sales-interview-prep — programmatic company x role pages.
// Source: skill #2 (company-source) writes data/companies/<company>/<role>.json.
// Build:  skill #4 (company-page-build) renders that JSON to an MDX file at
//         src/content/sales-interview-prep/<company>/<role>.mdx and runs
//         skill #3 (page-qa-gate). On pass -> skill #5 commits + pushes.
//         On fail -> quarantine to data/qa-failures/<slug>.md.
// Route:  src/pages/sales-interview-prep/[company]/[role].astro splits entry.id
//         on "/" to derive params, wraps <Content /> in CompanyPageLayout
//         (which composes BaseLayout for chrome).
// MDX body uses six top-level <Fragment slot="..."> blocks:
//   companyHero, processTable, questionList, compTable, faq, cta
// Frontmatter is validated below at build time; richer QA (specificity ratio,
// banlist, schema markup, visual assets, word count) lives in skill #3.
const sourcedQuestion = z.object({
  question: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: z.enum(['reddit', 'repvue', 'job_posting', 'youtube', 'wayback', 'other']),
  sourceDate: z.string().optional(),
  sourceQuote: z.string().optional(),
});

const culturalClaim = z.object({
  claim: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceLabel: z.string().min(1),
});

const salesInterviewPrepSchema = z.object({
  title: z.string(),
  description: z.string(),
  company: z.string().regex(/^[a-z0-9-]+$/),
  companyDisplay: z.string(),
  role: z.string().regex(/^[a-z0-9-]+$/),
  roleDisplay: z.string(),
  publishDate: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  canonical: z.string().url().optional(),
  ogImage: z.string().optional(),
  diagramSvg: z.string(),
  screenshotPath: z.string(),
  screenshotAlt: z.string(),
  questions: z.array(sourcedQuestion).min(5),
  culturalClaims: z.array(culturalClaim).default([]),
});

export const collections = {
  guides: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
    schema: seoSchema,
  }),
  compare: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/compare' }),
    schema: seoSchema,
  }),
  glossary: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
    schema: seoSchema,
  }),
  'sales-interview-prep': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/sales-interview-prep' }),
    schema: salesInterviewPrepSchema,
  }),
};
