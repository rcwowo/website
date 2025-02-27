import { type FC } from 'react';
import type { SeventvEmoteProps } from './types';

export const SeventvEmote: FC<SeventvEmoteProps> = ({ emoteId, text }) => {
  // 7TV CDN URL for emotes
  const emoteUrl = `https://cdn.7tv.app/emote/${emoteId}/1x.webp`;

  return (
    <img
      src={emoteUrl}
      alt={text}
      title={text}
      className="inline-block h-6 -my-1 w-auto"
      loading="lazy"
    />
  );
};