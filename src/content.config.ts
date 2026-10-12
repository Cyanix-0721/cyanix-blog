import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  title: z.string(),
  'date created': z.coerce.date(),
  'date modified': z.coerce.date().optional(),
  description: z.string().optional(),
  tags: z
    .preprocess((val) => {
      if (!val) return [];
      if (typeof val === 'string')
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      return val;
    }, z.array(z.string()))
    .default([]),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: baseSchema.transform((data: z.infer<typeof baseSchema>) => ({
    ...data,
    dateCreated: data['date created'],
    dateModified: data['date modified'],
  })),
});

export const collections = { posts };
