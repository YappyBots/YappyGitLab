const bookshelf = require('.');

require('./Channel');

class ChannelOrg extends bookshelf.Model {
    get tableName() {
        return 'channel_orgs';
    }

    channel() {
        return this.belongsTo('Channel');
    }
}

module.exports = bookshelf.model('ChannelOrg', ChannelOrg);
