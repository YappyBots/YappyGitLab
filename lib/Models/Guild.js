const bookshelf = require('.');

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
}

module.exports = bookshelf.model('Guild', Guild);
