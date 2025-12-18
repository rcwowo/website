export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
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
  EMAIL: 'riley@rcw.lol',
  NUM_POSTS_ON_HOMEPAGE: 7,
  POSTS_PER_PAGE: 10,
  SITEURL: 'https://rcw.lol',
}

export const SOCIALS: Socials[] = [
  { TITLE: 'YouTube', ICON: 'lucide:youtube', URL: 'https://youtube.com/@rcwowo' },
  { TITLE: 'Twitch', ICON: 'lucide:twitch', URL: 'https://twitch.tv/rcwowo' },
  { TITLE: 'Bluesky', ICON: 'mingcute:bluesky-social-line', URL: 'https://bsky.app/profile/rcw.lol' },
  { TITLE: 'Discord', ICON: 'mingcute:discord-line', URL: 'https://discord.gg/fJtyxttGpq' },
  { TITLE: 'GitLab', ICON: 'lucide:gitlab', URL: 'https://gitlab.com/rcw.lol' }
]

export const FOOTER_LINKS: Socials[] = [
  { TITLE: 'Source Code', URL: 'https://gitlab.com/rcw.lol/website', ICON: 'lucide:git-graph' },
  { TITLE: 'RSS', URL: '/rss.xml', ICON: 'lucide:rss' }
]