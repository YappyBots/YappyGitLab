const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Gitlab = require('../../Gitlab');

class GitlabIssue extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'issue',
      description: 'Search issues or get info about specific issue',
      usage: 'issue <search|#> [query] [p(page)]',
      examples: [
        'issue 5',
        'issue search error',
        'issue search event p2',
      ],
    };

    this.setConf({
      aliases: ['issues'],
    });
  }

  run(msg, args) {
    if (!args[0]) return this.errorUsage(msg);

    msg.channel.sendMessage('(In Development...)');

    if (args[0] === 'search') return this._search(msg, args);
    if (args.length === 1) return this._issue(msg, args);

    return this.errorUsage(msg);
  }

  _issue(msg, args) {
    const issueNumber = parseInt(args[0].replace(/#/g, ''));
    let repository = ChannelConfig.FindByChannel(msg.channel.id).repo;

    if (!repository) return this.commandError(msg, Gitlab.Constants.Errors.NO_REPO_CONFIGURED(this));

    return Gitlab.getProjectIssue(repository, null, issueNumber)
    .then(res => {
      let issue = res.body;

      let embed = new this.embed()
      .setTitle(`Issue \`#${issue.iid}\` - ${issue.title}`)
      .setURL(issue.web_url)
      .setDescription(`\u200B\n${issue.description}\n\u200B`)
      .setColor('#84F139')
      .addField('Status', issue.state === 'opened' ? 'Open' : 'Closed', true)
      .addField('Labels', issue.labels.length ? issue.labels.map(e => `\`${e}\``).join(', ') : 'None', true)
      .addField('Milestone', issue.milestone ? `${issue.milestone.title}` : 'None', true)
      .addField('Author', issue.author ? `[${issue.author.name}](${issue.author.web_url})` : 'Unknown', true)
      .addField('Assignee', issue.assignee ? `[${issue.assignee.name}](${issue.assignee.web_url})` : 'None', true)
      .addField('Comments', issue.user_notes_count, true)
      .setFooter(repository);

      return msg.channel.sendEmbed(embed);
    });
  }

  _search(msg, args) {
    let channelId = msg.channel.id;
    let page = args[args.length - 1].indexOf('p') === 0 ? parseInt(args[args.length - 1].slice(1)) : 1;
    let query = args.slice(1).join(' ').replace(`p${page}`, '');

    if (!query) return false;

    let repository = ChannelConfig.FindByChannel(channelId).repo;

    if (!repository) return this.commandError(msg, Gitlab.Constants.Errors.NO_REPO_CONFIGURED(this));

    return Gitlab.getProjectIssues(repository, null, {
      page,
      per_page: 5,
      search: query,
    }).then(res => {
      const totalPages = res.headers['x-total-pages'];

      let embed = new this.embed({
        title: `Issues - query \`${query}\``,
        description: '\u200B',
      }).setColor('#84F139')
      .setFooter(`${repository} ; page ${page} / ${totalPages}`);

      res.body.forEach(issue => {
        embed.description += `\n– [**\`#${issue.iid}\`**](${issue.web_url}) ${issue.title}`;
      });

      msg.channel.sendEmbed(embed);
    });
  }

}


module.exports = GitlabIssue;
