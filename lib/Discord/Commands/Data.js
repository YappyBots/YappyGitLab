const Command = require('../Command');

class DataCommand extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'data',
            description: "know what data is being stored and what it's used for",
        };

        this.setConf({
            permLevel: 1,
        });
    }

    run(msg, args) {
        return msg.channel.send(
            new this.embed()
                .setTitle(`${this.bot.user.username} Data`)
                .addField('Commands', [
                    `${this.bot.user} collects messages of valid commands that are run and unexpected errors thrown by commands, along with the guild, channel & user's name.`,
                    '⮩ This data is stored in a private Discord channel for debugging & support purposes. It is not shared with outside services.',
                ])
                .addField('Guilds & Channels', [
                    `When you add ${this.bot.user} to a server, it creates guild & channel configurations for them. These configurations contain the guild's or channel's ID & name.`,
                    '⮩ This data is stored in a local database that no one but the owner has access to.',
                ])
                .addField('Repositories', [
                    'Repository names are stored when you initialize a repository or organization. They are also stored when you set the `repo` configuration option for the issue & merge request commands.',
                    '⮩ This data is stored in the local database as well.',
                    '⮩ The repository names are only used to match incoming GitLab events & retrieve repository information through commands.',
                    '⮩ No other repository data is stored.'
                ])
                .addField(
                    'Removing My Data',
                    `You can delete the guild & channel ID & name that is stored in the database by either removing ${this.bot.user}'s permission to view the channel or kicking the bot.`
                )
        );
    }
}

module.exports = DataCommand;
