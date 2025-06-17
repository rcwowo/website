import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog'}),
  schema: ({ image }) =>
    z.object({
      title: z
        .string()
        .max(
          60,
          'Title should be 60 characters or less for optimal Open Graph display.',
        ),
      description: z
        .string()
        .max(
          155,
          'Description should be 155 characters or less for optimal Open Graph display.',
        ),
      date: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      disableComments: z.boolean().optional()
    }),
})

export const collections = { blog }
