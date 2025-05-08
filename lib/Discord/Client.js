const { Client: DiscordClient, Collection, PermissionsBitField, Message, ChannelType } = require('discord.js');
const fs = require('fs');
const Guild = require('../Models/Guild');
const Log = require('../Util/Log');

/**
 * @typedef {Discord.ClientOptions} ClientOptions
 * @property {String} owner discord bot's owner user id
 * @property {String} [name] discord bot's name
 */

/**
 * Yappy's custom Discord client
 * @extends {Discord.Client}
 */
class Client extends DiscordClient {
    /**
     * The main hub for interacting with the Discord API, and the starting point for any bot.
     * @param {ClientOptions} opts Custom client options
     */
    constructor(opts = {}) {
        super(opts);

        /**
         * Discord bot's commands
         * @type {Collection}
         */
        this.commands = new Collection();

        /**
         * Discord bot's middleware
         * @type {Collection}
         */
        this.middleware = new Collection();

        /**
         * Discord bot's command aliases
         * @type {Collection}
         */
        this.aliases = new Collection();

        /**
         * Discord prefix is just mention.
         * Only for usage in commands.
         * @type {String}
         */
        this.prefix = '@Yappy ';

        /**
         * Discord bot's name
         * @type {String}
         */
        this.name = opts.name || 'Unknown';

        this.config = {
            owner: opts.owner,
        };
    }

    /**
     * Load commands from directory
     * @param {String} cwd path to commands directory
     */
    loadCommands(cwd) {
        fs.readdir(cwd, (err, files) => {
            if (err) {
                this.emit('error', err);
                return this;
            }

            if (!files.length) {
                Log.info(`Command | No Commands Loaded.`);
                return this;
            }

            const disabled = (process.env.DISABLED_COMMANDS || '').split(',');

            files.forEach((f) => {
                try {
                    let Command = require(`./Commands/${f}`);

                    Command = new Command(this);

                    if (disabled.includes(Command.help.name)) return Log.info(`Skipping command: ${Command.help.name}`);

                    Log.debug(`Command | Loaded ${Command.help.name}`);
                    Command.props.help.file = f;

                    this.commands.set(Command.help.name, Command);

                    Command.conf.aliases.forEach((alias) => {
                        this.aliases.set(alias, Command.help.name);
                    });
                } catch (error) {
                    this.emit('error', `Command | ${f}`);
                    this.emit('error', error);
                }
            });
            return this;
        });
    }

    /**
     * Load modules from directory
     * @param {String} cwd path to modules directory
     */
    loadModules(cwd) {
        fs.readdir(cwd, (err, files) => {
            if (err) {
                this.emit('error', err);
                return this;
            }

            if (!files.length) {
                Log.info(`Module | No Modules Loaded`);
                return this;
            }

            files.forEach((f) => {
                try {
                    const module = new (require(`./Modules/${f}`))(this);
                    const name = module.constructor.name.replace('Module', '');

                    Log.debug(`Module | Loaded ${name}`);

                    this.middleware.set(name, module);
                } catch (error) {
                    this.emit('error', `Module | ${f}`);
                    this.emit('error', error);
                }
            });

            this.middleware = this.middleware.sort((a, b) => b.priority - a.priority);

            return this;
        });
    }

    /**
     * Reload command
     * @param {String} command command to reload
     * @return {Promise}
     */
    reloadCommand(command) {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`./Commands/${command}`)];
                Log.debug(`Command | Reloading ${command}`);
                let cmd = require(`./Commands/${command}`);
                let Command = new cmd(this);
                Command.props.help.file = command;
                this.commands.set(Command.help.name, Command);
                Command.conf.aliases.forEach((alias) => {
                    this.aliases.set(alias, Command.help.name);
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Reload file
     * @param {String} file path of file to reload
     * @return {Promise<any>}
     */
    reloadFile(file) {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(file)];
                let thing = require(file);
                resolve(thing);
            } catch (e) {
                reject(e);
            }
        });
    }

    run(msg) {
        this.execute(msg)
            .catch((e) => this.middleware.last().run(msg, null, null, null, e))
            .catch(Log.error);
    }

    /**
     * Message event handling, uses modules (aka middleware)
     * @param {Message} msg message
     * @return {Client}
     */
    async execute(msg) {
        if (msg.author.id === this.user.id || msg.author.bot) return;

        const userMention = this.user.toString();
        const botMention = userMention.replace('@', '@!');

        if (msg.channel.type !== ChannelType.DM && !msg.content.startsWith(userMention) && !msg.content.startsWith(botMention))
            return false;

        const content =
            (msg.content.startsWith(userMention) && msg.content.replace(`${userMention} `, '')) ||
            (msg.content.startsWith(botMention) && msg.content.replace(`${botMention} `, '')) ||
            msg.content;
        const command = content.split(' ')[0].toLowerCase();
        const args = content.split(' ').slice(1);

        const middleware = this.middleware;
        let i = 0;

        const handleErr = (err, currentMiddleware) => {
            // Always use the last middleware for error handling
            const lastMiddleware = middleware.at(middleware.size - 1);
            if (lastMiddleware && typeof lastMiddleware.run === 'function') {
                lastMiddleware.run(msg, args, null, currentMiddleware, err);
            }
        };

        const next = (err) => {
            if (err) return handleErr(err, middleware.at(i - 1));
            const nextMiddleware = middleware.at(i++);
            if (nextMiddleware) {
                try {
                    const result = nextMiddleware.run(msg, args, next, command);
                    if (result && typeof result.catch === 'function') {
                        result.catch((e) => handleErr(e, nextMiddleware));
                    }
                } catch (e) {
                    handleErr(e, nextMiddleware);
                }
            }
        };

        next();

        return this;
    }

    /**
     * Calculates permissions from message member
     * @param {Message} msg Message
     * @return {Number} Permission level
     */
    permissions(msg) {
        /* This function should resolve to an ELEVATION level which
    is then sent to the command handler for verification*/
        let permlvl = 0;

        if (msg.member && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) permlvl = 1;
        if (this.config.owner === msg.author.id) permlvl = 2;

        return permlvl;
    }
}

module.exports = Client;
