import type { MiddlewareHandler } from 'astro'

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url)

  // redirect old vods to dedicated vod site
  if (url.pathname.startsWith('/vods/watch/')) {
    const slug = url.pathname.replace('/vods/watch/', '')
    return context.redirect(`https://vods.ltwilson.tv/watch/${slug}`, 301)
  }

  if (url.pathname === '/vods') {
    return context.redirect('https://vods.ltwilson.tv', 301)
  }

  // social media redirects
  switch (url.pathname) {
    case '/youtube':
      return context.redirect('https://youtube.com/@theltwilson', 301)
    case '/twitch':
      return context.redirect('https://twitch.tv/theltwilson', 301)
    case '/discord':
      return context.redirect('https://discord.gg/fJtyxttGpq', 301)
    case '/github':
      return context.redirect('https://github.com/theltwilson', 301)
    default:
      break;
  }
  
  return next()
}
