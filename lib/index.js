const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

require('dotenv').config();

global.Log = require('./Util/Log');

exports.Web = require('./Web');
exports.Models = require('./Models');
exports.Util = require('./Util');
exports.YappyGithub = require('./Util/YappyGithub');
exports.Discord = require('./Discord');
exports.Gitlab = require('./Gitlab');

process.on('unhandledRejection', Log.error);
process.on('uncaughtException', Log.error);

/**
* Discord.JS's Client
* @external {Client}
* @see {@link https://discord.js.org/#/docs/main/master/class/Client}
*/

/**
* Discord.JS's Guild
* @external {Guild}
* @see {@link https://discord.js.org/#/docs/main/master/class/Guild}
*/

/**
* Discord.JS's Channel
* @external {Channel}
* @see {@link https://discord.js.org/#/docs/main/master/class/Channel}
*/

/**
* Discord.JS's Message
* @external {Message}
* @see {@link https://discord.js.org/#/docs/main/master/class/Message}
*/

/**
* Discord.JS's Rich Embed
* @external {MessageEmbed}
* @see {@link https://discord.js.org/#/docs/main/master/class/MessageEmbed}
*/

/**
* Discord.JS's Collection
* @external {Collection}
* @see {@link https://discord.js.org/#/docs/main/master/class/Collection}
*/

/**
* Discord.JS's Client Options
* @external {ClientOptions}
* @see {@link https://discord.js.org/#/docs/main/master/typedef/ClientOptions}
*/

/**
* Discord.JS's Color Resolvable
* @external {ColorResolvable}
* @see {@link https://discord.js.org/#/docs/main/master/typedef/ColorResolvable}
*/
