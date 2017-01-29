const EventResponse = require('../EventResponse');

class Issue extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when a new issue is created or an existing issue was updated/closed/reopened',
    });
  }

  embed(data) {
    let issue = data.object_attributes;
    return {
      color: 0xE9642D,
      title: `Opened issue #${issue.iid}: \`${issue.title}\``,
      description: `${issue.description}`,
    };
  }

  text(data) {
    const actor = data.user.name;
    const issue = data.object_attributes;
    return [
      `🛠  **${actor}** opened issue **#${issue.iid}**`,
      `        ${issue.title}`,
      `<${issue.url}>`,
    ].join('\n');
  }
}

module.exports = Issue;
