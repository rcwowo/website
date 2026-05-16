import {
  BLOG_AUTHOR_DID,
  BLOG_PDS,
  BLOG_PUBLICATION_URI,
  BLOG_URL,
} from '@/consts'

export type BlogPost = {
  title: string
  url: string
  date: Date
}

const CACHE_KEY = 'rcw-blog-recent-posts'
const CACHE_TTL_MS = 15 * 60 * 1000

type CachedPosts = {
  expiresAt: number
  posts: { title: string; url: string; date: string }[]
}

type DocumentRecord = {
  site?: string
  title?: string
  path?: string
  publishedAt?: string
}

type ListRecordsResponse = {
  records: { value: DocumentRecord }[]
  cursor?: string
}

function normalizeSite(site: string): string {
  return site.replace(/\/+$/, '')
}

function matchesPublication(site: string | undefined): boolean {
  if (!site) return false
  const normalized = normalizeSite(site)
  return (
    normalized === normalizeSite(BLOG_PUBLICATION_URI) ||
    normalized === normalizeSite(BLOG_URL)
  )
}

function readCache(): BlogPost[] | null {
  if (typeof sessionStorage === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const cached = JSON.parse(raw) as CachedPosts
    if (Date.now() > cached.expiresAt) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }

    return cached.posts.map((post) => ({
      title: post.title,
      url: post.url,
      date: new Date(post.date),
    }))
  } catch {
    return null
  }
}

function writeCache(posts: BlogPost[]): void {
  if (typeof sessionStorage === 'undefined') return

  try {
    const cached: CachedPosts = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      posts: posts.map((post) => ({
        title: post.title,
        url: post.url,
        date: post.date.toISOString(),
      })),
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch (error) {
    console.error('Failed to write cache:', error)
  }
}

async function listDocuments(cursor?: string): Promise<ListRecordsResponse> {
  const params = new URLSearchParams({
    repo: BLOG_AUTHOR_DID,
    collection: 'site.standard.document',
    limit: '50',
  })
  if (cursor) params.set('cursor', cursor)

  const res = await fetch(
    `${BLOG_PDS}/xrpc/com.atproto.repo.listRecords?${params}`,
  )
  if (!res.ok) throw new Error(`PDS listRecords failed: ${res.status}`)

  return res.json() as Promise<ListRecordsResponse>
}

function recordToPost(record: DocumentRecord): BlogPost | null {
  if (!matchesPublication(record.site)) return null
  if (!record.title || !record.path || !record.publishedAt) return null

  const path = record.path.startsWith('/') ? record.path : `/${record.path}`

  return {
    title: record.title,
    url: `${BLOG_URL}${path}`,
    date: new Date(record.publishedAt),
  }
}

export async function fetchRecentPosts(limit: number): Promise<BlogPost[]> {
  const cached = readCache()
  if (cached) return cached.slice(0, limit)

  const posts: BlogPost[] = []
  let cursor: string | undefined

  do {
    const page = await listDocuments(cursor)
    for (const { value } of page.records) {
      const post = recordToPost(value)
      if (post) posts.push(post)
    }
    cursor = page.cursor
  } while (cursor)

  posts.sort((a, b) => b.date.getTime() - a.date.getTime())
  const recent = posts.slice(0, limit)

  writeCache(recent)
  return recent
}
