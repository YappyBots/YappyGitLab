const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Gitlab = require('../../Gitlab');

class GitlabIssue extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'issue',
            description: 'Search issues or get info about specific issue',
            usage: 'issue <search|#> [query] [p(page)]',
            examples: ['issue 5', 'issue search error', 'issue search event p2'],
        };

        this.setConf({
            aliases: ['issues'],
            guildOnly: true,
        });
    }

    run(msg, args) {
        if (!args[0]) return this.errorUsage(msg);

        if (args[0] === 'search' && args.length > 1) return this._search(msg, args);
        if (args.length === 1) return this._issue(msg, args);

        return this.errorUsage(msg);
    }

    async _issue(msg, args) {
        const issueNumber = parseInt(args[0].replace(/#/g, ''));
        const conf = await Channel.find(msg.channel.id);
        const repository = conf.get('repo');

        if (!repository) return this.commandError(msg, Gitlab.Constants.Errors.NO_REPO_CONFIGURED(this));
        if (!issueNumber) return this.errorUsage(msg);

        return Gitlab.getProjectIssue(repository, null, issueNumber)
            .then(res => {
                const issue = res.body;
                const description = issue.description;
                const [, imageUrl] = /!\[(?:.*?)\]\((.*?)\)/.exec(description) || [];

                const embed = new this.embed()
                    .setTitle(`Issue \`#${issue.iid}\` - ${issue.title}`)
                    .setURL(issue.web_url)
                    .setDescription(`\u200B\n${description.slice(0, 2040)}\n\u200B`)
                    .setColor('#84F139')
                    .addField('Status', issue.state === 'opened' ? 'Open' : 'Closed', true)
                    .addField('Labels', issue.labels.length ? issue.labels.map(e => `\`${e}\``).join(', ') : 'None', true)
                    .addField('Milestone', issue.milestone ? `${issue.milestone.title}` : 'None', true)
                    .addField('Author', issue.author ? `[${issue.author.name}](${issue.author.web_url})` : 'Unknown', true)
                    .addField('Assignee', issue.assignee ? `[${issue.assignee.name}](${issue.assignee.web_url})` : 'None', true)
                    .addField('Comments', issue.user_notes_count, true)
                    .setFooter(repository, this.bot.user.avatarURL());
                if (imageUrl) embed.setImage(imageUrl.startsWith('/') ? `https://gitlab.com/${repository}/${imageUrl}` : imageUrl);

                return msg.channel.send({ embed });
            })
            .catch(err => {
                if (err.status === 404) {
                    return this.commandError(msg, 'Issue Not Found', '404', repository);
                } else {
                    return this.commandError(msg, err);
                }
            });
    }

    async _search(msg, args) {
        const page = args[args.length - 1].indexOf('p') === 0 ? parseInt(args[args.length - 1].slice(1)) : 1;
        const query = args
            .slice(1)
            .join(' ')
            .replace(`p${page}`, '');

        if (!query) return false;

        const conf = await Channel.find(msg.channel.id);
        const repository = conf.get('repo');

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
            })
                .setColor('#84F139')
                .setFooter(`${repository} ; page ${page} / ${totalPages === '0' ? 1 : totalPages}`);

            if (res.body && res.body.length) {
                res.body.forEach(issue => {
                    embed.description += `\n– [**\`#${issue.iid}\`**](${issue.web_url}) ${issue.title}`;
                });
            } else {
                embed.setDescription('No issues found');
            }

            msg.channel.send({ embed });
        });
    }
}

module.exports = GitlabIssue;
