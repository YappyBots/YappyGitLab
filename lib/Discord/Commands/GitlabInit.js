const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Gitlab = require('../../Gitlab');
const parse = require('../../Gitlab/parser');
const punycode = require('punycode');

class GitlabInitCommand extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'init',
            summary: 'Initialize repo events on the channel.',
            description: 'Initialize repo events on the channel.\nInsert "private" as 2nd argument if the repo is private',
            usage: 'init <repo> [private]',
            examples: ['init gitlab-org/gitlab-ce', 'init https://gitlab.com/gitlab-org/gitlab-ce', 'init user/privaterepo private'],
        };

        this.setConf({
            permLevel: 1,
            aliases: ['initialize'],
            guildOnly: true,
        });
    }

    async run(msg, args) {
        const repo = args[0];
        const isPrivate = args[1] && args[1].toLowerCase() === 'private';

        if (!repo) return this.errorUsage(msg);

        const repository = parse(punycode.toASCII(repo));

        const repoName = repository.name;
        const repoUser = repository.owner;
        const repoFullName = repository.repo && repository.repo.toLowerCase();
        if (!repository || !repoName || !repoUser) return this.errorUsage(msg);

        const embed = new this.embed().setTitle(`\`${repo}\`: ⚙ Working...`).setColor(0xfb9738);
        const workingMsg = await msg.channel.send({ embeds: [embed] });

        const conf = await Channel.find(msg.channel, ['repos']);
        const repos = conf.getRepos();

        if (!repository.isGitlab || isPrivate) {
            // GitlabCache.add(repository.repo);;
            const exists = repos.includes(repoFullName);

            if (exists) return this.commandError(msg, Gitlab.Constants.Errors.REPO_ALREADY_INITIALIZED(repository));

            return this.addRepo(workingMsg, conf, repository.repo);
        }

        return Gitlab.getRepo(repository.repo)
            .then(() => {
                const exists = repos.includes(repoFullName);

                if (exists) return this.commandError(msg, Gitlab.Constants.Errors.REPO_ALREADY_INITIALIZED(repository));

                return this.addRepo(workingMsg, conf, repository.repo);
            })
            .catch((err) => {
                if (!err) return;

                const res = err.response;
                const body = res?.data && JSON.parse(res?.data);

                if (res?.statusCode == 404)
                    return this.commandError(
                        msg,
                        `The repository \`${repository.repo}\` could not be found!\nIf it's private, please run \`${this.bot.prefix}init ${repository.repo} private\`.`,
                        res.statusMessage
                    );
                else if (body)
                    return this.commandError(
                        msg,
                        `Unable to get repository info for \`${repo}\`\n${(body && body.message) || ''}`,
                        res.statusMessage
                    );
                else return this.commandError(msg, err);
            });
    }

    addRepo(msg, conf, repo) {
        return conf.addRepo(repo.toLowerCase()).then(() => msg.edit({ embeds: [this._successMessage(repo, conf.get('useEmbed'))] }));
    }

    _successMessage(repo, hasEmbed) {
        const embed = new this.embed()
            .setColor(0x84f139)
            .setFooter({ text: this.bot.user.username })
            .setTitle(`\`${repo}\`: Successfully initialized repository events`)
            .setDescription(
                [
                    'The repository must a webhook pointing to <https://www.yappybots.tk/gitlab>',
                    !hasEmbed
                        ? 'To use embeds to have a nicer GitLab log, say `GL! conf set embed true` in this channel to enable embeds for the current channel.'
                        : '',
                ].join('\n')
            );
        return embed;
    }
}

module.exports = GitlabInitCommand;
