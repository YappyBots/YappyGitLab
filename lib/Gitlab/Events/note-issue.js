const EventResponse = require('../EventResponse');

class NoteIssue extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when someone comments on an issue',
        });
    }

    embed(data) {
        const comment = data.object_attributes;
        const issue = data.issue;
        return {
            color: 0x996633,
            title: `Commented on issue #${issue.iid}: \`${issue.title}\``,
            description: comment.note,
        };
    }

    text(data) {
        const actor = data.user.name;
        const comment = data.object_attributes;
        const issue = data.issue;
        return [
            `**${actor}** commented on issue **#${issue.iid}** _${issue.title}_`,
            `    ${comment.note.slice(0, 100).replace(/\n/g, '\n   ')}`,
            `${comment.url}`,
        ].join('\n');
    }
}

module.exports = NoteIssue;
