const EventResponse = require('../EventResponse');
const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

class MergeRequestOpen extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when a new merge request is opened',
    });
  }

  embed(data) {
    let mergeRequest = data.object_attributes;
    let lastCommit = mergeRequest.last_commit;
    let lastCommitMessage = lastCommit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
    let lastCommitAuthor = lastCommit.author.name || data.user_name;
    return {
      color: 0x149617,
      title: `Opened merge request #${mergeRequest.iid}: \`${mergeRequest.title}\``,
      description: `${mergeRequest.description}\n\u200B`,
      fields: [{
        name: 'Source',
        value: `${mergeRequest.source.name}/${mergeRequest.source_branch}`,
        inline: true,
      }, {
        name: 'Target',
        value: `${mergeRequest.target.name}/${mergeRequest.target_branch}`,
        inline: true,
      }, {
        name: 'Status',
        value: mergeRequest.work_in_progress ? 'WIP' : 'Finished',
        inline: true,
      }, {
        name: 'Latest Commit',
        value: `[\`${lastCommit.id.slice(0, 7)}\`](${lastCommit.url}) ${lastCommitMessage} [${lastCommitAuthor}]`,
      }],
    };
  }

  text(data) {
    const actor = data.user.name;
    const mergeRequest = data.object_attributes;
    return [
      `🛠  **${actor}** opened merge request **#${mergeRequest.iid}**`,
      `        ${mergeRequest.title}`,
      `<${mergeRequest.url}>`,
    ].join('\n');
  }
}

module.exports = MergeRequestOpen;
