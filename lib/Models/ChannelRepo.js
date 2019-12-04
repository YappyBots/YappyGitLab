const bookshelf = require('.');
const Model = require('./Model');

require('./Channel');

class ChannelRepo extends Model {
    get tableName() {
        return 'channel_repos';
    }

    channel() {
        return this.belongsTo('Channel');
    }
}

module.exports = bookshelf.model('ChannelRepo', ChannelRepo);
