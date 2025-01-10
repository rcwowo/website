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
    }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.string().url(),
    bio: z.string().optional(),
    mail: z.string().email().optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional(),
    bluesky: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitch: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    discord: z.string().url().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      image: image().optional(),
      link: z.string().url(),
      license: z.string().optional(),
      github_repo: z.string().optional(),
    }),
})

const vods = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/vods' }),
  schema: z.object({
    title: z.string(),
    streamDate: z.coerce.date(),
    game: z.string(),
    gameCoverURL: z.string().url(),
    vodUrl: z.string().url(),
    thumbnail: z.string().url(),
    duration: z.string(),
    chatReplayURL: z.string().url().optional(),
  }),
})

export const collections = { blog, authors, projects, vods }
