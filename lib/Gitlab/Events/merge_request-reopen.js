const EventResponse = require('../EventResponse');
const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = url => `<${url}>`;

class MergeRequestReopen extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: 'This event gets fired when a new merge request is reopened',
        });
    }

    embed(data) {
        const mergeRequest = data.object_attributes;
        const lastCommit = mergeRequest.last_commit;
        const lastCommitMessage = lastCommit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
        const lastCommitAuthor = lastCommit.author.name || data.user_username || data.user_name;
        return {
            color: 0x149617,
            title: `Repened merge request #${mergeRequest.iid}: \`${mergeRequest.title}\``,
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
                {
                    name: 'Latest Commit',
                    value: `[\`${lastCommit.id.slice(0, 7)}\`](${lastCommit.url}) ${lastCommitMessage} [${lastCommitAuthor}]`,
                },
            ],
        };
    }

    text(data) {
        const actor = data.user.name;
        const mergeRequest = data.object_attributes;
        return [`🛠  **${actor}** updated merge request **#${mergeRequest.iid}**`, `        ${mergeRequest.title}`, `<${mergeRequest.url}>`].join(
            '\n'
        );
    }
}

module.exports = MergeRequestReopen;
