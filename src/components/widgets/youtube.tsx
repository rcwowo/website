import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { SiYoutube } from '@icons-pack/react-simple-icons'
import { Skeleton } from '../ui/skeleton'
import moment from 'moment'

type Video = {
  video_name: string
  published: string
  id: string
  url: string
}

function YouTube() {
  const [latestVideo, setLatestVideo] = useState<Video | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        const response = await fetch('https://n8n.ltwilson.tv/webhook/youtube-status')
        const data = await response.json()
        setLatestVideo(data)
      } catch (error) {
        setIsError(true)
        console.error('Failed to fetch latest video:', error)
      }
    }

    fetchLatestVideo()
  }, [])

  if (isError) {
    return (
      <div className="flex flex-row gap-2 opacity-50 items-center justify-center">
        <Info size={18} />
        YouTube data unavailable.
      </div>
    )
  }

  if (!latestVideo) {
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

  const thumbnailUrl = `https://i.ytimg.com/vi/${latestVideo.id}/maxresdefault.jpg`

  return (
    <a href={latestVideo.url} target="_blank" className="flex flex-col overflow-hidden max-w-[50%] transition-colors border-white/25 border rounded-xl hover:bg-primary/10">
      <div className="flex flex-col">
        <img
          src={thumbnailUrl}
          alt={latestVideo.video_name}
          className="w-full aspect-video object-cover"
        />
        <div className="flex flex-col p-4">
            <h3 className="text-lg font-extrabold line-clamp-1">{latestVideo.video_name}</h3>
            <div className="flex flex-row text-sm items-center opacity-50 gap-2">
                <SiYoutube size="16" className='min-w-4' />
                <p>{moment(latestVideo.published).fromNow()}</p>
            </div>
        </div>
      </div>
    </a>
  )
}

export default YouTube
