import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects'}),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        description: z.string(),
        icon: image().optional(),
        url: z.string().optional(),
        repo: z.string().optional(),
        status: z.enum(['active', 'wip', 'archived']),
        order: z.number().default(0),
      })
      .refine((d) => Boolean((d.url && d.url.trim()) || (d.repo && d.repo.trim())), {
        message: 'Provide at least one of url or repo',
        path: ['url'],
      }),
})

export const collections = { projects }
