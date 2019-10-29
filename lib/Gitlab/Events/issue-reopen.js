const EventResponse = require('../EventResponse');

class IssueReopen extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when an issue is reopened',
    });
  }

  embed(data) {
    const issue = data.object_attributes;
    return {
      color: 0xe9642d,
      title: `Reopened issue #${issue.iid} \`${issue.title}\``,
      description: issue.description,
    };
  }

  text(data) {
    const actor = data.user.name;
    const issue = data.object_attributes;
    return [
      `🛠  **${actor}** reopened issue **#${issue.iid}** _${issue.title}_`,
      `<${issue.url}>`,
    ].join('\n');
  }
}

module.exports = IssueReopen;
