import { useState, useEffect } from 'react'
import { DISCORD_USER_ID } from '@/consts'

type StatusType = 'online' | 'offline' | 'dnd' | 'idle'

interface LanyardActivity {
  type: number
  name: string
  state?: string
  details?: string
  application_id?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: {
    large_text?: string
    large_image?: string
    small_text?: string
    small_image?: string
  }
}

interface SpotifyData {
  song: string
  artist: string
  album: string
  album_art_url: string
  timestamps: {
    start: number
    end: number
  }
}

interface LanyardData {
  discord_status: StatusType
  activities: LanyardActivity[]
  listening_to_spotify: boolean
  spotify: SpotifyData | null
  discord_user: {
    id: string
    username: string
    avatar: string
    global_name?: string
    display_name?: string
  }
}

const statusConfig: Record<StatusType, { text: string; dotColor: string }> = {
  online: { text: 'Online', dotColor: 'bg-green-500' },
  idle: { text: 'Away', dotColor: 'bg-yellow-400' },
  dnd: { text: 'Busy', dotColor: 'bg-red-400' },
  offline: { text: 'Offline', dotColor: 'bg-muted-foreground/40' },
}

function Status() {
  const [data, setData] = useState<LanyardData | null>(null)

  useEffect(() => {
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data)
      })
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground/50">
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-14 rounded bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  const status = data.discord_status || 'offline'
  const config = statusConfig[status]
  const user = data.discord_user
  const displayName = user.display_name || user.global_name || user.username
  const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`

  // Non-Spotify activities (type !== 2) take priority
  const customActivity = data.activities.find((a) => a.type !== 2 && a.type !== 4)
  const spotify = data.listening_to_spotify ? data.spotify : null

  const activity = customActivity || (spotify ? {
    name: spotify.song,
    detail: `by ${spotify.artist}`,
    type: 'spotify' as const,
  } : null)

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Avatar with status dot */}
      <div className="relative shrink-0">
        <img
          src={avatarUrl}
          alt={displayName}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${config.dotColor} ${status !== 'offline' ? 'animate-pulse' : ''}`}
        />
      </div>

      {/* Name + activity */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-foreground/80 font-medium truncate">{displayName}</span>

        {/* Activity line */}
        {activity && status !== 'offline' ? (
          <span className="text-xs text-muted-foreground/60 truncate">
            {'type' in activity && activity.type === 'spotify' ? (
              <>Listening to <span className="text-muted-foreground">{activity.name}</span> {activity.detail}</>
            ) : (
              <>
                {(activity as LanyardActivity).details
                  ? <>{(activity as LanyardActivity).details} &mdash; <span className="text-muted-foreground">{(activity as LanyardActivity).name}</span></>
                  : <>{(activity as LanyardActivity).name}{(activity as LanyardActivity).state && <> &mdash; {(activity as LanyardActivity).state}</>}</>
                }
              </>
            )}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">{config.text}</span>
        )}
      </div>
    </div>
  )
}

export default Status
