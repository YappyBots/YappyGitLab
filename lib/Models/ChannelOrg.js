const bookshelf = require('.');
const Model = require('./Model');

require('./Channel');

class ChannelOrg extends Model {
    get tableName() {
        return 'channel_orgs';
    }

    channel() {
        return this.belongsTo('Channel');
    }
}

module.exports = bookshelf.model('ChannelOrg', ChannelOrg);
