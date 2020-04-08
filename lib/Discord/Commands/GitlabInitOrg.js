const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Gitlab = require('../../Gitlab');

class GitlabInitOrgCommand extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'initorg',
            summary: 'Initialize all repo events from a group on the channel.',
            usage: 'initorg <repo>',
            examples: ['initorg YappyBots', 'initorg Discord'],
        };

        this.setConf({
            permLevel: 1,
            aliases: ['initializeorg', 'initgroup', 'initializegroup'],
            guildOnly: true,
        });
    }

    async run(msg, args) {
        const org = args[0];
        const organization = /^(?:https?:\/\/)?(?:gitlab.com\/)?(\S+)$/.exec(org);

        if (!org || !organization || !organization[0]) return this.errorUsage(msg);

        const orgName = organization[0];
        const workingMsg = await msg.channel.send({
            embed: {
                color: 0xfb9738,
                title: `Group \`${orgName}\`: ⚙ Working...`,
            },
        });

        const conf = await Channel.find(msg.channel);
        const repos = conf.getRepos();

        return Gitlab.getGroupProjects(orgName)
            .then((res) => {
                const r = res.body.filter((e) => !repos.includes(e.path_with_namespace.toLowerCase())).map((e) => e.path_with_namespace);

                return Promise.all(r.map((repo) => conf.addRepo(repo))).then(() => r);
            })
            .then((r) => workingMsg.edit({ embed: this._successMessage(orgName, r, conf.get('useEmbed')) }))
            .catch((err) => {
                if (err.response.statusCode == 404) return this.commandError(msg, `Unable to initialize! Cannot find the \`${orgName}\` group!`);

                Log.error(err);

                return this.commandError(msg, `Unable to get group info for \`${orgName}\`\n${err.response.statusMessage}`);
            });
    }

    _successMessage(org, repos, hasEmbed) {
        return {
            color: 0x84f139,
            footer: {
                text: this.bot.user.username,
            },
            title: `\`${org}\`: Successfully initialized all public repository events`,
            description: [
                'The repositories must all have a webhook pointing to <https://www.yappybots.tk/gitlab>',
                !hasEmbed ? 'To use embeds to have a nicer Gitlab log, say `G! conf set embed true` in this channel.' : '',
                `Initialized repos: ${repos.length ? repos.map((e) => `\`${e}\``).join(', ') : 'None'}`,
            ].join('\n'),
        };
    }
}

module.exports = GitlabInitOrgCommand;
