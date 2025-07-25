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

  return next()
}
