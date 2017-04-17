const EventResponse = require('../EventResponse');

class WikiPageUpdate extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event is fired when a wiki page is updated',
    });
  }

  embed(data) {
    const page = data.object_attributes;
    return {
      color: 0x29BB9C,
      title: `Updated wiki page \`${page.title}\``,
      description: page.content,
    };
  }

  text(data) {
    const actor = data.user.name;
    const page = data.object_attributes;
    return [
      `📰 **${actor}** updated wiki page **${page.title}**`,
      `        ${page.content.slice(0, 100).replace(/\n/g, '  ')}`,
      `<${page.url}>`,
    ].join('\n');
  }
}

module.exports = WikiPageUpdate;
