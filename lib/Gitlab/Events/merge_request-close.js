const EventResponse = require('../EventResponse');

class MergeRequestClose extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when a new merge request is closed',
        });
    }

    embed(data) {
        const mergeRequest = data.object_attributes;
        return {
            color: 0x149617,
            title: `Closed merge request #${mergeRequest.iid}: \`${mergeRequest.title}\``,
            description: `${mergeRequest.description}\n\u200B`,
            fields: [
                {
                    name: 'Source',
                    value: `${mergeRequest.source.name}/${mergeRequest.source_branch}`,
                    inline: true,
                },
                {
                    name: 'Target',
                    value: `${mergeRequest.target.name}/${mergeRequest.target_branch}`,
                    inline: true,
                },
                {
                    name: 'Status',
                    value: mergeRequest.work_in_progress ? 'WIP' : 'Finished',
                    inline: true,
                },
            ],
        };
    }

    text(data) {
        const actor = data.user.name;
        const mergeRequest = data.object_attributes;
        return [`🛠  **${actor}** closed merge request **#${mergeRequest.iid}**`, `        ${mergeRequest.title}`, `<${mergeRequest.url}>`].join('\n');
    }
}

module.exports = MergeRequestClose;
