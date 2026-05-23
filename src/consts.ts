// Types
export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  SITEURL: string
}

export type Socials = {
  TITLE: string,
  ICON: string,
  URL: string
}

// Site Configuration
export const SITE: Site = {
  TITLE: 'rcw.lol',
  DESCRIPTION:
    'Personal website of a guy that edits videos and occasionally dabbles in coding projects.',
  EMAIL: 'riley@rcw.lol',
  SITEURL: 'https://rcw.lol',
}

// Random Taglines
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
  'bro get a fucking job. like holy shit.',
  'does he actually watch vtubers or is it a bit?',
  'no way this mf actually uses bluesky im crine',
  'lowkey some furries are kinda cool',
  'i am NOT a femboy and never will be!!!!',
  'he might be a ginger but at least hes not bald',
  'i saw porter robinson on 9/11. i swear to god',
  'why did ninajirachi wanna fuck her computer...?',
  'praying on his downfall lol',
  'im thinking miku miku oo ee oo',
  'how many taglines did he write for this shit?',
  'this mf likes pans im crineeee',
  'its not like i like u... baka... (˶˃⤙˂˶)',
  '(˶˃ ᵕ ˂˶) .ᐟ.ᐟ'
]

// Social Links
export const SOCIALS: Socials[] = [
  { TITLE: 'YouTube', ICON: 'lucide:youtube', URL: 'https://youtube.com/@rcwowo' },
  { TITLE: 'Twitch', ICON: 'lucide:twitch', URL: 'https://twitch.tv/rcwowo' },
  { TITLE: 'Bluesky', ICON: 'mingcute:bluesky-social-line', URL: 'https://bsky.app/profile/rcw.lol' },
  { TITLE: 'Discord', ICON: 'mingcute:discord-line', URL: 'https://discord.gg/fJtyxttGpq' },
  { TITLE: 'GitLab', ICON: 'lucide:gitlab', URL: 'https://gitlab.com/rcw.lol' },
  { TITLE: 'Contact', ICON: 'lucide:mail', URL: 'mailto:riley@rcw.lol' }
]

// Global Menu Links
export const MENU_LINKS: Socials[] = [
  { TITLE: 'owoTV', URL: 'https://owo.rcw.lol', ICON: 'lucide:tv' },
  { TITLE: 'Blog', URL: 'https://blog.rcw.lol', ICON: 'lucide:rss' },
]

// Lanyard Discord Integration
export const DISCORD_USER_ID: string = '232200842894114826'

// Leaflet Blog Integration
export const BLOG_URL = 'https://blog.rcw.lol'
export const BLOG_PUBLICATION_URI = 'at://did:plc:siwlk4jbqorvg5iytyxgsz4z/site.standard.publication/3m63i53un522d'
export const BLOG_AUTHOR_DID = 'did:plc:siwlk4jbqorvg5iytyxgsz4z'
export const BLOG_PDS = 'https://lionsmane.us-east.host.bsky.network'
export const NUM_POSTS_ON_HOMEPAGE = 5