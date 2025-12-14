import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import moment from 'moment'

type Stream = {
  title: string
  game_name: string
  thumbnail_url: string
  viewer_count: string
  started_at: string
}

type Vod = {
  title: string
  game_name: string
  thumbnail_url: string
  url: string
  stream_date: string
}

type TwitchData = {
  isLive: boolean
  stream?: Stream
  vod?: Vod
}

function Twitch() {
  const [twitchData, setTwitchData] = useState<TwitchData | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchTwitchStatus = async () => {
      try {
        const response = await fetch(
          'https://n8n.lab.rcw.lol/webhook/twitch-status',
        )
        const data = await response.json()
        setTwitchData(data)
      } catch (error) {
        setIsError(true)
        console.error('Failed to fetch Twitch status:', error)
      }
    }

    fetchTwitchStatus()
  }, [])

  if (isError) {
    return (
      <div className="flex flex-row items-center justify-center gap-2 opacity-50">
        <Info size={18} />
        Twitch data unavailable.
      </div>
    )
  }

  if (!twitchData) {
    return (
      <div className="flex flex-col overflow-hidden rounded-xl w-full border border-white/25">
        <div className="flex flex-col">
          <Skeleton className="aspect-video w-full" />
          <div className="flex flex-col p-4">
            <Skeleton className="mb-2 h-7 w-full" />
            <div className="flex flex-row items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const content = (
    <a
      href={twitchData.isLive ? "https://twitch.tv/rcwowo" : twitchData.vod!.url}
      target="_blank"
      className="flex flex-col overflow-hidden rounded-xl border-white/25 transition-colors hover:bg-primary/10"
    >
      <div className="flex flex-col">
        <div className="relative">
          <img
            src={twitchData.isLive
              ? twitchData.stream!.thumbnail_url.replace('{width}', '1280').replace('{height}', '720')
              : twitchData.vod!.thumbnail_url}
            alt={twitchData.isLive ? twitchData.stream!.title : twitchData.vod!.title}
            className="aspect-video w-full object-cover"
          />
          {twitchData.isLive && (
            <Badge showHash={false} variant="destructive" className="absolute top-2 right-2 uppercase text-sm shadow-lg shadow-red-950/80">
              • Live
            </Badge>
          )}
        </div>
        <div className="flex flex-col p-4">
          <h3 className="text-md font-extrabold truncate">
            {twitchData.isLive ? twitchData.stream!.title : twitchData.vod!.title}
          </h3>
          <div className="flex flex-row items-center justify-between gap-2 text-sm opacity-50">
            <p className='truncate'>
              {twitchData.isLive 
                ? `started ${moment(twitchData.stream!.started_at).fromNow()}`
                : `from ${moment(twitchData.vod!.stream_date).fromNow()}`}
            </p>
            <p>
              {twitchData.isLive
                ? `via Twitch`
                : 'via VOD Vault'}
            </p>
          </div>
        </div>
      </div>
    </a>
  )

  return content
}

export default Twitch