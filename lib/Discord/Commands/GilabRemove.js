const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const GitlabUrlParser = require('../../Gitlab/GitlabRepoParser');

class GitlabRemoveCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'remove',
      summary: 'Remove repo events from the channel.',
      usage: 'remove [repo]',
      examples: [
        'remove',
        'remove private/repo',
      ],
    };

    this.setConf({
      permLevel: 1,
    });
  }

  async run(msg, args) {
    let channelid = msg.channel.id;
    let conf = ChannelConfig.FindByChannel(channelid);
    let repo = args[0] ? GitlabUrlParser.Parse(args[0].toLowerCase()) : {};
    let repoFound = repo && !!repo.repo;

    if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR') && !msg.author.id !== this.bot.config.owner) {
      return msg.channel.send('❌ Insuficient permissions! You must have administrator permissions to remove repository events!');
    } else if (!conf.repos || !conf.repos[0]) {
      return msg.channel.send('❌ This channel doesn\'t have any github events!');
    }

    msg.channel.send('⚙ Working...');

    if (conf.repos.length > 1 && repo.repo) repoFound = conf.repos.filter(e => e.toLowerCase() === repo.repo.toLowerCase())[0]; else if (conf.repos.length === 1) repoFound = conf.repos[0];

    if (args[0] && !repoFound) {
      return msg.channel.send(`❌ This channel doesn't have github events for **${repo.repo || args[0]}**!`);
    } else if (conf.repos.length && conf.repos.length > 1 && !repoFound) {
      return msg.channel.send(`❌ Specify what github repo event to remove! Current repos: ${conf.repos.map(e => `**${e}**`).join(', ')}`);
    }

    return conf.deleteRepo(repoFound).then(() => {
      msg.channel.send(`✅ Successfully removed repository events in this channel for **${repoFound}**.`);
    }).catch((err) => {
      Log.error(err);
      msg.channel.send(`❌ An error occurred while trying to remove repository events for **${repoFound}** in this channel.\n\`${err}\``);
    });
  }

}

module.exports = GitlabRemoveCommand;
