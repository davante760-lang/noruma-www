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
};
