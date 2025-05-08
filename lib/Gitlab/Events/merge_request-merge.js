const EventResponse = require('../EventResponse');

class MergeRequestMerge extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when a new merge request is merged',
        });
    }

    embed(data) {
        const mergeRequest = data.object_attributes;
        const mergedCommitSha = mergeRequest.merge_commit_sha;
        return {
            color: 0x149617,
            title: `Merged merge request #${mergeRequest.iid}: \`${mergeRequest.title}\``,
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
                    name: 'Merge Commit',
                    value: mergedCommitSha ? `\`${mergedCommitSha.slice(0, 7)}\`` : '???',
                    inline: true,
                },
            ],
        };
    }

    text(data) {
        const actor = data.user.name;
        const mergeRequest = data.object_attributes;
        return [`🛠  **${actor}** merged merge request **#${mergeRequest.iid}**`, `        ${mergeRequest.title}`, `<${mergeRequest.url}>`].join(
            '\n'
        );
    }
}

module.exports = MergeRequestMerge;
