const path = require('path');
const util = require('util');
const winston = require('winston');
const moment = require('moment');
const cleanStack = require('clean-stack');
const PrettyError = require('pretty-error');
const pe = new PrettyError();

const { BaseError: ShapeshiftBaseError } = require('@sapphire/shapeshift');

pe.alias(process.cwd(), '.');
pe.skipPackage('discord.js', 'ws');

pe.appendStyle({
    'pretty-error > trace > item': {
        marginBottom: 0,
    },
});

class Log {
    constructor() {
        this._colors = {
            error: 'red',
            warn: 'yellow',
            info: 'cyan',
            debug: 'green',
            message: 'white',
            verbose: 'grey',
        };
        this.logger = new winston.Logger({
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                message: 3,
                verbose: 4,
                debug: 5,
                silly: 6,
            },
            transports: [
                new winston.transports.Console({
                    colorize: true,
                    prettyPrint: true,
                    timestamp: () => moment().format('MM/D/YY HH:mm:ss'),
                    align: true,
                    level: process.env.LOG_LEVEL || 'info',
                }),
            ],
            exitOnError: false,
        });

        winston.addColors(this._colors);

        this.error = this.error.bind(this);
        this.warn = this.warn.bind(this);
        this.info = this.info.bind(this);
        this.verbose = this.verbose.bind(this);
        this.debug = this.debug.bind(this);
        this.silly = this.silly.bind(this);

        this._token = process.env.DISCORD_TOKEN;
        this._tokenRegEx = new RegExp(this._token, 'g');
    }
    error(error, ...args) {
        if (error.stack) error.stack = cleanStack(error.stack);

        // Do not pretty-render validation errors, as that gets rid of the actual error message!
        // Winston also seems to break display
        if (error instanceof ShapeshiftBaseError) {
            console.error(error);
            return this;
        }

        if (error instanceof Error) error = pe.render(error);

        this.logger.error(error, ...args);
        return this;
    }
    warn(warn, ...args) {
        this.logger.warn(warn, ...args);
        return this;
    }
    info(...args) {
        this.logger.info(...args);
        return this;
    }
    verbose(...args) {
        this.logger.verbose(...args);
        return this;
    }
    debug(arg, ...args) {
        if (typeof arg === 'object') arg = util.inspect(arg, { depth: 0 });

        this.logger.debug(arg, ...args);
        return this;
    }
    silly(...args) {
        this.logger.silly(...args);
        return this;
    }
}

module.exports = new Log();
