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
//         on "/" to derive params, wraps <Content /> in CompanyPageLayout.
//
// Architecture: structured data lives in frontmatter; the layout renders all
// sections (process table, question list, comp table, FAQ, CTA) from props.
// MDX body holds ONLY the hero lede prose, rendered into the default <slot />.
// Slot routing for fragment-named slots through <Content /> doesn't propagate
// to the grandparent layout, so we keep all section structure in props.
const sourcedQuestion = z.object({
  question: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: z.enum(['reddit', 'repvue', 'job_posting', 'youtube', 'wayback', 'other']),
  sourceDate: z.string().optional(),
  sourceQuote: z.string().optional(),
  askedTimes: z.number().int().nonnegative().optional(),
});

const processRound = z.object({
  round: z.number().int().positive(),
  name: z.string().min(1),
  format: z.string().min(1),
  durationMin: z.number().int().positive().optional(),
  who: z.string().optional(),
  focus: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceType: z.enum(['reddit', 'repvue', 'job_posting', 'youtube', 'wayback', 'other']).optional(),
});

const compensation = z.object({
  baseMin: z.number().int().positive(),
  baseMax: z.number().int().positive(),
  oteMin: z.number().int().positive(),
  oteMax: z.number().int().positive(),
  quotaMin: z.number().int().positive(),
  quotaMax: z.number().int().positive(),
  currency: z.string().default('USD'),
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  asOfDate: z.string().min(1),
  sampleSize: z.number().int().positive(),
});

const faqEntry = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
  sourceUrl: z.string().url().optional(),
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
  process: z.array(processRound).min(1),
  compensation,
  faqs: z.array(faqEntry).default([]),
  culturalClaims: z.array(culturalClaim).default([]),
  ctaCopy: z.string().optional(),
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
