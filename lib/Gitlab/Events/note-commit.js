const EventResponse = require('../EventResponse');

class NoteCommit extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event gets fired when someone comments on a commit',
    });
  }

  embed(data) {
    const comment = data.object_attributes;
    const sha = comment.commit_id.slice(0, 7);
    return {
      color: `#996633`,
      title: `Commented on commit \`${sha}\``,
      description: comment.note,
    };
  }

  text(data) {
    const actor = data.user.name;
    const comment = data.object_attributes;
    const sha = comment.commit_id.slice(0, 7);
    return [
      `**${actor}** commented on commit \`${sha}\``,
      `    ${comment.note.slice(0, 100).replace(/\n/g, '\n   ')}`,
      `${comment.url}`,
    ].join('\n');
  }
}

module.exports = NoteCommit;
