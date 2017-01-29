const express = require('express');
const bodyParser = require('body-parser');
const ChannelConfig = require('./Models/ChannelConfig');
const GitlabEventHandler = require('./Gitlab/EventHandler');
const bot = require('./Discord');

const app = express();
const port = process.env.YAPPY_GITLAB_PORT || process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
const ip = process.env.YAPPY_GITLAB_IP || process.env.OPENSHIFT_NODEJS_IP || process.env.IP || null;

app.use(bodyParser.json({
  limit: '250kb',
}));

app.post(['/', '/gitlab'], (req, res) => {
  const event = req.headers['x-gitlab-event'];
  const eventName = event.replace(` Hook`, '').replace(/ /g, '_').toLowerCase();
  const data = req.body;

  if (!event || !data || !data.project) return res.status(403).send('Invalid data. Plz use Gitlab webhooks.');

  const repo = data.project.path_with_namespace;
  const channels = ChannelConfig.FindByRepo(repo);
  const actionText = data.object_attributes && data.object_attributes.action ? `/${data.object_attributes.action}` : '';
  Log.verbose(`GitLab | ${repo} - ${eventName}${actionText}`);
  res.send(`${repo} : Received ${eventName}${actionText}, emitting to ${channels.size} channels...`);

  channels.forEach(conf => {
    let wantsEmbed = !!conf.embed;
    let { channelId, disabledEvents } = conf;
    let channel = bot.channels.get(channelId);
    if (!channel || disabledEvents.includes(event) || disabledEvents.includes(`${event}${actionText}`)) return;

    if (wantsEmbed) {
      let embed = GitlabEventHandler.use(data, event, 'embed');
      channel.sendMessage('', { embed }).catch(err => {
        if (err && ((err.message && err.message === 'Forbidden') || (err.error && err.error.message === 'Forbidden'))) {
          channel.guild.owner.sendMessage(`Yappy doesn't have permissions to send messages in ${channel}`);
        } else {
          Log.error(err);
        }
      });
    } else {
      let text = GitlabEventHandler.use(data, event);
      channel.sendMessage(`**${repo}**: ${text}`);
    }
  });
});

app.listen(port, ip, () => {
  Log.info(`Express | Listening on ${ip || 'localhost'}:${port}`);
});

module.exports = app;
