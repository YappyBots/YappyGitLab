const EventResponse = require('../EventResponse');
const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

class Push extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This event is fired when someone pushes commits to a branch.`,
    });
  }
  embed(data) {
    const branch = data.ref ? data.ref.split('/')[2] : 'unknown';
    const commits = data.commits || [];
    let pretext = commits.map(commit => {
      let commitMessage = commit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
      let author = commit.author.name || data.user_name;
      let sha = commit.id.slice(0, 7);
      return `[\`${sha}\`](${commit.url}) ${commitMessage} [${author}]`;
    });

    pretext.length = data.total_commits_count > 5 ? 5 : pretext.length;

    let description = pretext.join('\n');
    return {
      color: '7289DA',
      title: `Pushed ${data.total_commits_count} ${commits.length !== 1 ? 'commits' : 'commit'} to \`${branch}\``,
      url: `${data.project.web_url}/compare/${data.before.slice(0, 7)}...${data.after.slice(0, 7)}`,
      description,
    };
  }
  text(data) {
    const actor = data.user_name;
    const branch = data.ref ? data.ref.split('/')[2] : 'unknown';
    const commits = data.commits || [];
    const commitCount = data.total_commits_count || 'unknown';
    if (!commitCount) return '';
    let msg = `⚡ **${actor}** pushed ${commitCount} ${commitCount !== 1 ? 'commits' : 'commit'} to \`${branch}\``;
    let commitArr = commits.map(commit => {
      let commitMessage = commit.message.replace(/\n/g, '\n               ').replace(UrlRegEx, RemoveUrlEmbedding);
      return `        \`${commit.id.slice(0, 7)}\` ${commitMessage} [${commit.author.name || actor}]`;
    });
    commitArr.length = commitCount > 5 ? 5 : commitArr.length;
    msg += `\n${commitArr.join('\n')}`;
    msg += `\n<${data.project.web_url}/compare/${data.before.slice(0, 7)}...${data.after.slice(0, 7)}>`;

    return msg;
  }
}

module.exports = Push;
