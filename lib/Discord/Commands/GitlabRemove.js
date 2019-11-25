const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
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
        const channelid = msg.channel.id;
        const conf = ChannelConfig.get(channelid) || (await ChannelConfig.add(msg.channel));
        const repo = args[0] ? parse(args[0].toLowerCase()) : {};
        let repoFound = repo && !!repo.repo;

        if (!conf.repos || !conf.repos[0]) {
            return this.commandError(msg, "This channel doesn't have any GitLab events!");
        }

        if (conf.repos.length > 1 && repo.repo) repoFound = conf.repos.filter(e => e.toLowerCase() === repo.repo.toLowerCase())[0];
        else if (conf.repos.length === 1) repoFound = conf.repos[0];

        if (args[0] && !repoFound) {
            return this.commandError(msg, `This channel doesn't have GitLab events for **${repo.repo || args[0]}**!`);
        } else if (conf.repos.length && conf.repos.length > 1 && !repoFound) {
            return this.commandError(msg, `Specify what GitLab repo event to remove! Current repos: ${conf.repos.map(e => `**${e}**`).join(', ')}`);
        }

        const workingMsg = await msg.channel.send({
            embed: {
                color: 0xfb9738,
                title: `\`${repoFound}\`: ⚙ Working...`,
            },
        });

        return conf
            .deleteRepo(repoFound)
            .then(() => {
                let embed = this._successMessage(repoFound);
                return workingMsg.edit({ embed });
            })
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
