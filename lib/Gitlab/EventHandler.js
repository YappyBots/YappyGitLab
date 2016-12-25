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

  async setGitlab(gitlab) {
    this.gitlab = gitlab;
  }

  async setup() {
    fs.readdir(this.eventDir, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
        let eventName = file.replace(`.js`, ``);
        try {
          let event = require(`./Events/${eventName}`);
          this.eventsList.set(eventName, new event(this.gitlab, this.bot));
          Log.info(`GitHub | Loading Event ${eventName.replace(`-`, `/`)} 👌`);
        } catch (e) {
          Log.info(`GitHub | Loading Event ${eventName} ❌`);
          Log.error(e);
        }
      });

      return;
    });
  }

  use(data, eventName, choice = 'channel') {
    const action = data.object_attributes && data.object_attribute.action ? data.object_attribute.action : '';
    eventName = eventName.replace(` Hook`, '').replace(/ /g, '_').toLowerCase();
    let event = action ? `${eventName}-${action}` : eventName;
    try {
      event = this.eventsList.get(event) || this.eventsList.get('Unknown');
      if (choice === 'channel') {
        let text = event.text(data, eventName, action);
        return Array.isArray(text) ? text.join('\n') : text;
      }
      let embedContent = event.embed(data, eventName, action);
      return this.parseEmbed(embedContent, data);
    } catch (e) {
      Log.error(e);
    }
  }

  parseEmbed(embed, data) {
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
        if (embed.color) embed.color = parseInt(`0x${embed.color.replace(`0x`, ``)}`, 16);
        break;
    }
    embed.author = {
      name: data.user_name,
      icon_url: data.user_avatar || null,
    };
    embed.footer = {
      text: data.project.path_with_namespace,
    };
    embed.url = embed.url || data.project.web_url;
    embed.timestamp = new Date();
    return embed;
  }
}

module.exports = new Events();
