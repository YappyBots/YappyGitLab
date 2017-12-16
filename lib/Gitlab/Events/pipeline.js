const EventResponse = require('../EventResponse');
const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = (url) => `<${url}>`;

class Pipeline extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This event is fired when a pipeline job finishes.`,
    });
  }
  embed(data) {
    if (data.object_attributes.status != 'success' && data.object_attributes.status != 'failed') return;

    const actor = data.user.username;
    const branch = data.project.default_branch;
    const id = data.object_attributes.id;
    const result = data.object_attributes.status === 'success' ? 'passed' : 'failed';
    const color = result === 'passed' ? 'success' : 'error';
    const duration = data.object_attributes.duration;
    
    let url = `${data.project.web_url}/pipelines/${id}`;
    let description = `Pipeline [\`#${id}\`](${url}) of \`${branch}\` branch **${result}** in ${duration} seconds.`;

    return {
        color,
        description
    };

    // const branch = data.ref ? data.ref.split('/')[2] : 'unknown';
    // const commits = data.commits || [];
    // let pretext = commits.map(commit => {
    //   let commitMessage = commit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
    //   let author = commit.author.name || data.user_name;
    //   let sha = commit.id.slice(0, 7);
    //   return `[\`${sha}\`](${commit.url}) ${commitMessage} [${author}]`;
    // });
    // pretext.length = data.total_commits_count > 5 ? 5 : pretext.length;
    // const description = pretext.join('\n');

    // return {
    //   color: 0x7289DA,
    //   title: `Pushed ${data.total_commits_count} ${commits.length !== 1 ? 'commits' : 'commit'} to \`${branch}\``,
    //   url: `${data.project.web_url}/compare/${data.before.slice(0, 7)}...${data.after.slice(0, 7)}`,
    //   description,
    // };
  }
  text(data) {
    if (data.object_attributes.status != 'success' && data.object_attributes.status != 'failed') return;

    const actor = data.user.username;
    const branch = data.project.default_branch;
    const id = data.object_attributes.id;
    const result = data.object_attributes.status === 'success' ? 'passed' : 'failed';
    const icon = result === 'passed' ? ':white_check_mark:' : ':no_entry:';
    const duration = data.object_attributes.duration;
    
    let msg = `Pipeline \`#${id}\` of \`${branch}\` branch created by *${actor}* **${result}** in ${duration} seconds. ${icon}` +
              `<${data.project.web_url}/pipelines/${id}>`;
    return msg;
  }
}

module.exports = Pipeline;
