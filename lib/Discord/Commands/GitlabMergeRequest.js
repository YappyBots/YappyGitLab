const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Gitlab = require('../../Gitlab');

class GitlabIssue extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'mr',
            description: 'Search merge requests or get info about specific merge request',
            usage: 'mr <list|#> [page]',
            examples: ['mr 5', 'mr list', 'mr list 2'],
        };

        this.setConf({
            aliases: ['mergerequest', 'merge'],
            guildOnly: true,
        });
    }

    run(msg, args) {
        if (!args[0]) return this.errorUsage(msg);

        if (args[0] === 'list') return this._list(msg, args);
        if (args.length === 1) return this._mr(msg, args);

        return this.errorUsage(msg);
    }

    async _mr(msg, args) {
        const mrNumber = parseInt(args[0].replace(/!/g, ''));
        const conf = await Channel.find(msg.channel);
        const repository = conf.get('repo');

        if (!repository) return this.commandError(msg, Gitlab.Constants.Errors.NO_REPO_CONFIGURED(this));
        if (!mrNumber) return this.errorUsage(msg);

        return Gitlab.getProjectMergeRequest(repository, null, mrNumber)
            .then((res) => {
                const mr = res.body;
                const description = mr.description;
                const [, imageUrl] = /!\[(?:.*?)\]\((.*?)\)/.exec(description) || [];

                const embed = new this.embed()
                    .setTitle(`Merge Request \`#${mr.iid}\` - ${mr.title}`)
                    .setURL(mr.web_url)
                    .setDescription(`\u200B\n${description.slice(0, 2040)}\n\u200B`)
                    .setColor('#84F139')
                    .addField('Source', `${mr.author.username}:${mr.source_branch}`, true)
                    .addField('Target', `${repository.split('/')[0]}:${mr.target_branch}`, true)
                    .addField('State', mr.state === 'opened' ? 'Open' : `${mr.state[0].toUpperCase()}${mr.state.slice(1)}`, true)
                    .addField('Status', mr.work_in_progress ? 'WIP' : 'Finished', true)
                    .addField('Labels', mr.labels.length ? mr.labels.map((e) => `\`${e}\``).join(', ') : 'None', true)
                    .addField('Milestone', mr.milestone ? `${mr.milestone.title}` : 'None', true)
                    .addField('Comments', mr.user_notes_count, true)
                    .setFooter(repository, this.bot.user.avatarURL());
                if (imageUrl) embed.setImage(imageUrl.startsWith('/') ? `https://gitlab.com/${repository}/${imageUrl}` : imageUrl);

                return msg.channel.send({ embed });
            })
            .catch((err) => {
                const res = err.response;

                if (res.statusCode === 404) return this.commandError(msg, 'Merge Request Not Found', '404', repository);
                if (res.statusCode === 403) return this.error403(msg, repository);

                return this.commandError(msg, err);
            });
    }

    async _list(msg, args) {
        const page = args[1] ? parseInt(args) : 1;
        const conf = await Channel.find(msg.channel);
        const repository = conf.get('repo');

        if (!repository) return this.commandError(msg, Gitlab.Constants.Errors.NO_REPO_CONFIGURED(this));

        return Gitlab.getProjectMergeRequests(repository, null, {
            page,
            per_page: 5,
        })
            .then((res) => {
                const totalPages = res.headers['x-total-pages'];

                let embed = new this.embed({
                    title: `Merge Requests`,
                    description: '\u200B',
                })
                    .setColor('#84F139')
                    .setFooter(`${repository} ; page ${page} / ${totalPages === '0' ? 1 : totalPages}`);

                if (res.body && res.body.length) {
                    res.body.forEach((mr) => {
                        embed.description += `\n– [**\`#${mr.iid}\`**](${mr.web_url}) ${mr.title}`;
                    });
                } else {
                    embed.setDescription('No merge requests found');
                }

                msg.channel.send({ embed });
            })
            .catch((err) => {
                const res = err.response;

                if (res.statusCode === 403) return this.error403(msg, repository);

                return Promise.reject(err);
            });
    }

    error403(msg, r) {
        return this.commandError(msg, 'Merge requests are not visible to the public', '403', r);
    }
}

module.exports = GitlabIssue;
