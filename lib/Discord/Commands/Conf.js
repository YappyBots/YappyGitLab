const capitalize = require('lodash/capitalize');
const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Guild = require('../../Models/Guild');
const EventHandler = require('../../Gitlab/EventHandler');

const bools = ['no', 'yes'];

const Actions = {
    INVALID: -1,
    DISABLE: 1,
    ENABLE: 2,
    VIEW: 3,
};

class ConfCommand extends Command {
    constructor(bot) {
        super(bot);
        this.props.help = {
            name: 'conf',
            summary: 'configure some settings for this channel/server',
            description: 'Configure some settings for this channel or all current existing channels in this server',
            usage: 'conf [view|get|set|filter] [key] [value] ["--global"|"-g"]',
            examples: [
                'conf view',
                'conf set repo datitisev/DiscordBot-Yappy',
                'conf filter events ignore merge_request/update',
                'conf filter events enable merge_request/update',
                'conf filter users blacklist',
                'conf filter branches allow master',
            ],
        };
        this.setConf({
            permLevel: 1,
            guildOnly: true,
        });
    }

    async run(msg, args) {
        const action = (args.filter((e) => !e.includes('-'))[0] || 'view').toLowerCase();

        const channelConf = await Channel.find(msg.channel, ['guild', 'repos']);
        const serverConf = channelConf.related('guild');

        if (['view', 'get', 'set', 'events', 'filter'].includes(action)) {
            return this[`_${action}`](msg, args, channelConf, serverConf);
        }
    }

    _view(msg, args, channelConf, serverConf) {
        const { guild, channel } = msg;

        if (args.includes('--global') || args.includes('-g')) {
            let embed = new this.embed()
                .setColor('#FB9738')
                .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                .setDescription(`This is your current server's configuration.`)
                .addFields([
                    {
                        name: 'Prefix',
                        value: serverConf.has('prefix') ? this.format(serverConf.get('prefix')) : '`GL! \u200B`',
                        inline: true,
                    },
                ]);
            return msg.channel.send({ embeds: [embed] });
        }

        let embed = new this.embed()
            .setColor('#FB9738')
            .setAuthor({ name: `${guild.name} #${channel.name}`, iconURL: guild.iconURL() })
            .setDescription(`This is your current channel's configuration.`)
            .addFields([
                { name: 'Repos', value: this.formatArrayOutput(channelConf.getRepos()) },
                { name: 'Repo (repo)', value: this.format(channelConf.get('repo')), inline: true },
                { name: 'Use Embed (useEmbed)', value: this.format(channelConf.get('useEmbed'), true), inline: true },
                { name: `Events [${channelConf.get('eventsType')}]`, value: this.format(channelConf.get('eventsList')), inline: true },
                { name: `Users [${channelConf.get('usersType')}]`, value: this.format(channelConf.get('usersList')), inline: true },
                { name: `Branches [${channelConf.get('branchesType')}]`, value: this.format(channelConf.get('branchesList')), inline: true },
            ]);

        return msg.channel.send({ embeds: [embed] });
    }

    _get(msg, args, channelConf, serverConf) {
        const { guild, channel } = msg;
        const key = args.filter((e) => !e.includes('-'))[1];
        const conf = args.includes('--global') || args.includes('-g') ? serverConf : channelConf;

        const embed = new this.embed()
            .setColor('#FB9738')
            .setAuthor({ name: conf === channelConf ? `${guild.name} #${channel.name}` : guild.name, iconURL: guild.iconURL() })
            .setDescription(`This is your current ${conf === channelConf ? 'channel' : 'server'}'s configuration.`)
            .addFields([{ name: key, value: this.format(channelConf[key]) }]);

        return msg.channel.send({ embeds: [embed] });
    }

    _set(msg, a, channelConf, serverConf) {
        const { guild, channel } = msg;
        const args = this.generateArgs(a);
        const key = args.filter((e) => !e.includes('-'))[1];
        const global = (args.includes('--global') || args.includes('-g')) && args.length > 3;
        const conf = global ? serverConf : channelConf;
        const validKeys = (global ? Guild : Channel).validKeys;
        let value = global
            ? args
                  .filter((e) => !e.includes('-g'))
                  .slice(2)
                  .join(' ')
            : args.slice(2).join(' ');
        if (key !== 'prefix' && value.includes(', ')) value = value.split(', ');

        if (key.endsWith('List') || key.endsWith('Type')) {
            return this.commandError('Use the `conf filter` command to modify these options');
        }

        const embedData = {
            author: conf === channelConf ? `${guild.name} #${channel.name}` : guild.name,
            confName: conf === channelConf ? 'channel' : 'server',
        };

        const embed = new this.embed().setAuthor({ name: embedData.author, iconURL: guild.iconURL() });

        if (!validKeys.includes(key)) {
            return msg.channel.send({
                embeds: [
                    embed
                        .setColor('#CE0814')
                        .setDescription(
                            [
                                `An error occured when trying to set ${embedData.confName}'s configuration`,
                                '',
                                `The key \`${key}\` is invalid.`,
                                `Valid configuration keys: \`${validKeys.join('`, `')}\``,
                            ].join('\n')
                        ),
                ],
            });
        }

        return conf
            .set(key, value)
            .save()
            .then(() => key === 'prefix' && Guild.updateCachedPrefix(guild, value))
            .then(() =>
                msg.channel.send({
                    embeds: [
                        embed
                            .setColor('#84F139')
                            .setDescription(`Successfully updated ${embedData.confName}'s configuration`)
                            .addFields([{ name: key, value: this.format(value, conf.casts && conf.casts[key] === 'boolean') }]),
                    ],
                })
            )
            .catch((err) =>
                msg.channel.send({
                    embeds: [
                        embed
                            .setColor('#CE0814')
                            .setDescription(
                                [`An error occured when trying to update ${embedData.confName}'s configuration`, '```js', err, '```'].join('\n')
                            )
                            .addFields([{ name: key, value: String(value) }]),
                    ],
                })
            );
    }

    async _filter(msg, [, obj, cmd, ...args], conf) {
        if (obj === 'events') return this._events(...arguments);

        if (!['users', 'branches'].includes(obj)) {
            return this.commandError(
                msg,
                `Correct Usage: \`${this.bot.prefix}conf filter [users|branches|events] [whitelist|blacklist|add|remove] [item]\``,
                'Incorrect usage'
            );
        }

        const type = conf.get(`${obj}Type`);
        let list = conf.get(`${obj}List`);

        // set filtering to whitelist or blacklist
        if (/^(whitelist|blacklist)$/i.test(cmd)) {
            if (type === cmd) {
                return this.commandError(msg, `The filtering mode of ${obj} is already set to ${type}`, 'Nothing was updated');
            }

            await conf.set(`${obj}Type`, cmd.toLowerCase()).save();

            return msg.channel.send({
                embeds: [
                    new this.embed()
                        .setColor('#84F139')
                        .setDescription(`Successfully updated #${msg.channel.name}'s filtering mode for ${obj} to ${cmd}`),
                ],
            });
        }

        const action = (cmd && (/^(add|set)$/i.test(cmd) ? Actions.ENABLE : /^(remove|take)$/i.test(cmd) && Actions.DISABLE)) || Actions.INVALID;
        const item = args.join(' ').toLowerCase();

        // if add, add to whitelist/blacklist list
        if (action === Actions.ENABLE && !list.includes(item)) list.push(item);
        else if (action === Actions.DISABLE) list = list.filter((e) => e !== item);

        if (!cmd || action === Actions.INVALID) {
            const embed = new this.embed().setTitle(`#${msg.channel.name}'s ${type}ed ${obj}`);

            if (!list || !list.length) embed.setDescription(`No ${type}ed ${obj} found.`);

            list.forEach((e) => embed.addFields([{ name: e, value: '\u200B', inline: true }]));

            return msg.channel.send({ embeds: [embed] });
        }

        return conf
            .set(`${obj}List`, list)
            .save()
            .then(() => {
                const embed = new this.embed()
                    .setColor('#84F139')
                    .setTitle(`Successfully updated #${msg.channel.name}'s ${type}ed ${obj}`)
                    .setDescription([
                        `${action === Actions.ENABLE ? 'Added' : 'Removed'} \`${item}\`.`,
                        '',
                        list.length ? '' : `No ${obj} are ${type}ed.`,
                    ]);

                list.forEach((e) => embed.addFields([{ name: e, value: '\u200B', inline: true }]));

                return msg.channel.send({ embeds: [embed] });
            });
    }

    _events(msg, [, , a, ...args], conf) {
        const action = (a && (/^(ignore|disable)$/i.test(a) ? Actions.DISABLE : /^(enable|unignore)$/i.test(a) && Actions.ENABLE)) || Actions.INVALID;
        const key = args.join(' ').toLowerCase();

        if (action === Actions.INVALID) {
            if (!a) {
                const events = conf.get('eventsList');
                const embed = new this.embed().setColor('#84F139').setTitle(`#${msg.channel.name}'s disabled events`);

                if (!events || !events.length) embed.setDescription('No disabled events found.');

                events.forEach((e) => e && embed.addFields([{ name: e, value: '\u200B', inline: true }]));

                return msg.channel.send({ embeds: [embed] });
            } else if (a.toLowerCase() === 'list') {
                const embed = new this.embed().setTitle('List of available events');

                EventHandler.eventsList.forEach(
                    (evt, name) => name !== 'Unknown' && embed.addFields([{ name: '\u200B', value: `\`${name.replace('-', '/')}\``, inline: true }])
                );

                return msg.channel.send({ embeds: [embed] });
            }
        }

        if (action === Actions.INVALID || !key) {
            return this.commandError(msg, `Correct Usage: \`${this.bot.prefix}conf filter events [list|ignore|disable] [event]\``, 'Incorrect usage');
        }

        let events = conf.get('eventsList');

        if (action === Actions.DISABLE && !events.includes(key)) events.push(key);
        else if (action === Actions.ENABLE) events = events.filter((e) => e !== key);

        // remove empty events
        events = events.filter((e) => !!e);

        return conf
            .set('eventsList', events)
            .save()
            .then(() => {
                const embed = new this.embed()
                    .setColor('#84F139')
                    .setTitle(`Successfully updated #${msg.channel.name}'s disabled events`)
                    .setDescription([
                        `${action === Actions.ENABLE ? 'Enabled' : 'Disabled'} \`${key}\`.`,
                        '',
                        events.length ? 'Disabled events:\n' : 'No events are disabled.',
                    ]);

                events.forEach((e) => embed.addFields([{ name: e, value: '\u200B', inline: true }]));

                return msg.channel.send({ embeds: [embed] });
            });
    }

    format(val, isBoolean) {
        if (isBoolean) {
            return capitalize(bools[val] || bools[Number(String(val) === 'true')]);
        }

        return (Array.isArray(val) && this.formatArrayOutput(val)) || (val && `\`${val}\u200B\``) || 'None';
    }

    formatArrayOutput(arr) {
        return arr && arr.length ? arr.map((e) => `\`${e}\``).join(', ') : 'None';
    }
}

module.exports = ConfCommand;
