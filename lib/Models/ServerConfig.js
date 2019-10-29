const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ChannelConfig = require('./ChannelConfig');

/**
 * The server config Schema
 * @typedef {Object} ServerConfigSchema
 * @property {String} guildName Guild Name
 * @property {String} guildID Guild ID
 * @property {String} prefix Prefix
 */
const serverConfigSchema = Schema({
  guildName: String,
  guildID: String,
  prefix: String,
});

const serverConfig = mongoose.model('ServerConfig', serverConfigSchema);

/**
 * A Channel Config Item
 */
class ServerConfigItem {
  constructor(client, config) {
    /**
     * The config manager
     * @type ServerConfig
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
   * @see ServerConfig#set
   * @return {Promise<ServerConfig>}
   */
  set(prop, value) {
    return this._client.set(this.guildID, prop, value);
  }

  /**
   * Delete guild config
   * @see ServerConfig#delete
   * @return {Promise<ServerConfig>}
   */
  delete() {
    return this._client.delete(this.guildID);
  }
}

/**
 * The Channel Config manager
 */
class ServerConfig {
  constructor() {
    /**
     * All the config
     * @type {WeakMap}
     * @private
     */
    this._data = new Map();
    this.validKeys = ['prefix'];
    this.setupEvents = false;

    /**
     * Loaded
     * @type {Boolean}
     */
    this.loaded = false;
  }

  /**
   * Initialize configuration and Discord bot events
   * @param {external:Client} bot Client instance
   */
  init(bot) {
    if (!this.setupEvents) {
      this.setupEvents = true;

      bot.on('guildDelete', guild => {
        if (!guild || !guild.available) return;
        Log.info(`ServerConf | Deleting "${guild.name}"`);
        this.delete(guild.id).catch(e => bot.emit('error', e));
        ChannelConfig.deleteFromGuild(guild.id).catch(e =>
          bot.emit('error', e)
        );
      });
      bot.on('guildCreate', guild => {
        if (!guild || !guild.available) return;
        const g = this.get(guild.id);
        if (g) return;
        Log.info(`ServerConf | Adding "${guild.name}"`);
        this.add(guild).catch(e => bot.emit('error', e));
        ChannelConfig.addFromGuild(guild).catch(e => bot.emit('error', e));
      });
    }
  }

  /**
   * Delete guild config
   * @param {Guild|String} guildID Guild config to delete
   * @return {Promise<ServerConfig>}
   */
  delete(guildID) {
    if (guildID.id) guildID = guildID.id;
    return serverConfig
      .findOneAndRemove({
        guildID,
      })
      .then(() => {
        this._data.delete(guildID);

        return this;
      });
  }

  /**
   * Get server config for server, retreive from DB if not cached, create if non-existent
   * @param  {Server} server discord server object
   * @return {ServerConfigItem}
   */
  async forServer(server) {
    return (
      this._data.get(server.id) ||
      this.addToCache(
        (await serverConfig.findOne({ guildID: server.id })) ||
          (await this.add(server))
      )
    );
  }

  /**
   * Add config item to cache
   * @param {Mixed} item item to add to cache
   * @return {ServerConfigItem}
   */
  addToCache(item) {
    if (item._doc) item = item._doc;
    if (!(item instanceof ServerConfigItem))
      item = new ServerConfigItem(this, item);
    if (this._data.has(item.guildID)) return item;

    this._data.set(item.guildID, item);

    return item;
  }

  /**
   * Add channel to config
   * @param {Guild} guild Guild to add config of
   * @return {Promise<ServerConfig>}
   */
  add(guild) {
    if (!guild || !guild.id) return Promise.reject(`No guild passed!`);
    if (this.has(guild.id))
      return Promise.reject(`Guild already has an entry in database`);
    let conf = {
      guildID: guild.id,
      guildName: guild.name,
      prefix: `GL! `,
    };

    return serverConfig.create(conf).then(() => {
      this._data.set(conf.guildID, new ServerConfigItem(this, conf));
      return this;
    });
  }

  /**
   * Replace specific guild config prop with value
   * @param {Guild|String} guildID Guild id to change config of
   * @param {String} prop Property to set
   * @param {String} value Value to set property to
   * @return {Promise<ServerConfig>} updated config item
   */
  set(guildID, prop, value) {
    return new Promise((resolve, reject) => {
      if (guildID.id) guildID = guildID.id;
      let oldConfig = this._data.get(guildID);
      let newConfig = oldConfig;
      newConfig[prop] = value;
      serverConfig.findOneAndUpdate(
        {
          guildID,
        },
        newConfig,
        {
          new: true,
        },
        err => {
          if (err) return reject(err);
          this._data.set(
            newConfig.channel,
            new ServerConfigItem(this, newConfig)
          );
          resolve(this);
        }
      );
    });
  }

  /**
   * Get guild conf
   * @param {Guild|String} guildID Guild id to change config of
   * @return {ServerConfigItem} updated config item
   */
  get(guildID) {
    return this._data.get(guildID.id || guildID);
  }

  /**
   * Has guild conf
   * @param {Guild|String} guildID Guild id to check if has config
   * @return {Boolean}
   */
  has(guildID) {
    return this._data.has(guildID.id || guildID);
  }
}

module.exports = new ServerConfig();
