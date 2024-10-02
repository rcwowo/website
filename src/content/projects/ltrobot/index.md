---
name: 'Lt. Robot Chatbot'
description: 'A now archived chat robot for Twitch that allowed me to dynamically add services to interface with in chat commands.'
image: './icon.png'
link: 'https://github.com/theltwilson/ltrobot'
github_repo: 'ltrobot'
---

Back in 2020, I made a chatbot for my Twitch channel that would allow viewers to manipulate with my computer and utilize various other commands that I thought was funny or provided fun interactivity. *However*, the initial project was very poorly structured and didn't have much in terms of expandability.

So in 2021, I decided to make the "**LtRobot Redux**". This project, made in JavaScript with NodeJS, was designed to cross the bridge between Twitch and Discord, and had more modular expandability for commands.

The entire appeal of this chatbot was being able to add custom modules that moderators could use in new commands. Here are some examples of commands that could be in the database:

| Trigger | Response | Chat Message |
| --- | --- | --- |
| !discord | @{{displayname}}, join the community Discord at https://discord.gg/fJtyxttGpq | @TheLtWilson, join the community Discord at https://discord.gg/fJtyxttGpq |
| !song | @{{displayname}} - Last played song: {{lastfm LtWilsonYT}} | @TheLtWilson - Last played song: Cheerleader - Porter Robinson |

This project was discontinued and archived back in 2023, but at the time was one of the first coding projects that I had dedicated my time to and essentially got fully working.