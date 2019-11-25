const EventResponse = require('../EventResponse');

class IssueUpdate extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when an issue is updated',
        });
    }

    embed(data) {
        const issue = data.object_attributes;
        return {
            color: 0xe9642d,
            title: `Updated issue #${issue.iid} \`${issue.title}\``,
            description: issue.description,
        };
    }

    text(data) {
        const actor = data.user.name;
        const issue = data.object_attributes;
        return [`🛠  **${actor}** updated issue **#${issue.iid}** _${issue.title}_`, `<${issue.url}>`].join('\n');
    }
}

module.exports = IssueUpdate;
