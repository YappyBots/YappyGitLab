const EventResponse = require('../EventResponse');

class Issue extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when a test issue event is executed',
        });
    }

    embed(data) {
        const issue = data.object_attributes;

        return {
            color: 0xfffc00,
            title: `Issue #${issue.iid}: ${issue.title}`,
            description: 'A test issue event was fired from the GitLab integrations page',
            fields: [
                {
                    name: 'Description',
                    value: `${issue.description.split('\n').slice(0, 4).join('\n').slice(0, 2000)}\n\u200B`,
                },
                {
                    name: 'State',
                    value: issue.state[0].toUpperCase() + issue.state.slice(1),
                    inline: true,
                },
                {
                    name: 'Created At',
                    value: new Date(issue.created_at).toGMTString(),
                    inline: true,
                },
                {
                    name: 'Labels',
                    value: data.labels && data.labels.length ? data.labels.map((l) => `\`${l.title}\``).join(', ') : 'None',
                },
            ],
        };
    }

    text(data) {
        const { user: actor, object_attributes: issue } = data;

        return [`🤦‍♂️ **${actor.name}** tested an issue event, and issue **#${issue.iid}** was sent.`, `<${issue.url}>`].join('\n');
    }
}

module.exports = Issue;
