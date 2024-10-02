---
name: 'Wave Link Key Wrapper'
description: "A project that hooks into Elgato's Wave Link software to make audio control easier and more visual, also includes some documentation."
image: './icon.png'
link: 'https://github.com/theltwilson/wave-link-key-wrapper'
license: 'MIT License'
github_repo: 'wave-link-key-wrapper'
---

This is a Python script that allows you to turn keys on your keyboard into volume controls for Elgato's Wave Link software, and displays a simple popup of the current volume level. In order to make Elgato's Wave Link software more visual and easier to manipulate.

I actually wrote a blog post about the entire process it took to make it [here](/blog/2024/wave-link-key-wrapper)

Elgato leaves a websocket open, currently on port `1824`, that is intended to be used to communicate between their Wave Link and Stream Deck software. I utilize this websocket connection to send actions based upon whatever the current volume or mute status is.

For more information on how to use the project, head over to the [repo](https://github.com/theltwilson/wave-link-key-wrapper) and look at the README for more instructions, and information on how the project functions.