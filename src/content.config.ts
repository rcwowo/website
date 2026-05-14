import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects'}),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      icon: image().optional(),
      url: z.string(),
      status: z.enum(['active', 'wip', 'archived']),
      order: z.number().default(0),
    }),
})

export const collections = { projects }
