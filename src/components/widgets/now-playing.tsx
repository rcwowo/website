import { useState, useEffect } from 'react'
import { LoaderCircle } from 'lucide-react'

type Song = {
  name: string
  artist: string
  album: string
  cover_image_url: string
  url: string
}

function NowPlaying() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [lastPlayed, setLastPlayed] = useState<Song | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch(
          'https://n8n.ltwilson.tv/webhook/spotify-status',
        )
        const data = await response.json()
        setIsPlaying(data.isPlaying)
        setLastPlayed(data.song)
      } catch (error) {
        setIsError(true)
        console.error('Failed to fetch now playing:', error)
      }
    }

    fetchNowPlaying()
  }, [])

  // If there is no data yet, we shall load
  if (!lastPlayed) {
    return (
      <div className="text-center">
        <LoaderCircle className="animate-spin" />
      </div>
    )
    // If theres an error, i guess we'll account for that
  } else if (isError) {
    return <div>An error occurred.</div>
    // Show da song if we has it
  } else {
    return (
      <a href={lastPlayed.url} target="_blank">
        <div className="flex items-center gap-3">
          <img
            src={lastPlayed.cover_image_url}
            alt={lastPlayed.name}
            className="h-12 w-12 rounded-lg"
          />
          <div className="flex flex-col leading-tight min-w-0">
            <h3 className="text-md font-extrabold truncate">{lastPlayed.name}</h3>
            <p className="text-xs font-bold opacity-50 truncate">{lastPlayed.artist}</p>
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          { isPlaying === true ? (
            <p className="text-green-500 font-bold animate-pulse">•&nbsp;Now Playing</p>
          ) : (
            <p className="opacity-50">Last Played</p>
          )}
          <p className="opacity-30">via LastFM</p>
        </div>
      </a>
    )
  }
}

export default NowPlaying