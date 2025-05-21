const { ChannelType } = require('discord.js');
const Command = require('../Command');

class HelpCommand extends Command {
    constructor(bot) {
        super(bot);
        this.props.help = {
            name: 'help',
            description: 'you all need some help',
            usage: 'help [command]',
        };
        this.props.conf.aliases = ['support'];
    }

    run(msg, args) {
        const commandName = args[0];

        if (!commandName) {
            const commands = this.bot.commands;
            let commandsForEveryone = commands.filter((e) => !e.conf.permLevel || e.conf.permLevel === 0);
            let commandsForAdmin = commands.filter((e) => e.conf.permLevel === 1);
            let commandsForOwner = commands.filter((e) => e.conf.permLevel === 2);

            if (msg.channel.type === ChannelType.DM) {
                commandsForEveryone = commandsForEveryone.filter((e) => !e.conf.guildOnly);
            }

            const embed = new this.embed()
                .setColor('#84F139')
                .setTitle(`Commands List`)
                .setDescription(
                    [`Use \`${this.bot.prefix}help <command>\` for details`, 'Or visit https://yappy.dsev.dev/gitlab/commands', '\u200B'].join('\n')
                )
                .setFooter({ text: this.bot.user.username, iconURL: this.bot.user.avatarURL() });

            embed.addFields([
                {
                    name: '__Public__',
                    value:
                        commandsForEveryone
                            .map((command) => {
                                let help = command.help;
                                return `\`${help.name}\`: ${help.summary || help.description}`;
                            })
                            .join('\n') || '\u200B',
                },
            ]);

            if (msg.client.permissions(msg) > 0 && commandsForAdmin.size) {
                embed.addFields([
                    {
                        name: '__Guild Administrator__',
                        value:
                            commandsForAdmin
                                .map((command) => {
                                    let help = command.help;
                                    return `\`${help.name}\`: ${help.summary || help.description}`;
                                })
                                .join('\n') || '\u200B',
                    },
                ]);
            }

            if (msg.client.permissions(msg) > 1 && commandsForOwner.size) {
                embed.addFields([
                    {
                        name: '__Bot Owner__',
                        value:
                            commandsForOwner
                                .map((command) => {
                                    let help = command.help;
                                    return `\`${help.name}\`: ${help.summary || help.description}`;
                                })
                                .join('\n') || '\u200B',
                    },
                ]);
            }

            return msg.channel.send({ embeds: [embed] });
        }

        const command =
            this.bot.commands.get(commandName) ||
            (this.bot.aliases.has(commandName) ? this.bot.commands.get(this.bot.aliases.get(commandName)) : null);
        if (!command) return this.commandError(msg, `Command \`${commandName}\` doesn't exist`);

        const embed = new this.embed()
            .setColor('#84F139')
            .setTitle(`Command  \`${command.help.name}\``)
            .setDescription(`${command.help.description || command.help.summary}\n\u200B`)
            .setFooter({ text: this.bot.user.username, iconURL: this.bot.user.avatarURL() })
            .addFields(
                [
                    { name: 'Usage', value: `\`${this.bot.prefix}${command.help.usage}\`` },
                    command.conf.aliases?.length && { name: 'Aliases', value: command.conf.aliases.map((e) => `\`${e}\``).join(', ') },
                    command.help.examples?.length && {
                        name: 'Examples',
                        value: command.help.examples.map((e) => `\`${this.bot.prefix}${e}\``).join('\n'),
                    },
                    { name: 'Permission', value: `${this._permLevelToWord(command.conf.permLevel)}\n\u200B`, inline: true },
                    { name: 'Guild Only', value: command.conf.guildOnly ? 'Yes' : 'No', inline: true },
                ].filter(Boolean)
            );

        return msg.channel.send({ embeds: [embed] });
    }
}

module.exports = HelpCommand;
