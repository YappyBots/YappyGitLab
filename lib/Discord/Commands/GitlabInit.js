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
        'init https://gitlab.com/datitisev/DiscordBot-Yappy',
        'init Private/Repo private',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize'],
    });
  }

  run(msg, args) {
    let channelid = msg.channel.id;
    let repo = args[0];
    let isPrivate = args[1] && (args[1].toLowerCase() === 'private');

    msg.channel.sendMessage('⚙ Working...');

    if (msg.member && !msg.member.permissions.hasPermission('ADMINISTRATOR') && !msg.author.id !== this.bot.config.owner) {
      return msg.channel.sendMessage('❌ Insuficient permissions! You must have administrator permissions to initialize repository events!');
    }

    let repository = GitlabUrlParser.Parse(repo) || {};

    let repoName = repository.name;
    let repoUser = repository.owner;
    if (!repository || !repoName || !repoUser) return this.errorUsage(msg);
    let repoFullName = repository.repo && repository.repo.toLowerCase();

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

    Gitlab.getRepo(repoUser, repoName).then(res => {
      const repoInfo = res.body;
      const repoActualName = repoInfo.path_with_namespace;
      const conf = ChannelConfig.FindByChannel(channelid);
      const doc = conf && conf.repos ? conf.repos.includes(repoActualName) : false;
      if (doc) return this.commandError(msg, `Repository \`${repoActualName}\` is already initialized in this channel`);
      return ChannelConfig.AddRepoToChannel(channelid, repoFullName)
      .then(() => {
        let message = this._successMessage(repoActualName);
        return msg.channel.sendMessage(message);
      });
    }).catch(err => {
      let errorMessage = err && err.name ? err.name : err || null;
      if (errorMessage && errorMessage !== 'Gitlab404Error') return this.commandError(msg, `Unable to get repository info for \`${repo}\`\n${err}`);
      return this.commandError(msg, `Unable to initialize! The repository \`${repository.repo}\` doesn't exist or is private!`);
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
