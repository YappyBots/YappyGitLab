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

        if (!repo) return this.errorUsage();

        const repository = parse(punycode.toASCII(repo));

        const repoName = repository.name;
        const repoUser = repository.owner;
        const repoFullName = repository.repo && repository.repo.toLowerCase();
        if (!repository || !repoName || !repoUser) return this.errorUsage(msg);

        const workingMsg = await msg.channel.send({
            embed: {
                color: 0xfb9738,
                title: `\`${repo}\`: ⚙ Working...`,
            },
        });

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
                const errorMessage = err && err.name ? err.name : err || null;

                if (errorMessage && errorMessage !== 'Gitlab404Error')
                    return this.commandError(msg, `Unable to get repository info for \`${repo}\`\n${err}`);

                return this.commandError(
                    msg,
                    `Unable to initialize! The repository \`${repository.repo}\` could not be found!\nIf it's private, please add \`private\` after the command as a separate argument`
                );
            });
    }

    addRepo(msg, conf, repo) {
        return conf.addRepo(repo.toLowerCase()).then(() => msg.edit({ embed: this._successMessage(repo, conf.get('useEmbed')) }));
    }

    _successMessage(repo, hasEmbed) {
        return {
            color: 0x84f139,
            footer: {
                text: this.bot.user.username,
            },
            title: `\`${repo}\`: Successfully initialized repository events`,
            description: [
                'The repository must a webhook pointing to <https://www.yappybots.tk/gitlab>',
                !hasEmbed
                    ? 'To use embeds to have a nicer GitLab log, say `GL! conf set embed true` in this channel to enable embeds for the current channel.'
                    : '',
            ].join('\n'),
        };
    }
}

module.exports = GitlabInitCommand;
