const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Gitlab = require('../../Gitlab');
const GitlabUrlParser = require('../../Gitlab/GitlabRepoParser');

class GitlabInitCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'init',
      summary: 'Initialize repo events on the channel.',
      description: 'Initialize repo events on the channel.\nInsert "private" as 2nd argument if the repo is private',
      usage: 'init <repo> [private]',
      examples: [
        'init datitisev/OhPlease-Yappy',
        'init https://github.com/datitisev/DiscordBot-Yappy',
        'init Private/Repo private',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize'],
    });
  }

  async run(msg, args) {
    let channelid = msg.channel.id;
    let repo = args[0];
    let isPrivate = args[1] && (args[1].toLowerCase() === 'private');

    msg.channel.sendMessage('⚙ Working...');

    if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR') && !msg.author.id !== this.bot.config.owner) {
      return msg.channel.sendMessage('❌ Insuficient permissions! You must have administrator permissions to initialize repository events!');
    }

    let repository = GitlabUrlParser.Parse(repo);

    if (!repository) return msg.channel.sendMessage(`❌ Error! \`${repo}\` is an invalid Gitlab repository resolvable.`);
    let repoName = repository.name;
    let repoUser = repository.owner;
    let repoFullName = repository.repo ? repository.repo.toLowerCase() : undefined;

    if (!repoName || !repoUser) {
      return msg.channel.sendMessage(`❌ Invalid repository: **${repo}**`);
    }
    if (isPrivate) {
      // GitlabCache.add(repository.repo);
      let conf = ChannelConfig.FindByChannel(channelid);
      let doc = conf && conf.repos ? conf.repos.includes(repoFullName) : false;
      if (doc) return this.commandError(msg, `Repository \`${repository.repo}\` is already initialized in this channel`);
      return ChannelConfig.AddRepoToChannel(channelid, repoFullName)
      .then(() => {
        let message = this._successMessage(repository.repo);
        return msg.channel.sendMessage(message);
      });
    }

    try {
      await Gitlab.getRepo(repoUser, repoName);
    } catch (err) {
      let errorMessage = err && err.name ? err.name : err || null;
      if (errorMessage && errorMessage !== 'Gitlab404Error') return this.commandError(msg, `Unable to get repository info for \`${repo}\`\n${err}`);
      return this.commandError(msg, `Unable to initialize! The repository \`${repository.repo}\` doesn't exist!`);
    }
    let conf = ChannelConfig.FindByChannel(channelid);
    let doc = conf && conf.repos ? conf.repos.includes(repoFullName) : false;
    if (doc) return this.commandError(msg, `Repository \`${repository.repo}\` is already initialized in this channel`);
    return ChannelConfig.AddRepoToChannel(channelid, repoFullName)
    .then(() => {
      let message = this._successMessage(repository.repo);
      return msg.channel.sendMessage(message);
    });
  }
  _successMessage(repo) {
    return [
      `✅ Successfully initialized repository events in this channel for **${repo}**.`,
      `The repository must a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/gitlab>`,
      `To use embeds to have a nicer GitLab log, say \`GL! conf enable embed\` in this channel to enable embeds for the current channel.`,
    ];
  }

}

module.exports = GitlabInitCommand;
