const Collection = require('discord.js').Collection;
const bot = require('../Discord/index.js');
const fs = require('fs');
const path = require('path');
const Log = require('../Util/Log');

class Events {
  constructor() {
    this.events = {};
    this.eventDir = path.resolve(__dirname, './Events');
    this.eventsList = new Collection();

    this.bot = bot;
    this.setup();
  }

  setGitlab(gitlab) {
    this.gitlab = gitlab;
  }

  setup() {
    fs.readdir(this.eventDir, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        let eventName = file.replace(`.js`, ``);
        try {
          let event = require(`./Events/${eventName}`);
          this.eventsList.set(eventName, new event(this.gitlab, this.bot));
          Log.debug(`GitHub | Loading Event ${eventName.replace(`-`, `/`)} 👌`);
        } catch (e) {
          Log.error(`GitHub | Loading Event ${eventName} ❌`);
          Log.error(e);
        }
      });

      return;
    });
  }

  use(data, eventName) {
    const action = data.object_attributes ? data.object_attributes.action : '';
    const noteableType = data.object_attributes && data.object_attributes.noteable_type ? data.object_attributes.noteable_type.toLowerCase() : '';
    eventName = eventName.replace(` Hook`, '').replace(/ /g, '_').toLowerCase();
    let event = action || noteableType ? `${eventName}-${action || noteableType}` : eventName;
    try {
      event = this.eventsList.get(event) || this.eventsList.get('Unknown');
      let text = event.text(data, eventName, action);
      return {
        embed: this.parseEmbed(event.embed(data, eventName, action), data),
        text: Array.isArray(text) ? text.join('\n') : text,
      };
    } catch (e) {
      Log.error(e);
    }
  }

  parseEmbed(embed, data) {
    if (!embed) return null;

    switch (embed.color) {
      case 'success':
        embed.color = 0x3CA553;
        break;
      case 'warning':
        embed.color = 0xFB5432;
        break;
      case 'danger':
      case 'error':
        embed.color = 0xCE0814;
        break;
      default:
        if (embed.color) embed.color = typeof embed.color === 'string' ? parseInt(`0x${embed.color.replace(`0x`, ``)}`, 16) : embed.color;
        break;
    }
    const avatar = data.user ? data.user.avatar_url : data.user_avatar;

    embed.author = {
      name: data.user ? data.user.username : data.user_username || data.user_name,
      icon_url: avatar && avatar.startsWith('/') ? `https://gitlab.com${avatar}` : avatar,
    };
    embed.footer = {
      text: data.project.path_with_namespace,
    };
    embed.url = embed.url || (data.object_attributes && data.object_attributes.url) || (data.project && data.project.web_url);
    embed.timestamp = new Date();

    if (embed.description) embed.description = embed.description.slice(0, 1000) + (embed.description.length > 1000 ? '...' : '');

    return embed;
  }
}

module.exports = new Events();
