const EventResponse = require('../EventResponse');

class NoteMergeRequest extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when someone comments on a merge request',
        });
    }

    embed(data) {
        const comment = data.object_attributes;
        const mergeRequest = data.merge_request;
        return {
            color: 0x996633,
            title: `Commented on merge request #${mergeRequest.iid}: \`${mergeRequest.title}\``,
            description: comment.note,
        };
    }

    text(data) {
        const actor = data.user.name;
        const comment = data.object_attributes;
        const mergeRequest = data.merge_request;
        return [
            `**${actor}** commented on merge request **#${mergeRequest.iid}** _${mergeRequest.title}_`,
            `    ${comment.note.slice(0, 100).replace(/\n/g, '\n   ')}`,
            `${comment.url}`,
        ].join('\n');
    }
}

module.exports = NoteMergeRequest;
