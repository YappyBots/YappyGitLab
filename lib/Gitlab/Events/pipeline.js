const EventResponse = require('../EventResponse');

class Pipeline extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: `This event is fired when a pipeline job finishes.`,
    });
  }
  embed(data) {
    if (data.object_attributes.status !== 'success' && data.object_attributes.status !== 'failed') return;

    const branch = data.project.default_branch;
    const id = data.object_attributes.id;
    const result = data.object_attributes.status === 'success' ? 'passed' : 'failed';
    const color = result === 'passed' ? 'success' : 'error';
    const duration = data.object_attributes.duration;

    const url = `${data.project.web_url}/pipelines/${id}`;
    const description = `Pipeline [\`#${id}\`](${url}) of \`${branch}\` branch **${result}** in ${duration} seconds.`;

    return {
      color,
      description,
    };
  }
  text(data) {
    if (data.object_attributes.status !== 'success' && data.object_attributes.status !== 'failed') return;

    const actor = data.user.username;
    const branch = data.project.default_branch;
    const id = data.object_attributes.id;
    const result = data.object_attributes.status === 'success' ? 'passed' : 'failed';
    const icon = result === 'passed' ? ':white_check_mark:' : ':no_entry:';
    const duration = data.object_attributes.duration;

    const msg = `Pipeline \`#${id}\` of \`${branch}\` branch created by *${actor}* **${result}** in ${duration} seconds. ${icon}\n` +
              `<${data.project.web_url}/pipelines/${id}>`;
    return msg;
  }
}

module.exports = Pipeline;
