const bookshelf = require('.');

require('./Channel');

class ChannelRepo extends bookshelf.Model {
    get tableName() {
        return 'channel_repos';
    }

    channel() {
        return this.belongsTo('Channel');
    }
}

module.exports = bookshelf.model('ChannelRepo', ChannelRepo);
