import { useEffect, useState } from 'react'
import { NUM_POSTS_ON_HOMEPAGE } from '@/consts'
import { fetchRecentPosts, type BlogPost } from '@/lib/leaflet-feed'

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function PostSkeleton({ index }: { index: number }) {
  return (
    <div
      className="post-row flex items-baseline justify-between gap-4 border-t border-border/40 py-4 -mx-3 px-3 last:border-b"
      style={{ animationDelay: `${index * 70 + 300}ms` }}
    >
      <div className="h-4 flex-1 max-w-[70%] rounded bg-muted animate-pulse" />
      <div className="h-3 w-14 rounded bg-muted animate-pulse shrink-0" />
    </div>
  )
}

function PostRow({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href={post.url}
      className="post-row group flex items-baseline justify-between gap-4 border-t border-border/40 py-4 transition-colors duration-200 hover:bg-secondary/20 -mx-3 px-3 last:border-b"
      style={{ animationDelay: `${index * 70 + 300}ms` }}
    >
      <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-accent truncate">
        {post.title}
      </span>
      <span className="text-xs text-muted-foreground/40 shrink-0 tabular-nums">
        {formatShortDate(post.date)}
      </span>
    </a>
  )
}

export default function RecentPosts() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)

  useEffect(() => {
    fetchRecentPosts(NUM_POSTS_ON_HOMEPAGE)
      .then(setPosts)
      .catch(() => setPosts([]))
  }, [])

  if (posts === null) {
    return (
      <div className="writing-list flex flex-col">
        {Array.from({ length: NUM_POSTS_ON_HOMEPAGE }, (_, i) => (
          <PostSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) return null

  return (
    <div className="writing-list flex flex-col">
      {posts.map((post, i) => (
        <PostRow key={post.url} post={post} index={i} />
      ))}
    </div>
  )
}
