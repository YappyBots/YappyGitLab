# Contributing to Yappy GitLab

### Clone repo

```sh
$ cd folder/where/i/want/bot
$ git clone https://github.com/datitisev/DiscordBot-YappyGitLab.git
```

### Linting

Please use an ESLint plugin for your editor, and use the current configuration (located in `.eslintrc`).

### GitLab Events

The different [GitLab events](http://docs.gitlab.com/ce/web_hooks/web_hooks.html) each have their own name, followed by " Hook".

An event may have an action. For example, the event can be an `issue` event, and the action may be `open`.
The file that will be read for the styling of the event is `EVENT-ACTION.js`, everything being lowercase.
If the event has a space in its actual name, like "Tag Push Hook", the corresponding file would be called `tag_push.js`, replacing the space with `_`.

### Starting the bot

Yappy GitLab needs the following environment variables:

- **REQUIRED** `YAPPY_GITLAB_DISCORD` - discord bot token
- **REQUIRED** `YAPPY_GITLAB_MONGODB` - a MongoDB database to insert data, use `mongodb://yappy:gitlab@ds157298.mlab.com:57298/yappy_gitlab_contributors` for testing :)
- **OPTIONAL** `GITLAB_TOKEN` - a gitlab token to.... do nothing atm ^\_\^

Yappy GitLab also needs to be run with NodeJS v7 and the `--harmony` flag.
An example on running the bot:

```sh
$ YAPPY_GITLAB_DISCORD=iLikeTokens YAPPY_GITLAB_MONGODB=youDoNotWantToSeeThisAgain node --harmony lib/index.js
```
