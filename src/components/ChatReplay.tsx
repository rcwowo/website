import { useEffect, useRef, useState } from 'react'
import { buttonVariants } from './ui/button'

interface ChatComment {
  _id: string
  created_at: string
  content_offset_seconds: number
  commenter: {
    display_name: string
    name: string
    logo?: string
  }
  message: {
    body: string
    user_color?: string
    user_badges?: Array<{
      _id: string
      version: string
    }>
  }
}

interface ChatData {
  comments: ChatComment[]
  video: {
    title: string
    created_at: string
    length: number
  }
}

interface ChatReplayProps {
  chatReplayURL: string
  youtubeId: string | undefined
}

interface YouTubePlayer {
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, any>;
          events?: Record<string, (event: YouTubeEvent) => void>;
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function ChatReplay({ chatReplayURL, youtubeId }: ChatReplayProps) {
  const [comments, setComments] = useState<ChatComment[]>([])
  const [visibleComments, setVisibleComments] = useState<ChatComment[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [userScrolled, setUserScrolled] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const MAX_VISIBLE_MESSAGES = 200

  // Load chat messages
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(chatReplayURL)
        const data: ChatData = await response.json()
        setComments(data.comments.sort((a, b) => a.content_offset_seconds - b.content_offset_seconds))
      } catch (error) {
        console.error('Error loading chat messages:', error)
      }
    }
    fetchComments()
  }, [chatReplayURL])

  // Initialize YouTube Player API
  useEffect(() => {
    if (!youtubeId) return;

    const iframeId = `youtube-player-${youtubeId}`;
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(iframeId, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          enablejsapi: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onStateChange: (event: YouTubeEvent) => {
            if (event.data === 1) { // Playing
              const updateTime = () => {
                if (playerRef.current) {
                  const time = playerRef.current.getCurrentTime();
                  setCurrentTime(time);
                  requestAnimationFrame(updateTime);
                }
              };
              updateTime();
            }
          }
        }
      });
    };

    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT) {
          resolve();
          return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
      });
    };

    loadYouTubeAPI().then(initPlayer);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [youtubeId]);

  // Update visible messages based on current time
  useEffect(() => {
    const visibleComments = comments
      .filter(comment => comment.content_offset_seconds <= currentTime)
      .slice(-MAX_VISIBLE_MESSAGES);
    setVisibleComments(visibleComments);

    // Auto-scroll to bottom only if user hasn't scrolled up
    if (chatContainerRef.current && !userScrolled) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentTime, comments, userScrolled]);

  // Handle scroll events
  const handleScroll = () => {
    if (!chatContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 5

    // Update userScrolled state based on scroll position
    setUserScrolled(!isAtBottom)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold">Chat Replay</h3>
        {userScrolled && (
          <button
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
            onClick={() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }}
          >
            Scrolling Paused
          </button>
        )}
      </div>
      <div 
        ref={chatContainerRef}
        className="grow overflow-y-auto p-4 space-y-2"
        onScroll={handleScroll}
      >
        {visibleComments.map((comment) => (
          <div key={comment._id} className="leading-tight text-sm break-words">
            <span 
              className="font-semibold"
              style={{ color: comment.message.user_color || 'inherit' }}
            >
              {comment.commenter.display_name}
            </span>{': '}
            <span>{comment.message.body}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
