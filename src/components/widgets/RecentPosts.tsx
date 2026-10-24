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
      className="post-row border-border/40 -mx-3 flex items-baseline justify-between gap-4 border-t px-3 py-4 last:border-b"
      style={{ animationDelay: `${index * 70 + 300}ms` }}
    >
      <div className="bg-muted h-4 max-w-[70%] flex-1 animate-pulse rounded" />
      <div className="bg-muted h-3 w-14 shrink-0 animate-pulse rounded" />
    </div>
  )
}

function PostRow({ post, index }: { post: BlogPost; index: number }) {
  return (
    <a
      href={post.url}
      className="post-row group border-border/40 hover:bg-secondary/20 -mx-3 flex items-baseline justify-between gap-4 border-t px-3 py-4 transition-colors duration-200 last:border-b"
      style={{ animationDelay: `${index * 70 + 300}ms` }}
    >
      <span className="text-foreground group-hover:text-accent truncate text-sm font-medium transition-colors duration-200">
        {post.title}
      </span>
      <span className="text-muted-foreground/40 shrink-0 text-xs tabular-nums">
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
