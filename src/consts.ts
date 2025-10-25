export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  VODS_PER_PAGE: number
  SITEURL: string
}

export type Socials = {
  TITLE: string,
  ICON: string,
  URL: string
}

export const SITE: Site = {
  TITLE: 'rcw.lol',
  DESCRIPTION:
    'Personal website of a guy that edits videos and occasionally dabbles in coding projects.',
  EMAIL: 'contact@ltwilson.tv',
  NUM_POSTS_ON_HOMEPAGE: 7,
  POSTS_PER_PAGE: 8,
  VODS_PER_PAGE: 15,
  SITEURL: 'https://rcw.lol',
}

export const SOCIALS: Socials[] = [
  { TITLE: 'YouTube', ICON: 'lucide:youtube', URL: 'https://youtube.com/@rcwowo' },
  { TITLE: 'Twitch', ICON: 'lucide:twitch', URL: 'https://twitch.tv/rcwowo' },
  { TITLE: 'Bluesky', ICON: 'mingcute:bluesky-social-line', URL: 'https://bsky.app/profile/rcw.lol' },
  { TITLE: 'Discord', ICON: 'mingcute:discord-line', URL: 'https://discord.gg/fJtyxttGpq' },
  { TITLE: 'GitHub', ICON: 'lucide:github', URL: 'https://github.com/rcwowo'}
]