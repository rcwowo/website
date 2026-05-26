import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        icon: image().optional(),
        url: z.string().optional(),
        repo: z.string().optional(),
        status: z.enum(['active', 'wip', 'archived']).optional(),
        order: z.number().default(0),
        title: z.string().optional(),
      })
      .refine(
        (d) => {
          const isSubpage = Boolean(d.title?.trim()) && !d.name
          if (isSubpage) return true

          const isIndex = Boolean(d.name?.trim())
          if (isIndex) {
            return (
              Boolean(d.description?.trim()) &&
              Boolean(d.status) &&
              Boolean((d.url && d.url.trim()) || (d.repo && d.repo.trim()))
            )
          }

          return false
        },
        {
          message:
            'Index pages need name, description, status, and url or repo. Subpages need title only.',
          path: ['name'],
        },
      ),
})

export const collections = { projects }
