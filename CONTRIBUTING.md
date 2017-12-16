# Contributing to Yappy GitLab

### Clone repo

```sh
$ git clone https://github.com/YappyBots/YappyGitlab.git
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

The following settings are required:
- `DISCORD_TOKEN`
- `DB_URL`
  - Use `mongodb://yappy:gitlab@ds157298.mlab.com:57298/yappy_gitlab_contributors` for testing
- `DISCORD_CLIENT_ID` (for the web dashboard)
- `DISCORD_CLIENT_SECRET` (for the web dashboard)

Yappy GitLab also needs to be run with NodeJS v8 or higher.
A few examples on running the bot:

```sh
$ node lib/index.js
$ npm start
$ nodemon # if
```
