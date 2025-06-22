![Showcase Card](/public/static/twitter-card.webp)

<div align="center">

# The Lt. Wilson Website
My personal website and blog, made with Astro.

</div>

## About this repo.

This is the source code for my website and blog, originally derived from the [astro-eudite](https://github.com/jktrn/astro-erudite) template. It has been pretty heavily modified to fit it's own aesthetic and for my own purposes.

With the **2.0.0** release of the website, a lot of the website and other things have changed to better reflect what I truly want out of the website. Such as:  

* Changed and added more colorful theming.
* Removed a lot of things I didn't like or need, like tags, authors, projects, and comments.
* Moved the previous VOD archival functionality to it's [own website](https://vods.ltwilson.tv) and [repository](https://github.com/theltwilson/vod-archive).

And of course, this project is open source and available under the [MIT License](LICENSE) - modify and shape it to be yours!

## What's next?

Right now, I have released a basic version that I still consider "under development" that includes the blog and the new theming. But I have a lot of features that I want to add in the future.

Here's what's potentially next:

* The return of projects in a smaller form factor.
* More widgets on the main page, such as:
    * ☐ Status indicator - am I online, or live?
    * ☐ Now playing - what am or was I listening to?
    * ☐ Shop widget - very work-in-progress.
    * ☐ Webring - showcase other cool sites.
    * ☐ Latest from me - videos, VODs, etc.

I would like the home page to be a quick and easy way to get to know me, without having to look around elsewhere to figure it out. While I don't have the same artistic or programming skills to make a page like this, I want to make something like [dimden's website](https://dimden.dev).

## How do I modify this?

I will not be providing support for forks of the project, as the license suggests, this project is as-is. However, if there is a bug, please report it and I will do my best to attend to it.

That being said, development is super easy. Follow these steps:

```sh
# Clone the repo
git clone https://github.com/theltwilson/website

# Install dependencies
cd /website && bun install

# Run the test server
bun dev
```