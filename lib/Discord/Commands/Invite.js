const Command = require('../Command');

class InviteCommand extends Command {
    constructor(bot) {
        super(bot);

        this.props.help = {
            name: 'invite',
            description: 'get invite link',
            usage: 'invite',
        };
    }

    run(msg) {
        const botInviteLink = `https://discordapp.com/oauth2/authorize?permissions=67193856&scope=bot&client_id=${this.bot.user.id}`;
        const serverInviteLink = 'http://discord.gg/HHqndMG';

        const embed = new this.embed()
            .setTitle('Yappy, the GitLab Monitor')
            .setDescription(['__Invite Link__:', `**<${botInviteLink}>**`, '', '__Official Server__:', `**<${serverInviteLink}>**`].join('\n'))
            .setColor('#84F139')
            .setThumbnail(this.bot.user.avatarURL());

        return msg.author.send({ embeds: [embed] }).then(() =>
            msg.channel.send({
                embeds: [new this.embed().setTitle('Yappy, the GitLab Monitor').setDescription('📬 Sent invite link!')],
            })
        );
    }
}

module.exports = InviteCommand;
