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
// Architecture #4: data-point-driven, no per-company operator overlay.
//
// Source: skill #2 (company-source) writes data/companies/<company>/<role>.json
//         from Levels.fyi (comp), Wayback (archived job posts), Reddit (advice).
// Build:  skill #4 (company-page-build) emits MDX + SVG, runs LLM gen for the
//         prepSection, then skill #3 (page-qa-gate) verifies.
// Layout: src/layouts/CompanyPageLayout.astro renders 8 sections from props,
//         omitting any whose backing data is empty.
//
// QA contract:
//   - >= 5 datapoints across {compDataPoints, jobRequirements, redditQuotes,
//     processRounds, faqs} — each with a citation URL
//   - >= 2 distinct citation domains across all datapoints (no single-source pages)
//   - Specificity ratio >= 0.015 over rendered body
//   - Word count 1200-2500
//   - All 4 schema types present (Article + FAQPage + BreadcrumbList + Organization)
//   - Banlist + banned-opener regex clean
//   - Visual assets exist (diagram SVG + screenshot WebP/AVIF/PNG/JPG)

const SOURCE_TYPES = ['levels', 'wayback', 'reddit', 'youtube', 'other'] as const;

const sourcedItem = z.object({
  text: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: z.enum(SOURCE_TYPES),
  sourceDate: z.string().optional(),
});

const compDataPoint = z.object({
  metric: z.enum(['baseMin', 'baseMax', 'oteMin', 'oteMax', 'quotaMin', 'quotaMax', 'sampleSize', 'medianBase', 'commission']),
  value: z.number().nonnegative(),
  currency: z.string().default('USD'),
});

// Compensation block: required (every page must have at least Levels.fyi data)
const compensation = z.object({
  baseMin: z.number().int().positive(),
  baseMax: z.number().int().positive(),
  oteMin: z.number().int().positive().optional(),
  oteMax: z.number().int().positive().optional(),
  quotaMin: z.number().int().positive().optional(),
  quotaMax: z.number().int().positive().optional(),
  currency: z.string().default('USD'),
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  asOfDate: z.string().min(1),
  sampleSize: z.number().int().positive(),
});

// Process round (optional — page omits the section when array is empty)
const processRound = z.object({
  round: z.number().int().positive(),
  name: z.string().min(1),
  format: z.string().optional(),
  durationMin: z.number().int().positive().optional(),
  who: z.string().optional(),
  focus: z.string().optional(),
  sourceUrl: z.string().url(),
  sourceType: z.enum(SOURCE_TYPES),
});

// "What {company} looks for" — extracted bullets from Wayback-archived JD
const jobRequirement = z.object({
  text: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: z.enum(SOURCE_TYPES).default('wayback'),
  archivedDate: z.string().optional(),
});

// "What r/sales says" — community-advice quotes
const redditQuote = z.object({
  quote: z.string().min(30),
  sourceUrl: z.string().url(),
  sourceDate: z.string().optional(),
  threadTitle: z.string().optional(),
});

// FAQ — auto-generated, mix of templated + Reddit-derived
const faqEntry = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  derivation: z.enum(['templated', 'reddit', 'jd']).default('templated'),
});

// Cultural claim with mandatory citation
const culturalClaim = z.object({
  claim: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceLabel: z.string().min(1),
});

// Optional verbatim-questions section ("Reports from r/sales") — only when
// real first-person reports exist on Reddit. Empty array means section omitted.
const sourcedQuestion = z.object({
  question: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceType: z.enum(SOURCE_TYPES),
  sourceDate: z.string().optional(),
  sourceQuote: z.string().optional(),
  askedTimes: z.number().int().nonnegative().optional(),
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
  diagramSvg: z.string().optional(),
  screenshotPath: z.string(),
  screenshotAlt: z.string(),

  // Required data sections
  compensation,                                                  // required
  prepSection: z.string().min(50),                               // LLM-generated, required

  // Optional data sections (layout omits when empty)
  process: z.array(processRound).default([]),                    // omit section if empty
  jobRequirements: z.array(jobRequirement).default([]),          // omit section if empty
  redditQuotes: z.array(redditQuote).default([]),                // omit section if empty
  questions: z.array(sourcedQuestion).default([]),               // optional verbatim reports
  faqs: z.array(faqEntry).default([]),                           // omit section if empty
  culturalClaims: z.array(culturalClaim).default([]),

  // Provenance for QA gate datapoint count + domain diversity check.
  // Bare domains (e.g. "levels.fyi", "reddit.com") not full URLs — citations
  // live inline on each section's items.
  datapointSources: z.array(z.string().min(1)).default([]),

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
