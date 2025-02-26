interface Badge {
  id: string;
  version: string;
  imageUrl: string;
  title: string;
}

export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  NUM_PROJECTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  VODS_PER_PAGE: number
  SITEURL: string
  TWITCH_USER_ID: number
}

export type Link = {
  href: string
  label: string
}

export const SITE: Site = {
  TITLE: 'Lt. Wilson',
  DESCRIPTION:
    'Personal website of a guy that edits videos and occasionally dabbles in coding projects.',
  EMAIL: 'contact@ltwilson.tv',
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_PROJECTS_ON_HOMEPAGE: 4,
  POSTS_PER_PAGE: 8,
  VODS_PER_PAGE: 15,
  SITEURL: 'https://ltwilson.tv',
  TWITCH_USER_ID: 194814599
}

export const NAV_LINKS: Link[] = [
  { href: 'https://streamelements.com/theltwilson/tip', label: 'donate' },
  { href: '/blog', label: 'blog' },
  { href: '/projects', label: 'projects' },
  { href: '/vods', label: 'VODs'}
]

export const FOOTER_LINKS: Link[] = [
  { href: 'contact@ltwilson.tv', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
]


export const BADGES: Record<string, Badge> = {
  moderator: {
    id: 'moderator',
    version: '1',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
    title: 'Moderator',
  },
  vip: {
    id: 'vip',
    version: '1',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
    title: 'VIP',
  },
};

export type BadgeId = keyof typeof BADGES;