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
  NUM_POSTS_ON_HOMEPAGE: 10,
  POSTS_PER_PAGE: 20,
  SITEURL: 'https://rcw.lol',
}

export const TAGLINES: string[] = [
  'does he even do anything?',
  'NOT a furry. stop asking or suggesting.',
  'his videos arent even that good.',
  'sometimes formerly known as ltwilson.',
  'boat goes binted. - gigi murin',
  'he should finish all his projects maybe.',
  'i bet hes making something dumb right now.',
  'code deez nuts lmao. that wasnt funny.',
  'waiter! waiter! chicken tendies please!!',
  'rawr x3 pounces on you!! uwu whats this?',
  'surely hes up to something...',
  'all of his code breaks. every single time.',
  'a certified professional unprofessional.',
  'yeah id let shiori novella do things to me lol.',
  'bro get a fucking job. like holy shit.'
]

export const SOCIALS: Socials[] = [
  { TITLE: 'YouTube', ICON: 'lucide:youtube', URL: 'https://youtube.com/@rcwowo' },
  { TITLE: 'Twitch', ICON: 'lucide:twitch', URL: 'https://twitch.tv/rcwowo' },
  { TITLE: 'Bluesky', ICON: 'mingcute:bluesky-social-line', URL: 'https://bsky.app/profile/rcw.lol' },
  { TITLE: 'Discord', ICON: 'mingcute:discord-line', URL: 'https://discord.gg/fJtyxttGpq' },
  { TITLE: 'GitLab', ICON: 'lucide:gitlab', URL: 'https://gitlab.com/rcw.lol' }
]

export const MENU_LINKS: Socials[] = [
  { TITLE: 'Blog', URL: '/blog', ICON: 'lucide:rss' },
  { TITLE: 'VOD Vault', URL: 'https://vods.rcw.lol', ICON: 'lucide:tv' },
  { TITLE: 'Source', URL: 'https://gitlab.com/rcw.lol/website', ICON: 'lucide:gitlab' }
]