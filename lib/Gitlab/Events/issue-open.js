const EventResponse = require('../EventResponse');

class IssueOpen extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when a new issue is created',
        });
    }

    embed(data) {
        let issue = data.object_attributes;
        return {
            color: 0xe9642d,
            title: `Opened issue #${issue.iid}: \`${issue.title}\``,
            description: issue.description,
        };
    }

    text(data) {
        const actor = data.user.name;
        const issue = data.object_attributes;
        return [`🛠  **${actor}** opened issue **#${issue.iid}**`, `        ${issue.title}`, `<${issue.url}>`].join('\n');
    }
}

module.exports = IssueOpen;
