import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import moment from 'moment'

type Profile = {
  handle?: string
  displayName?: string
  avatar?: string
}

type Post = {
  uri?: string
  cid?: string
  text?: string
  createdAt?: string
  embedThumb?: string | null
}

function Bluesky() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchBluesky = async () => {
      try {
        // Get my profile
        const pResp = await fetch(
          'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=ltwilson.tv',
        )
        const pJson = await pResp.json()

        setProfile({
          handle: pJson.handle,
          displayName: pJson.displayName || pJson.handle,
          avatar: pJson.avatar,
        })

        // Get my latest post
        const feedResp = await fetch(
          'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=did:plc:siwlk4jbqorvg5iytyxgsz4z&limit=1&filter=posts_no_replies',
        )
        const feedJson = await feedResp.json()

        // Log it :3
        console.log('Bluesky data', pJson, feedJson)

        const rawLatest =
          (Array.isArray(feedJson.posts) && feedJson.posts[0]) ||
          (Array.isArray(feedJson.feed) && feedJson.feed[0]) ||
          null

        let postObj: any = null
        if (rawLatest) {
          if (rawLatest.post) {
            postObj = rawLatest.post
          } else if (rawLatest.record || rawLatest.uri || rawLatest.cid) {
            postObj = rawLatest
          } else if (rawLatest.item && rawLatest.item.post) {
            postObj = rawLatest.item.post
          }
        }

        if (postObj) {
          let thumb: string | null = null

          if (
            postObj.embed?.external?.thumb &&
            typeof postObj.embed.external.thumb === 'string'
          ) {
            thumb = postObj.embed.external.thumb
          } else if (
            postObj.record?.embed?.external?.thumb &&
            typeof postObj.record.embed.external.thumb === 'string'
          ) {
            thumb = postObj.record.embed.external.thumb
          }

          setPost({
            uri: postObj.uri,
            cid: postObj.cid,
            text: postObj.record?.text || postObj.text || '',
            createdAt: postObj.record?.createdAt || postObj.createdAt,
            embedThumb: thumb,
          })
        }
      } catch (error) {
        console.error('Failed to fetch Bluesky data', error)
        setIsError(true)
      }
    }

    fetchBluesky()
  }, [])

  if (isError) {
    return (
      <div className="flex flex-row items-center gap-2 opacity-50">
        <Info size={18} />
        Bluesky unavailable.
      </div>
    )
  }

  if (!profile || !post) {
    return (
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-3 rounded-md ">
          <Skeleton className="aspect-square h-12 rounded-lg" />
          <div className="flex w-full flex-col gap-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const postUrl = post.uri
    ? post.uri.startsWith('at://')
      ? `https://bsky.app/profile/${profile.handle}/post/${post.uri.split('/').pop()}`
      : post.uri
    : '#'

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-lg p-4 transition-colors hover:bg-primary/10"
    >
      {post.embedThumb ? (
        <div
          className="mb-3 w-full overflow-hidden rounded-md"
          style={{ paddingTop: '56.25%', position: 'relative' }}
        >
          <img
            src={post.embedThumb}
            alt="Attachment"
            className="absolute left-0 top-0 h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="line-clamp-4 text-sm leading-relaxed">
        {post.text ? (
          post.text
        ) : post.embedThumb ? (
          <span className="opacity-50">(attachment)</span>
        ) : (
          <span className="opacity-50">(no text)</span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-center gap-3">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName}
              className="h-6 w-6 rounded-md"
            />
          ) : (
            <Skeleton className="h-6 w-6 rounded-md" />
          )}
          <div className="flex flex-col leading-tight">
            <span className="truncate text-xs font-semibold">
              {profile.displayName}
            </span>
            <span className="truncate text-[10px] opacity-50">
              {post.createdAt ? moment(post.createdAt).fromNow() : ''}
            </span>
          </div>
        </div>

        <div className="text-sm opacity-50">via Bluesky</div>
      </div>
    </a>
  )
}

export default Bluesky
