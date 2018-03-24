const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Gitlab = require('../../Gitlab');

class GitlabInitOrgCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'initorg',
      summary: 'Initialize all repo events from an organization on the channel.',
      usage: 'initorg <repo>',
      examples: [
        'initorg YappyBots',
        'initorg Discord',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initializeorg'],
      guildOnly: true,
    });
  }

  async run(msg, args) {
    const channelid = msg.channel.id;
    const org = args[0];
    const organization = /^(?:https?:\/\/)?(?:github.com\/)?(\S+)$/.exec(org);

    if (!organization || !organization[0]) return this.errorUsage(msg);

    const orgName = organization[0];

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xFB9738,
        title: `\`${orgName}\`: ⚙ Working...`,
      },
    });

    return Gitlab.getGroupProjects(orgName).then(async data => {
      const conf = ChannelConfig.get(channelid) || await ChannelConfig.add(msg.channel);
      const repos = data.body.filter(!conf.repos.includes(e.name_with_namespace.toLowerCase())).map(e => e.name_with_namespace);

      return Promise.all(repos.map(repo => ChannelConfig.addRepoToChannel(channelid, repo))).then(() => repos);
    })
    .then(repos => {
      const embed = this._successMessage(orgName, repos);
      return workingMsg.edit({ embed });
    })
    .catch(err => {
      const errorMessage = err && err.message ? err.message : err || null;

      Log.error(err);

      if (errorMessage && errorMessage !== 'Not Found') return this.commandError(msg, `Unable to get organization info for \`${orgName}\`\n${err}`);
      return this.commandError(msg, `Unable to initialize! The organization \`${orgName}\` doesn't exist!`);
    });
  }

  _successMessage(org, repos) {
    return {
      color: 0x84F139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully initialized all public repository events`,
      description: [
        'The repositories must all have a webhook pointing to <https://www.yappybots.tk/github>',
        'To use embeds to have a nicer Gitlab log, say `G! conf set embed true` in this channel.',
        `Initialized repos: ${repos.length ? repos.map(e => `\`${e}\``).join(', ') : 'None'}`,
      ].join('\n'),
    };
  }
}

module.exports = GitlabInitOrgCommand;
