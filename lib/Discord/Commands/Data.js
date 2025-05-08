const Command = require('../Command');

class DataCommand extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'data',
            description: "know what data is being stored and what it's used for",
            usage: 'data',
        };
    }

    run(msg) {
        const embed = new this.embed().setTitle(`${this.bot.user.username} Data`).addFields([
            {
                name: 'Commands',
                value:
                    `${this.bot.user} collects messages of valid commands that are run and unexpected errors thrown by commands, along with the guild, channel & user's name.` +
                    '\n⮩ This data is stored in a private Discord channel for debugging & support purposes. It is not shared with outside services.',
            },
            {
                name: 'Guilds & Channels',
                value:
                    `When you add ${this.bot.user} to a server, it creates guild & channel configurations for them. These configurations contain the guild's or channel's ID & name.` +
                    '\n⮩ This data is stored in a local database that no one but the owner has access to.',
            },
            {
                name: 'Repositories',
                value:
                    'When you initialize a repository in a channel, the repository name and webhook URL are stored.' +
                    '\n⮩ This data is only used for event delivery and is not shared externally.',
            },
        ]);
        return msg.channel.send({ embeds: [embed] });
    }
}

module.exports = DataCommand;
