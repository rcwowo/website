import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { SiTwitch } from '@icons-pack/react-simple-icons'
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
        const response = await fetch('https://n8n.ltwilson.tv/webhook/twitch-status')
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
      <div className="flex flex-row gap-2 opacity-50 items-center justify-center">
        <Info size={18} />
        Twitch data unavailable.
      </div>
    )
  }

  if (!twitchData) {
    return (
      <div className="flex flex-col p-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        </div>
      </div>
    )
  }

  const content = twitchData.isLive ? (
    // Live stream content
    <a href="https://twitch.tv/theltwilson" target="_blank" className="flex flex-col overflow-hidden transition-colors border-white/25 border rounded-xl hover:bg-primary/10">
      <div className="flex flex-col">
        <img
          src={twitchData.stream!.thumbnail_url.replace('{width}', '1280').replace('{height}', '720')}
          alt={twitchData.stream!.title}
          className="w-full aspect-video object-cover"
        />
        <div className="flex flex-col p-4 truncate">
          <h3 className="text-lg font-extrabold line-clamp-2">{twitchData.stream!.title}</h3>
          <div className="flex flex-row text-sm items-center opacity-50 gap-2">
            <SiTwitch size="16" className="min-w-4" />
            <p>Live now • {twitchData.stream!.viewer_count} viewers • Playing {twitchData.stream!.game_name}</p>
          </div>
        </div>
      </div>
    </a>
  ) : (
    // VOD content
    <a href={twitchData.vod!.url} target="_blank" className="flex flex-col overflow-hidden transition-colors border-white/25 border rounded-xl hover:bg-primary/10">
      <div className="flex flex-col">
        <img
          src={twitchData.vod!.thumbnail_url}
          alt={twitchData.vod!.title}
          className="w-full aspect-video object-cover"
        />
        <div className="flex flex-col p-4 truncate">
          <h3 className="text-lg font-extrabold line-clamp-2">{twitchData.vod!.title}</h3>
          <div className="flex flex-row text-sm items-center opacity-50 gap-2">
            <SiTwitch size="16" className='min-w-4' />
            <p>Streamed {moment(twitchData.vod!.stream_date).fromNow()} • {twitchData.vod!.game_name}</p>
          </div>
        </div>
      </div>
    </a>
  )

  return content
}

export default Twitch
