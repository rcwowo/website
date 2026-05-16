import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge class names into a single string. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** First path segment of a glob content id (e.g. `chatvoice/chatvoice` -> `chatvoice`). */
export function projectSlugFromId(id: string) {
  const segment = id.split('/')[0]
  return segment && segment.length > 0 ? segment : id
}