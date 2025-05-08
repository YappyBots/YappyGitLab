const Command = require('../Command');

class AnnounceCommand extends Command {
    constructor(bot) {
        super(bot);
        this.props.help = {
            name: 'announce',
            description: 'announce something to all server owners',
            usage: 'announce <announcement>',
        };
        this.setConf({
            permLevel: 2,
        });
    }
    async run(msg, args) {
        let announcement = args.join(' ');
        let owners = [];

        for (const guild of this.bot.guilds.cache.values()) {
            try {
                const owner = await guild.fetchOwner();
                if (owner && !owners.some((o) => o.id === owner.id)) {
                    owners.push(owner);
                }
            } catch (e) {
                // handle error if needed
            }
        }
        let messagedOwners = [];
        let message = await msg.channel.send({
            embeds: [new this.embed().setTitle('Announce').setColor(0xfb5432).setDescription('Announcing message....').setTimestamp()],
        });
        for (let owner of owners) {
            if (!owner) continue;
            if (messagedOwners.includes(owner.id)) continue;
            messagedOwners.push(owner.id);
            let embed = new this.embed()
                .setAuthor({ name: msg.author.username, iconURL: msg.author.avatarURL() })
                .setColor(0xfb5432)
                .setTitle(`Announcement to all server owners of servers using Yappy`)
                .setDescription([`\u200B`, announcement, `\u200B`].join('\n'))
                .setTimestamp();
            await owner.send({ embeds: [embed] });
        }
        // await message.delete();
        return message.edit({
            embeds: [new this.embed().setTitle('Announce').setColor(0x1f9523).setDescription('Successfully announced!').setTimestamp()],
        });
    }
}

module.exports = AnnounceCommand;
