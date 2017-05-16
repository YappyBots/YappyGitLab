const EventResponse = require('../EventResponse');

class TagPush extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This event is fired when a tag is created/deleted`,
    });
  }

  embed(data) {
    const tag = data.ref ? data.ref.split('/')[2] : 'unknown';
    const sha = data.checkout_sha ? data.checkout_sha.slice(0, 7) : null;
    const message = data.messsage || '';
    const commitCount = data.total_commits_count;
    const isCreated = this.isCreated(data);

    return {
      color: 0xF0C330,
      title: `${this.isCreated(data) ? 'Created' : 'Deleted'} tag \`${tag}\` ${sha ? `from commit \`${sha}\`` : ''}${isCreated ? ` with ${commitCount} ${commitCount !== 1 ? 'commits' : 'commit'}` : ''}`,
      url: isCreated ? `${data.project.web_url}/tags/${tag}` : null,
      description: `${message.slice(0, 2000)}${message.length > 2000 ? '...' : ''}`,
    };
  }

  text(data) {
    const actor = data.user_name;
    const tag = data.ref ? data.ref.split('/')[2] : 'unknown';
    const sha = data.checkout_sha ? data.checkout_sha.slice(0, 7) : null;
    const message = data.messsage || '';
    const commitCount = data.total_commits_count;
    const isCreated = this.isCreated(data);

    return [
      `⚡ **${actor}** ${isCreated ? 'created' : 'deleted'} tag \`${tag}\` ${sha ? `from commit \`${sha}\`` : ''}${isCreated ? `with ${commitCount} ${commitCount !== 1 ? 'commits' : 'commit'}` : ''}`,
      `  ${message.slice(0, 200)}${message.length > 200 ? '...' : ''}`, ` `,
      `${isCreated ? `<${data.project.web_url}/tags/${tag}>` : ''}`,
    ].filter(e => e !== '').join('\n');
  }

  isCreated(data) {
    return data.before === '0000000000000000000000000000000000000000';
  }
}

module.exports = TagPush;
