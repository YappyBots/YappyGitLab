const Discord = require('discord.js');
const DiscordClient = Discord.Client;
const ChannelConfig = require('../Models/ChannelConfig');
const fs = require('fs');
const Log = require('../Util/Log');

class Client extends DiscordClient {

  constructor(opts = {}, ...args) {
    super(opts, ...args);

    this.commands = new Discord.Collection();
    this.middleware = new Discord.Collection();
    this.aliases = new Discord.Collection();

    this.prefix = opts.prefix;
    this.name = opts.name || 'Unknown';
    this.config = {
      owner: opts.owner,
    };
  }

  login(...args) {
    return super.login(...args);
  }

  loadCommands(cwd) {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        this.emit('error', err);
        return this;
      }

      if (!files.length) {
        Log.info(`Command | No Commands Loaded.`);
        return this;
      }

      files.forEach(f => {
        try {
          let Command = require(`./Commands/${f}`);

          Command = new Command(this);
          Log.info(`Command | Loading ${Command.help.name}. 👌`);
          Command.props.help.file = f;

          this.commands.set(Command.help.name, Command);

          Command.conf.aliases.forEach(alias => {
            this.aliases.set(alias, Command.help.name);
          });
        } catch (error) {
          this.emit('error', `Command | ${f}`, error);
        }
      });
      return this;
    });
  }

  loadModules(cwd) {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        this.emit('error', err);
        return this;
      }

      if (!files.length) {
        Log.info(`Module | No Modules Loaded.`);
        return this;
      }

      files.forEach(f => {
        try {
          const module = new (require(`./Modules/${f}`))(this);
          const name = module.constructor.name.replace('Module', '');

          Log.info(`Module | Loading ${name}. 👌`);

          this.middleware.set(name, module);
        } catch (error) {
          this.emit('error', `Module | ${f}`, error);
        }
      });
      return this;
    });
  }

  reloadCommand(command) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`./Commands/${command}`)];
        Log.info(`Command | Reloading ${command} 👌`);
        let cmd = require(`./Commands/${command}`);
        let Command = new cmd(this);
        Command.props.help.file = command;
        this.commands.set(Command.help.name, Command);
        Command.conf.aliases.forEach(alias => {
          this.aliases.set(alias, Command.help.name);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async reloadFile(file) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(file)];
        let thing = require(file);
        resolve(thing);
      } catch (e) {
        reject(e);
      }
    });
  }

  runCommand(msg) {
    if (msg.author.equals(this.user) || msg.author.bot) return;
    let channelConf = ChannelConfig.FindByChannel(msg.channel.id) || {};
    let prefix = channelConf.prefix || Math.random();
    if (!msg.content.startsWith(this.user.toString()) && !msg.content.startsWith(prefix) && !msg.content.startsWith(this.prefix)) return false;

    let content = (msg.content.startsWith(prefix) && msg.content.replace(prefix, '')) || (msg.content.startsWith(this.user.toString()) && msg.content.replace(`${this.user.toString()} `, '')) || (msg.content.startsWith(this.prefix) && msg.content.replace(this.prefix, '')) || msg.content;
    let command = content.split(' ')[0].toLowerCase();
    let args = content.split(' ').slice(1);

    let middleware = this.middleware.array().sort((a, b) => b.priority - a.priority);
    let i = 0;

    const next = (err) => {
      let currentMiddleware = middleware[i] || middleware[i - 1];
      let nextMiddleware = middleware[i++];
      if (err) return msg.channel.sendMessage([`❌ An unexpected error occurred when trying to run middleware \`${currentMiddleware.constructor.name}\``, `\`${err}\``]);
      if (nextMiddleware) nextMiddleware.run(msg, args, next, command);
    };

    next();

    return this;
  }

  commandError(msg, cmd, err) {
    this.emit('error', err);
    return msg.channel.sendMessage([
      `❌ An unexpected error occurred when trying to run command \`${cmd.help.name}\``,
      `\`${err}\``,
    ]).catch(() => {
      if (err && typeof err === 'object' && err.response) err = err.response ? err.response.body || err.response.text : err.stack;
      if (err && typeof err === 'object' && err.content) err = `Discord - ${err.content ? err.content[0] : err.message}`;
      if (err && typeof err === 'object' && err.code && err.message) err = err.message;

      msg.guild.owner.sendMessage([
        `❌ An unexpected error occurred when trying to run command \`${cmd.help.name}\` in ${msg.channel}`,
        `\`${err}\``,
      ]);
    });
  }

  permissions(msg) {
    /* This function should resolve to an ELEVATION level which
    is then sent to the command handler for verification*/
    let permlvl = 0;

    if (msg.member && msg.member.hasPermission(`ADMINISTRATOR`)) permlvl = 1;
    if (this.config.owner === msg.author.id) permlvl = 2;

    return permlvl;
  }

  generateArgs(strOrArgs = '') {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
    let y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
    if (y === null) return str.split(' ');
    return y.map(e => e.replace(/'/g, ``));
  }

  embed(title, text, color, fields) {
    let embed = {
      title,
      description: text,
      color: color ? parseInt(`0x${color}`, 16) : `0x${color}`,
      fields: [],
    };
    if (fields && !Array.isArray(fields)) {
      Object.keys(fields).forEach(fieldName => {
        embed.fields.push({
          name: fieldName,
          value: fields[fieldName],
        });
      });
    } else if (fields && Array.isArray(fields)) {
      embed.fields = fields;
    }
    return embed;
  }
}

module.exports = Client;
