const path = require('path');
const { GatewayIntentBits, Partials, Options } = require('discord.js');
const Client = require('./Client');
const Log = require('../Util/Log');
const bot = new Client({
    name: 'Yappy, the GitLab Monitor',
    owner: '175008284263186437',

    allowedMentions: { repliedUser: true },

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.MessageContent,
        // GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        // GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel],
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        ReactionManager: 0,
        MessageManager: 50,
        GuildMemberManager: {
          maxSize: 100,
          keepOverLimit: (member) => member.id === bot.user.id,
        },
      }),
});
const logger = new (require('@YappyBots/addons').discord.logger)(bot, 'main');
const TOKEN = process.env.DISCORD_TOKEN;

const initialization = require('../Models/initialization');

bot.booted = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
};
bot.statuses = ['Online', 'Connecting', 'Reconnecting', 'Idle', 'Nearly', 'Offline'];
bot.statusColors = ['lightgreen', 'orange', 'orange', 'orange', 'green', 'red'];

bot.on('ready', () => {
    Log.info('Bot | Logged In');
    logger.log('Logged in', null, 'Green');
    initialization(bot);
});
bot.on('disconnect', (e) => {
    Log.warn(`Bot | Disconnected (${e.code}).`);
    logger.log('Disconnected', e.code, 'Orange');
    process.exit();
});
bot.on('error', (e) => {
    Log.error(e);
    logger.log(e.message || 'An error occurred', e.stack || e, 'Red');
});
bot.on('warn', (e) => {
    Log.warn(e);
    logger.log(e.message || 'Warning', e.stack || e, 'Orange');
});

bot.on('messageCreate', (msg) => {
    try {
        bot.run(msg);
    } catch (e) {
        bot.emit('error', e);
    }
});

bot.loadCommands(path.resolve(__dirname, 'Commands'));
bot.loadModules(path.resolve(__dirname, 'Modules'));

// === LOGIN ===
Log.info(`Bot | Logging in with prefix ${bot.prefix}...`);

bot.login(TOKEN).catch((err) => {
    Log.error('Bot: Unable to log in');
    Log.error(err);
});

module.exports = bot;
