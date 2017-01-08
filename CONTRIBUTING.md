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
