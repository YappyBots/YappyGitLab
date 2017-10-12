const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Gitlab = require('../../Gitlab');
const parse = require('../../Gitlab/parser');

class GitlabInitCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'init',
      summary: 'Initialize repo events on the channel.',
      description: 'Initialize repo events on the channel.\nInsert "private" as 2nd argument if the repo is private',
      usage: 'init <repo> [private]',
      examples: [
        'init gitlab-org/gitlab-ce',
        'init https://gitlab.com/gitlab-org/gitlab-ce',
        'init user/privaterepo private',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize'],
      guildOnly: true,
    });
  }

  async run(msg, args) {
    const channelid = msg.channel.id;
    const repo = args[0];
    const isPrivate = args[1] && (args[1].toLowerCase() === 'private');

    const repository = parse(repo);

    const repoName = repository.name;
    const repoUser = repository.owner;
    const repoFullName = repository.repo && repository.repo.toLowerCase();
    if (!repository || !repoName || !repoUser) return this.errorUsage(msg);

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xFB9738,
        title: `\`${repo}\`: ⚙ Working...`,
      },
    });

    if (!repository.isGitlab || isPrivate) {
      // GitlabCache.add(repository.repo);
      const conf = ChannelConfig.FindByChannel(channelid);
      const exists = conf && conf.repos && conf.repos.includes(repoFullName);
      if (exists) return this.commandError(msg, `Repository \`${repository.repo}\` is already initialized in this channel`);
      return ChannelConfig.AddRepoToChannel(channelid, repoFullName)
      .then(() => {
        let embed = this._successMessage(repository.repo);
        return workingMsg.edit({ embed });
      });
    }

    return Gitlab.getRepo(repository.repo).then(res => {
      const conf = ChannelConfig.FindByChannel(channelid);
      const exists = conf && conf.repos && conf.repos.includes(repoFullName);
      if (exists) return this.commandError(msg, `Repository \`${repository.repo}\` is already initialized in this channel`);
      return ChannelConfig.AddRepoToChannel(channelid, repoFullName)
      .then(() => {
        let embed = this._successMessage(repository.repo);
        return workingMsg.edit({ embed });
      });
    }).catch(err => {
      let errorMessage = err && err.name ? err.name : err || null;
      if (errorMessage && errorMessage !== 'Gitlab404Error') return this.commandError(msg, `Unable to get repository info for \`${repo}\`\n${err}`);
      return this.commandError(msg, `Unable to initialize! The repository \`${repository.repo}\` could not be found!\nIf it's private, please add \`private\` after the command as a separate argument`);
    });
  }
  _successMessage(repo) {
    return {
      color: 0x84F139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${repo}\`: Successfully initialized repository events`,
      description: [
        'The repository must a webhook pointing to <https://www.yappybots.tk/gitlab>',
        'To use embeds to have a nicer GitLab log, say `GL! conf set embed true` in this channel to enable embeds for the current channel.',
      ].join('\n'),
    };
  }
}

module.exports = GitlabInitCommand;
