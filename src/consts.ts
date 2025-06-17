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

export const SITE: Site = {
  TITLE: 'Lt. Wilson',
  DESCRIPTION:
    'Personal website of a guy that edits videos and occasionally dabbles in coding projects.',
  EMAIL: 'contact@ltwilson.tv',
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_PROJECTS_ON_HOMEPAGE: 5,
  POSTS_PER_PAGE: 8,
  VODS_PER_PAGE: 15,
  SITEURL: 'https://ltwilson.tv',
  TWITCH_USER_ID: 194814599
}