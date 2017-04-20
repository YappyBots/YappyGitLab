const express = require('express');
const bodyParser = require('body-parser');
const ChannelConfig = require('./Models/ChannelConfig');
const GitlabEventHandler = require('./Gitlab/EventHandler');
const bot = require('./Discord');

const app = express();
const port = process.env.YAPPY_GITLAB_PORT || process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
const ip = process.env.YAPPY_GITLAB_IP || process.env.OPENSHIFT_NODEJS_IP || process.env.IP || null;
const statuses = ['Online', 'Connecting', 'Reconnecting', 'Idle', 'Nearly', 'Offline'];
const statusColors = ['lightgreen', 'orange', 'orange', 'orange', 'green', 'red'];

app.set('view engine', 'hbs');

app.use(bodyParser.json({
  limit: '250kb',
}));

app.get('/', (req, res) => {
  const repos = new Set(ChannelConfig._data.reduce((a, b) => a.concat(b.repos), []));
  const status = statuses[bot.status];
  const statusColor = statusColors[bot.status];
  res.render('index', { bot, repos, status, statusColor });
});

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
  const eventResponse = GitlabEventHandler.use(data, event);

  const handleError = (resp, channel) => {
    const err = resp && resp.body;
    const errors = ['Forbidden', 'Missing Access'];
    if (!res || !err) return;
    if (errors.includes(err.message) || (err.error && errors.includes(err.error.message))) {
      channel.guild.owner.sendMessage(`**ERROR: ** Yappy GitLab doesn't have permissions to read/send messages in ${channel}`);
    } else {
      Log.error(err);
    }
  };

  channels.forEach(conf => {
    let wantsEmbed = !!conf.embed;
    let { channelId, disabledEvents } = conf;
    let channel = bot.channels.get(channelId);
    if (!channel || disabledEvents.includes(event) || disabledEvents.includes(`${event}${actionText}`)) return;

    if (wantsEmbed) {
      channel.sendMessage('', { embed: eventResponse.embed }).catch(err => handleError(err, channel));
    } else {
      channel.sendMessage(`**${repo}**: ${eventResponse.text}`).catch(err => handleError(err, channel));
    }
  });
});

app.listen(port, ip, () => {
  Log.info(`Express | Listening on ${ip || 'localhost'}:${port}`);
});

module.exports = app;
