const EventResponse = require('../EventResponse');

class NoteSnippet extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when someone comments on a code snippet',
    });
  }

  embed(data) {
    const comment = data.object_attributes;
    const snippet = data.snippet;
    return {
      color: `#996633`,
      title: `Commented on snippet \`${snippet.title}\``,
      description: comment.note,
    };
  }

  text(data) {
    const actor = data.user.name;
    const comment = data.object_attributes;
    const snippet = data.snippet;
    return [
      `**${actor}** commented on snippet **#${snippet.title}**`,
      `    ${comment.note.slice(0, 100).replace(/\n/g, '\n   ')}`,
      `${comment.url}`,
    ].join('\n');
  }
}

module.exports = NoteSnippet;
