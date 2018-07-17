const EventResponse = require('../EventResponse');
const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

class MergeRequestApproved extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when a merge request is approved',
    });
  }

  embed(data) {
    const mergeRequest = data.object_attributes;
    return {
      color: 0x149617,
      title: `approved merge request #${mergeRequest.iid}: \`${mergeRequest.title}\``,
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
      }],
    };
  }

  text(data) {
    const actor = data.user.name;
    const issue = data.object_attributes;
    return [
      `🛠  **${actor}** approved issue **#${issue.iid}** _${issue.title}_`,
      `<${issue.url}>`,
    ].join('\n');
  }
}

module.exports = MergeRequestApproved;
