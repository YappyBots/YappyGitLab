const EventResponse = require('../EventResponse');

class WikiPageDelete extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event is fired when a wiki page is deleted',
        });
    }

    embed(data) {
        const page = data.object_attributes;
        return {
            color: 0x29bb9c,
            title: `Deleted wiki page \`${page.title}\``,
        };
    }

    text(data) {
        const actor = data.user.name;
        const page = data.object_attributes;
        return [`📰 **${actor}** deleted wiki page **${page.title}**`].join('\n');
    }
}

module.exports = WikiPageDelete;
