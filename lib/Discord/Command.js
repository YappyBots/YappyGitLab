const MergeDefault = require('../Util/MergeDefault');
const Discord = require('discord.js');
const default_help = (command) => {
  if (!command) return {};
  /**
  * The command's help
  * @typedef {object} CommandHelp
  * @property {string} name           - command's name
  * @property {string} summary        - command's summary
  * @property {string} description    - command's description
  * @property {string} usage         - command's usage
  * @property {string[]} examples     - command's usage examples
  */
  return {
    name: command ? command.name : 'null',
    description: `Description for ${command ? command.name : 'null'}`,
    usage: command ? command.name : 'null',
  };
};
/**
* The command's config
* @typedef {object} CommandConfig
* @property {boolean} enabled   - is command enabled
* @property {boolean} guildOnly - is command guild only
* @property {string[]} aliases  - command's aliases
* @property {number} permLevel  - command's perm level; 0 - everyone, 1 - admin, 2 - owner
*/
const default_conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
};

/**
* Discord bot command
*/
class Command {
  /**
  * @param {Client} bot - discord bot
  */
  constructor(bot) {
    this.bot = bot;
    this.props = {};
    this._path = Log._path;
    this.embed = Discord.RichEmbed;
    this.setConf();
    this.setHelp();
  }

  /**
  * Command's function
  * @param {Message} msg - the message
  * @param {string[]} args - message arguments; no command
  */
  run(msg) {
    msg.channel.sendMessage('No run command configured!');
  }

  /**
  * Set command's config
  * @param {CommandConfig} conf - new config
  */
  setConf(conf = {}) {
    this.props.conf = MergeDefault(default_conf, conf);
  }

  /**
  * Get command's config
  * @return {CommandConfig} command's config
  */
  get conf() {
    return this.props.conf;
  }

  /**
  * Set command's help
  * @param {CommandHelp} conf - new config
  */
  setHelp(help = {}) {
    this.props.help = MergeDefault(default_help(this), help);
  }

  /**
  * Get command's help
  * @return {CommandHelp} command's help
  */
  get help() {
    return this.props.help;
  }

  /**
  * Function to shorten sending error messages
  * @param {Message} msg - message sent by user (for channel)
  * @param {string} str - error message to send user
  * @return {Promise<Message>}
  */
  commandError(msg, str) {
    return msg.channel.sendMessage(`❌ ${str}`);
  }

  /**
  * Error the command's usage to the channel
  * @param {Message} msg - message sent by user (for channel)
  * @return {Promise<Message>}
  */
  errorUsage(msg) {
    return this.commandError(msg, `Correct usage: \`${this.bot.prefix}${this.help.usage}\``);
  }

  generateArgs(strOrArgs = '') {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(' ') : strOrArgs;
    let y = str.match(/[^\s'']+|'([^']*)'|'([^']*)'/g);
    if (y === null) return str.split(' ');
    return y.map(e => e.replace(/'/g, ``));
  }

  _permLevelToWord(permLvl) {
    if (!permLvl || permLvl === 0) return 'Everyone';
    if (permLvl === 1) return 'Admin';
    if (permLvl === 2) return 'Owner';
  }
}

module.exports = Command;
