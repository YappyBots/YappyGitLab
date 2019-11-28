const bookshelf = require('.');
const prefixCache = new Map();

require('./Channel');

class Guild extends bookshelf.Model {
    get tableName() {
        return 'guilds';
    }

    static get validKeys() {
        return ['prefix'];
    }

    channels() {
        return this.belongsTo('Channel');
    }

    static create(guild) {
        Log.info(`DB | Guilds + Adding '${guild.name}' (${guild.id})`);

        return this.forge({
            id: guild.id,
            name: guild.name,
        }).save(null, {
            method: 'insert',
        });
    }

    /**
     * Delete guild
     * @param {external:Guild} guild
     * @param {boolean} [fail]
     */
    static delete(guild, fail = true) {
        Log.info(`DB | Guilds - Deleting '${guild.name}' (${guild.id})`);

        return this.forge({
            id: guild.id,
        }).destroy({
            require: fail,
        });
    }

    /**
     * Get prefix for guild. Obtains prefix from DB only if not cached.
     * @param {external:Guild} guild
     */
    static getPrefix(guild) {
        const id = guild.id;

        if (prefixCache.has(id)) return prefixCache.get(id);

        return Guild.find(guild.id)
            .then(conf => {
                const prefix = conf.get('prefix');

                prefixCache.set(id, prefix);

                return prefix;
            })
            .catch(() => null);
    }

    /**
     * Update cached prefix for guild
     * @param {external:Guild} guild
     * @param {string} prefix
     */
    static updateCachedPrefix(guild, prefix) {
        prefixCache.set(guild.id, prefix);
    }
}

module.exports = bookshelf.model('Guild', Guild);
