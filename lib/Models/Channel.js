const bookshelf = require('.');
const Model = require('./Model');

require('./Guild');
require('./ChannelRepo');
require('./ChannelOrg');

class Channel extends Model {
    get tableName() {
        return 'channels';
    }

    static get validKeys() {
        return ['repo', 'useEmbed'];
    }

    get casts() {
        return {
            useEmbed: 'boolean',

            eventsList: 'array',
            usersList: 'array',
            branchesList: 'array',
        };
    }

    guild() {
        return this.belongsTo('Guild');
    }

    repos() {
        return this.hasMany('ChannelRepo');
    }

    orgs() {
        return this.hasMany('ChannelOrg');
    }

    getRepos() {
        return this.related('repos').pluck('name');
    }

    getOrgs() {
        return this.related('org').pluck('name');
    }

    async addRepo(repo) {
        await this.related('repos').create({
            name: repo,
        });

        return this;
    }

    async addOrg(org) {
        await this.related('org').save({
            name: org,
        });

        return this;
    }

    static async find(channel, ...args) {
        let ch = await super.find(channel.id || channel, ...args);

        if (!ch && channel.id) ch = this.create(channel);

        return ch;
    }

    static create(channel) {
        Log.info(`DB | Channels + "${channel.guild.name}"'s #${channel.name} (${channel.id})`);

        return this.forge({
            id: channel.id,
            name: channel.name,

            guildId: channel.guild.id,
        }).save(null, {
            method: 'insert',
        });
    }

    /**
     * Delete channel
     * @param {external:Channel} channel
     * @param {boolean} [fail]
     */
    static delete(channel, fail = true) {
        Log.info(`DB | Channels - "${channel.guild.name}"'s #${channel.name} (${channel.id})`);

        return this.forge({
            id: channel.id,
        }).destroy({
            require: fail,
        });
    }

    static findByRepo(repo) {
        const r = repo.toLowerCase();

        return this.query(qb => qb.join('channel_repos', 'channel_repos.channel_id', 'channels.id').where('channel_repos.name', r)).fetchAll();
    }

    static findByOrg(org) {
        const r = org.toLowerCase();

        return this.query(qb => qb.join('channel_orgs', 'channel_orgs.channel_id', 'channels.id').where('channel_orgs.name', r)).fetchAll();
    }

    static async addRepoToChannel(channel, repo) {
        const ch = await this.find(channel);

        return ch && ch.addRepo(repo);
    }
}

module.exports = bookshelf.model('Channel', Channel);
