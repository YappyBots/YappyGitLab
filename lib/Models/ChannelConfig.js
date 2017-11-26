const mongoose = require('mongoose');
const Collection = require('discord.js').Collection;
const Schema = mongoose.Schema;

/**
* The channel config Schema
* @typedef {Object} ChannelConfigSchema
* @property {String} guildName - Guild Name
* @property {String} guildID Guild Id
* @property {String} channelName Channel Name
* @property {String} channelID Channel Id
* @property {Array} repos Array of repos to event to channel
* @property {Array} repo Repo to use for gitlab commands in channel
* @property {Array} disabledEvents Github events to disable in this channel
* @property {Boolean} embed Use embeds for events or not
*/
const channelConfigSchema = Schema({
  guildName: String,
  guildID: String,
  channelName: String,
  channelID: String,
  repos: Array,
  repo: String,
  embed: Boolean,
  disabledEvents: {
    type: Array,
    default: [
      'merge_request/update',
      'pipeline',
    ],
  },
  ignoredUsers: Array,
  ignoredBranches: Array,
});

const channelConfig = mongoose.model('ChannelConfig', channelConfigSchema);

/**
* A Channel Config Item
*/
class ChannelConfigItem {
  constructor(client, config) {
    /**
    * The bot client
    * @type Client
    * @private
    */
    this._client = client;
    for (let key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }
  /**
  * Set a specific config property to a value for this config item
  * @param {String} prop Property to modify
  * @param {String} value The new value for the property
  * @see ChannelConfig#set
  * @return {Promise}
  */
  set(prop, value) {
    return this._client.set(this.channelID, prop, value);
  }
  /**
  * Delete repo events from channel
  * @param {String} repo Repo events to delete from channel
  * @return {Promise}
  */
  deleteRepo(repo) {
    let repos = this.repos;
    repos.splice(repos.indexOf(repo), 1);
    return this.set('repos', repos);
  }
}

/**
* The Channel Config manager
*/
class ChannelConfig {
  constructor() {
    /**
    * All the config
    * @type {Collection}
    * @private
    */
    this._data = new Collection();
    this.setup();
    this.validKeys = [
      'repos',
      'repo',
      'embed',
      'disabledEvents',
      'ignoredUsers',
      'ignoredBranches',
    ];
    this.setupEvents = false;

    /**
    * Loaded
    * @type {Boolean}
    */
    this.loaded = false;
  }
  /**
  * Get config from database and add to this._data
  */
  setup() {
    channelConfig.find({}).then(configs => {
      this.loaded = true;
      configs.forEach(row => {
        this._data.set(row.channelID, new ChannelConfigItem(this, row._doc));
      });
    }).catch(Log.error);
  }
  /**
  * Initialize configuration and Discord bot events
  * @param {external:Client} bot Client instance
  */
  init(bot) {
    if (!this.loaded) {
      setTimeout(() => this.init(bot), 5000);
      return;
    }

    for (const ch of bot.channels) {
      const channel = ch[1];
      if (!channel || channel.type !== 'text') continue;
      if (!this.has(channel.id)) {
        Log.info(`ChannelConf | Adding "${channel.guild.name}"'s #${channel.name} (${channel.id})`);
        this.add(channel).catch(e => bot.emit('error', e));
      }
    }

    if (!this.setupEvents) {
      this.setupEvents = true;
      bot.on('channelDelete', channel => {
        if (!channel || channel.type !== 'text') return;
        Log.info(`ChannelConf | Deleting "${channel.guild.name}"'s #${channel.name} (${channel.id})`);
        this.delete(channel.id).catch(Log.error);
      });
      bot.on('channelCreate', channel => {
        if (!channel || channel.type !== 'text') return;
        if (this.has(channel.id)) return;
        Log.info(`ChannelConf | Adding "${channel.guild.name}"'s #${channel.name} (${channel.id})`);
        this.add(channel).catch(e => bot.emit('error', e));
      });
    }
  }
  /**
  * Find channels with events for repo
  * @param {String} repo Repo for the events
  * @return {ChannelConfigItem}
  */
  findByRepo(repo) {
    let re = repo.toLowerCase();
    return this._data.filter(e => e.repos.filter(r => r === re)[0]);
  }
  /**
  * Get channel config
  * @param {String} channel Channel ID
  * @return {ChannelConfigItem}
  */
  get(channel) {
    return this._data.get(channel);
  }

  /**
  * Has channel in config
  * @param {String} channel Channel ID
  * @return {Boolean}
  */
  has(channel) {
    return this._data.has(channel);
  }

  /**
  * Delete all repo events from channel
  * @param {String} channelID Channel ID with the events to delete
  * @return {Promise<ChannelConfig>}
  */
  delete(channelID) {
    return channelConfig.findOneAndRemove({
      channelID: channelID,
    }).then(() => {
      this._data.delete(channelID);
      return Promise.resolve(this);
    });
  }

  /**
  * Delete all channels from guild
  * @param  {String} guildID Guild ID to delete channel configs for
  * @return {Promise}
  */
  deleteFromGuild(guildID) {
    return Promise.all(
      this._data
      .filter(c => c.guildID === guildID)
      .map(c => {
        Log.info(`ChannelConf | Deleting "${c.guildName}"'s #${c.channelName} (${c.channelID})`);
        return this.delete(c.channelID);
      })
    ).then(() => this);
  }

  /**
  * Add channel to config
  * @param {Channel} channel Channel to add repo events
  * @return {Promise<ChannelConfig>}
  */
  add(channel) {
    if (!channel || !channel.id) return Promise.reject(`No channel passed!`);
    if (channel && channel.id && this.get(channel.id)) return Promise.reject(`Channel already has an entry in database`);
    const conf = {
      guildID: channel.guild && channel.guild.id,
      guildName: channel.guild && channel.guild.name,
      channelID: channel.id,
      channelName: channel.name,
      repos: [],
      prefix: `GL! `,
      disabledEvents: [
        'merge_request/update',
        'pipeline',
      ],
    };
    return channelConfig.create(conf).then(() => {
      const item = new ChannelConfigItem(this, conf);
      this._data.set(conf.channelID, item);
      return item;
    });
  }

  /**
  * Add all channels from guild
  * @param  {Guild} guild Guild obj to add channel configs for
  * @return {Promise}
  */
  addFromGuild(guild) {
    return Promise.all(
      guild.channels
      .filter(c => c.type === 'text')
      .map(c => {
        Log.info(`ChannelConf | Adding "${c.guildName}"'s #${c.channelName} (${c.channelID})`);
        return this.add(c);
      })
    ).then(() => this);
  }

  /**
  * Replace specific channel config prop with value
  * @param {String} channel Channel with the repo events
  * @param {String} prop Property to set
  * @param {String} value Value to set property to
  * @return {Promise<ChannelConfig>} updated config item
  */
  set(channel, prop, value) {
    return new Promise((resolve, reject) => {
      let oldConfig = this._data.find('channelID', channel);
      let newConfig = oldConfig;
      newConfig[prop] = value;
      channelConfig.findOneAndUpdate({
        channelID: channel,
      }, newConfig, {
        new: true,
      }, (err) => {
        if (err) return reject(err);
        this._data.set(channel, new ChannelConfigItem(this, newConfig));
        resolve(this);
      });
    });
  }

  /**
  * Add repo to channel
  * @param {Channel} channel Channel to add repo to
  * @param {String} repo repo to add to channel
  * @see ChannelConfig#set
  * @return {Promise<ChannelConfig>}
  */
  addRepoToChannel(channel, repo) {
    if (!channel || !repo) return Promise.reject(`Invalid arguments.`);
    let conf = this.get(channel);
    let repos = conf.repos;
    repos.push(repo.toLowerCase());
    return this.set(channel, 'repos', repos);
  }

  /**
  * Delete repo events from specific channel
  * @param {String} channel Channel with the repo events
  * @param {String} repo Repo event to remove from Channel
  * @see ChannelConfig#set
  * @return {Promise<ChannelConfig>}
  */
  deleteRepo(channel, repo) {
    return channelConfig.findOneAndRemove({
      repo,
    }).then(() => {
      let oldRepos = this._data.find('channelID', channel);
      let newRepos = oldRepos.slice(0, oldRepos.indexOf(repo));
      return this.set(channel, 'repos', newRepos);
    });
  }
}

module.exports = new ChannelConfig();
