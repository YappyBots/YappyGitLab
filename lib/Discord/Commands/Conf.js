const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const ServerConfig = require('../../Models/ServerConfig');
const EventHandler = require('../../Gitlab/EventHandler');

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
      description:
        'Configure some settings for this channel or all current existing channels in this server',
      usage: 'conf [view|get|set|events] [key] [value] ["--global"|"-g"]',
      examples: [
        'conf view',
        'conf get prefix',
        'conf set repo datitisev/DiscordBot-Yappy',
        'conf set prefix g. --global',
        'conf events ignore merge_request/update',
        'conf events enable merge_request/update',
      ],
    };
    this.setConf({
      permLevel: 1,
      guildOnly: true,
    });
  }

  async run(msg, args) {
    const action = args.filter(e => !e.includes('-'))[0] || 'view';
    const serverConf = ServerConfig.get(msg.guild.id);
    const channelConf =
      ChannelConfig.get(msg.channel.id) ||
      (await ChannelConfig.add(msg.channel));

    if (action === 'view')
      return this._view(msg, args, channelConf, serverConf);
    else if (action === 'get')
      return this._get(msg, args, channelConf, serverConf);
    else if (action === 'set')
      return this._set(msg, args, channelConf, serverConf);
    else if (action === 'events') return this._events(msg, args, channelConf);
  }

  _view(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    if (args.includes('--global') || args.includes('-g')) {
      let embed = new this.embed()
        .setColor('#FB9738')
        .setAuthor(guild.name, guild.iconURL)
        .setDescription(`This is your current server's configuration.`)
        .addField(
          'Prefix',
          serverConf.prefix ? `\`${serverConf.prefix}\u200B\`` : '`GL! \u200B`',
          true
        );
      return msg.channel.send({ embed });
    } else {
      let embed = new this.embed()
        .setColor('#FB9738')
        .setAuthor(`${guild.name} #${channel.name}`, guild.iconURL)
        .setDescription(`This is your current channel's configuration.`)
        .addField(
          'Repos (repos)',
          channelConf.repos[0]
            ? channelConf.repos.map(e => `\`${e}\``).join(', ')
            : 'None',
          true
        )
        .addField(
          'Repo (repo)',
          channelConf.repo ? `\`${channelConf.repo}\u200B\`` : 'None',
          true
        )
        .addField('Use Embed (embed)', channelConf.embed ? `Yes` : 'No', true)
        .addField(
          'Disabled Events (disabledEvents)',
          channelConf.disabledEvents && channelConf.disabledEvents.length
            ? channelConf.disabledEvents.map(e => `\`${e}\``).join(', ')
            : 'None',
          true
        )
        .addField(
          'Ignored Users (ignoredUsers)',
          channelConf.ignoredUsers && !!channelConf.ignoredUsers.length
            ? channelConf.ignoredUsers.map(e => `\`${e}\``).join(', ')
            : 'None',
          true
        )
        .addField(
          'Ignored Branches (ignoredBranches)',
          channelConf.ignoredBranches && !!channelConf.ignoredBranches.length
            ? channelConf.ignoredBranches.map(e => `\`${e}\``).join(', ')
            : 'None',
          true
        );
      return msg.channel.send({ embed });
    }
  }

  _get(msg, args, channelConf, serverConf) {
    const { guild, channel } = msg;
    const key = args.filter(e => !e.includes('-'))[1];
    const conf =
      args.includes('--global') || args.includes('-g')
        ? serverConf
        : channelConf;

    const embed = new this.embed()
      .setColor('#FB9738')
      .setAuthor(
        conf === channelConf ? `${guild.name} #${channel.name}` : guild.name,
        guild.iconURL
      )
      .setDescription(
        `This is your current ${
          conf === channelConf ? 'channel' : 'server'
        }'s configuration.`
      )
      .addField(
        key,
        `\`${
          Array.isArray(channelConf[key])
            ? conf[key][0]
              ? conf[key].join('`, `')
              : 'None'
            : conf[key]
        }\u200B\``
      );
    return msg.channel.send({ embed });
  }

  _set(msg, a, channelConf, serverConf) {
    const { guild, channel } = msg;
    const args = this.generateArgs(a);
    const key = args.filter(e => !e.includes('-'))[1];
    const global =
      (args.includes('--global') || args.includes('-g')) && args.length > 3;
    const conf = global ? serverConf : channelConf;
    const validKeys = (global ? ServerConfig : ChannelConfig).validKeys;
    let value = global
      ? args
          .filter(e => !e.includes('-g'))
          .slice(2)
          .join(' ')
      : args.slice(2).join(' ');
    if (key !== 'prefix' && value.includes(', ')) value = value.split(', ');
    if (
      !Array.isArray(value) &&
      (key === 'ignoredUsers' ||
        key === 'ignoredBranches' ||
        key === 'disabledEvents')
    )
      value = value ? [value] : [];
    const embedData = {
      author:
        conf === channelConf ? `${guild.name} #${channel.name}` : guild.name,
      confName: conf === channelConf ? 'channel' : 'server',
    };

    if (!validKeys.includes(key)) {
      const embed = new this.embed()
        .setColor('#CE0814')
        .setAuthor(embedData.author, guild.iconURL)
        .setDescription(
          [
            `An error occured when trying to set ${embedData.confName}'s configuration`,
            '',
            `The key \`${key}\` is invalid.`,
            `Valid configuration keys: \`${validKeys.join('`, `')}\``,
          ].join('\n')
        );
      return msg.channel.send({ embed });
    }

    return conf
      .set(key, value)
      .then(() => {
        const embed = new this.embed()
          .setColor('#84F139')
          .setAuthor(embedData.author, guild.iconURL)
          .setDescription(
            `Successfully updated ${embedData.confName}'s configuration`
          )
          .addField(
            key,
            `\`${Array.isArray(value) ? value.join('`, `') : value}\u200B\``
          );
        return msg.channel.send({ embed });
      })
      .catch(err => {
        const embed = new this.embed()
          .setColor('#CE0814')
          .setAuthor(embedData.author, guild.iconURL)
          .setDescription(
            [
              `An error occured when trying to update ${embedData.confName}'s configuration`,
              '```js',
              err,
              '```',
            ].join('\n')
          )
          .addField(key, value);
        return msg.channel.send({ embed });
      });
  }

  _events(msg, [, a, ...args], conf) {
    // eslint-disable-next-line no-mixed-operators
    const action =
      (a &&
        (/^(ignore|disable)$/i.test(a)
          ? Actions.DISABLE
          : /^(enable|unignore)$/i.test(a) && Actions.ENABLE)) ||
      Actions.INVALID;
    const key = args.join(' ').toLowerCase();

    if (action === Actions.INVALID) {
      if (!a || a.toLowerCase() === 'view') {
        const events = conf.disabledEvents || [];
        const embed = new this.embed()
          .setColor('#84F139')
          .setTitle(`#${msg.channel.name}'s disabled events`);

        if (!events || !events.length)
          embed.setDescription('No disabled events found.');

        events.forEach(e => embed.addField(e, '\u200B', true));

        return msg.channel.send({ embed });
      } else if (a.toLowerCase() === 'list') {
        const embed = new this.embed().setTitle('List of available events');

        for (const [event] of EventHandler.eventsList) {
          embed.addField('\u200B', `\`${event.replace('-', '/')}\``, true);
        }

        return msg.channel.send({ embed });
      } else {
        return this.commandError(
          msg,
          `Correct Usage: \`${this.bot.prefix}conf events [view|list|ignore|disable|enable|unignore] [event]\``,
          'Incorrect usage'
        );
      }
    }

    let events = conf.disabledEvents;

    if (action === Actions.DISABLE && !events.includes(key)) events.push(key);
    else if (action === Actions.ENABLE) events = events.filter(e => e !== key);

    return conf.set('disabledEvents', events).then(() => {
      const embed = new this.embed()
        .setColor('#84F139')
        .setTitle(`Successfully updated #${msg.channel.name}'s disabled events`)
        .setDescription([
          `${action === Actions.ENABLE ? 'Enabled' : 'Disabled'} \`${key}\`.`,
          '',
          events.length ? 'Disabled events:\n' : 'No events are disabled.',
        ]);

      events.forEach(e => embed.addField(e, '\u200B', true));

      return msg.channel.send({ embed });
    });
  }
}

module.exports = ConfCommand;
