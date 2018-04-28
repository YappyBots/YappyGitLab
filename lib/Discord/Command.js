const DefaultCommand = require('yappybots-addons').discord.structures.Command;
const { MessageEmbed } = require('discord.js');

/**
* Discord bot command
*/
class Command extends DefaultCommand {
  constructor(...args) {
    super(...args);

    this._path = Log._path;
    this.embed = MessageEmbed;
  }

  errorUsage(msg) {
    return this.commandError(msg, `Correct usage: \`${this.bot.prefix}${this.help.usage}\`\nRun \`${this.bot.prefix}help ${this.help.name}\` for help and examples`, 'Incorrect Usage');
  }
}

module.exports = Command;
