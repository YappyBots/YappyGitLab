const Command = require('../Command');
const Channel = require('../../Models/Channel');
const ChannelRepo = require('../../Models/ChannelRepo');
const parse = require('../../Gitlab/parser');

class GitlabRemoveCommand extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'remove',
            summary: 'Remove repo events from the channel.',
            usage: 'remove [repo]',
            examples: ['remove', 'remove private/repo'],
        };

        this.setConf({
            permLevel: 1,
            guildOnly: true,
        });
    }

    async run(msg, args) {
        const conf = await Channel.find(msg.channel.id, ['repos']);
        const repos = conf && (await conf.getRepos());
        const repo = args[0] ? parse(args[0].toLowerCase()) : {};
        let repoFound = repo && !!repo.repo;

        if (!repos || !repos[0]) {
            return this.commandError(msg, "This channel doesn't have any GitLab events!");
        }

        if (repos.length > 1 && repo.repo) repoFound = repos.filter(e => e.toLowerCase() === repo.repo.toLowerCase())[0];
        else if (repos.length === 1) repoFound = repos[0];

        if (args[0] && !repoFound) {
            return this.commandError(msg, `This channel doesn't have GitLab events for **${repo.repo || args[0]}**!`);
        } else if (repos.length && repos.length > 1 && !repoFound) {
            return this.commandError(msg, `Specify what GitLab repo event to remove! Current repos: ${repos.map(e => `**${e}**`).join(', ')}`);
        }

        const workingMsg = await msg.channel.send({
            embed: {
                color: 0xfb9738,
                title: `\`${repoFound}\`: ⚙ Working...`,
            },
        });

        return ChannelRepo.where('channel_id', conf.id)
            .where('name', repoFound)
            .destroy()
            .then(() => workingMsg.edit({ embed: this._successMessage(repoFound) }))
            .catch(err => {
                Log.error(err);
                return this.commandError(
                    msg,
                    `An error occurred while trying to remove repository events for **${repoFound}** in this channel.\n\`${err}\``
                );
            });
    }

    _successMessage(repo) {
        return {
            color: 0x84f139,
            footer: {
                text: this.bot.user.username,
            },
            title: `\`${repo}\`: Successfully removed repository events`,
        };
    }
}

module.exports = GitlabRemoveCommand;
