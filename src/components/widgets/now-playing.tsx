import { useState, useEffect, useRef } from 'react'
import { Music } from 'lucide-react'
import moment from 'moment'

type Song = {
  name: string
  artist: string
  album: string
  cover_image_url: string
  url: string
  timestamp: number | undefined
}

function NowPlaying() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [lastPlayed, setLastPlayed] = useState<Song | null>(null)
  const [isError, setIsError] = useState<boolean>(false)
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('https://n8n.lab.rcw.lol/webhook/spotify-status')
        const data = await response.json()
        console.log("Song data", data)
        setIsPlaying(data.isPlaying)
        setLastPlayed(data.song)
      } catch (error) {
        setIsError(true)
        console.error('Failed to fetch now playing:', error)
      }
    }

    fetchNowPlaying()
  }, [])

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const textWidth = textRef.current.scrollWidth
        setIsOverflowing(textWidth > containerWidth)
      }
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [lastPlayed])

  return (
    <div className='flex items-center justify-between text-xs w-full gap-4'>
      {/* Song Status or Timestamp */}
      <div className='flex items-center gap-2 opacity-50 z-10'>
        {isError ? (
          <>
            <Music size={13} />
            <span>Music</span>
          </>
        ) : isPlaying && !lastPlayed?.timestamp ? (
          <>
            <Music size={13} className='text-green-500 animate-pulse' />
            <span className='text-green-500 font-bold animate-pulse whitespace-nowrap hidden md:block'>Now Playing</span>
          </>
        ) : (
          <>
            <Music size={13} />
            <span className='whitespace-nowrap'>
              {lastPlayed?.timestamp !== undefined
                ? moment(lastPlayed.timestamp * 1000).fromNow()
                : 'Music'}
            </span>
          </>
        )}
      </div>

      {/* Song Info */}
      <div ref={containerRef} className='absolute left-1/2 -translate-x-1/2 flex items-center justify-center overflow-hidden max-w-[60%]'>
        {isError ? (
          <span>??? - ???</span>
        ) : isOverflowing ? (
          <div className='relative flex overflow-x-hidden w-full'>
            <div className='animate-marquee whitespace-nowrap'>
              <a href={lastPlayed?.url ?? '#'} className='mx-2 font-medium'>
                {lastPlayed?.name} - {lastPlayed?.artist}
              </a>
            </div>
            <div className='animate-marquee2 whitespace-nowrap absolute top-0'>
              <a href={lastPlayed?.url ?? '#'} className='mx-2 font-medium'>
                {lastPlayed?.name} - {lastPlayed?.artist}
              </a>
            </div>
          </div>
        ) : (
          <a href={lastPlayed?.url ?? '#'} className='font-medium truncate'>
            {lastPlayed?.name} - {lastPlayed?.artist}
          </a>
        )}
      </div>

      {/* Via Platform */}
      <div className='items-center opacity-50 z-10 hidden md:flex'>
        <span className='whitespace-nowrap'>via LastFM</span>
      </div>
    </div>
  )
}

export default NowPlaying