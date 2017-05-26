# Yappy, the GitLab Monitor

Monitor your GitLab repos by adding this bot to your server, set up a channel for it, and don't miss any events!

[![Online Users in Yappy's Discord Server](https://discordapp.com/api/guilds/231548941492027393/embed.png)](https://discord.gg/HHqndMG)

### Help

Join our Discord server at https://discord.gg/HHqndMG

### Commands
Prefixes are `GL! ` (with space), custom prefix set up, or mention the bot.

__**Util**__:
  - `help` - a help command... yeah :P
  - `invite` - how to invite the bot and set up github events!
  - `clean` - cleans the bot's messages found in the last 100 messages
  - `ping` - uh... ping? pong!
  - `stats` - shows the stats of the bot... what else?

__**Github**__:
  - `issues search <query> [p#]` - search issues by any field in the channel repo
  - `issue <number>` - gives info about that specific issue in the channel repo
  - `mr list [p#]` - list merge requests by any field in the channel repo
  - `mr <number>` - gives info about that specific merge request in the channel repo
  <!-- - `release <query>` - gives info about a release that matches that query in its tag in the channel repo --!>

__**Admin**__:
  - `conf [view]` - views the channel's config
  - `conf get <key>` - gets a specific config key in the channel's config
  - `conf set <key> [value]` - sets the key to the value, `repo`'s value may be none to disable
  - `conf -g [view/set/get] [key] [value]` - view/get/set global config (using `-g`)
  - `init <repo> [private]` - initialize repo events on channel
  - `remove [repo]` - remove repo events on channel
