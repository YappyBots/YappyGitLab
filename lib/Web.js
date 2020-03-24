const express = require('express');
const bodyParser = require('body-parser');
const get = require('lodash/get');
const GitlabEventHandler = require('./Gitlab/EventHandler');
const bot = require('./Discord');
const addons = require('@YappyBots/addons');

const GetBranchName = require('./Util').GetBranchName;
const filter = require('./Util/filter');
const parser = require('./Gitlab/parser');

const Channel = require('./Models/Channel');
const ChannelRepo = require('./Models/ChannelRepo');

const app = express();
const port = process.env.WEB_PORT || process.env.PORT || 8080;
const ip = process.env.WEB_IP || process.env.IP || null;

app.set('view engine', 'hbs');

app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: '5mb',
    })
);

app.use(
    bodyParser.json({
        limit: '5mb',
    })
);

app.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded' && req.body && req.body.payload) {
        req.body = JSON.parse(req.body.payload);
    }
    next();
});

app.get('/', async (req, res) => {
    const repos = await ChannelRepo.count();
    const status = bot.statuses[bot.ws.status];
    const statusColor = bot.statusColors[bot.ws.status];

    res.render('index', {
        bot,
        repos,
        status,
        statusColor,
        layout: 'layout',
    });
});

app.post('/', async (req, res) => {
    const event = req.headers['x-gitlab-event'];
    const eventName = event && event.replace(` Hook`, '').replace(/ /g, '_').toLowerCase();
    const data = req.body;

    if (!event || !data || (!data.project && !data.repository)) return res.status(403).send('Invalid data. Plz use Gitlab webhooks.');

    const repo = get(data, 'project.path_with_namespace') || parser.getRepo(get(data, 'repository.url'));
    const channels = (repo && (await Channel.findByRepo(repo))) || [];

    const action = get(data, 'object_attributes.action');
    const actionText = action ? `/${action}` : '';

    Log.verbose(`GitLab | ${repo} - ${eventName}${actionText} (${channels.length} channels)`);

    res.send(`${repo} : Received ${eventName}${actionText}, emitting to ${channels.length} channels...`);

    const eventResponse = GitlabEventHandler.use(data, event);

    if (!eventResponse) return res.status(500).send('An error occurred when generating the Discord message');
    if (!eventResponse.embed && !eventResponse.text) return Log.warn(`GitLab | ${repo} - ${eventName}${actionText} ignored`);

    const handleError = (resp, channel) => {
        const err = (resp && resp.body) || resp;
        const errors = ['Forbidden', 'Missing Access'];
        if (!res || !err) return;
        if (errors.includes(err.message) || (err.error && errors.includes(err.error.message))) {
            channel.guild.owner.send(`**ERROR:** Yappy GitLab doesn't have permissions to read/send messages in ${channel}`);
        } else {
            channel.guild.owner.send(
                [
                    `**ERROR:** An error occurred when trying to read/send messages in ${channel}.`,
                    "Please report this to the bot's developer\n",
                    '```js\n',
                    err,
                    '\n```',
                ].join(' ')
            );
            Log.error(err);
        }
    };

    const actor = {
        name: get(data, 'user.username') || data.user_username,
        id: get(data, 'user.id') || data.user_id,
    };
    const branch = data.ref ? GetBranchName(data.ref) : data.object_attributes.ref;

    channels.forEach((conf) => {
        const wantsEmbed = conf.get('useEmbed');
        const channel = bot.channels.get(conf.id);

        if (!channel) return;

        if (
            !filter[conf.get('eventsType')](conf.get('eventsList'))(eventName + actionText) ||
            !filter[conf.get('usersType')](conf.get('usersList'))(actor.name) ||
            !filter[conf.get('branchesType')](conf.get('branchesList'))(branch)
        ) {
            return;
        }

        if (wantsEmbed) {
            channel.send({ embed: eventResponse.embed }).catch((err) => handleError(err, channel));
        } else {
            channel.send(`**${repo}**: ${eventResponse.text}`).catch((err) => handleError(err, channel));
        }
    });
});

app.use(
    addons.express.middleware(
        bot,
        {
            Channel: require('./Models/Channel'),
            Guild: require('./Models/Guild'),
        },
        {
            CLIENT_ID: process.env.DISCORD_CLIENT_ID,
            CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
            host: process.env.BDPW_KEY ? 'https://www.yappybots.tk/gitlab' : `http://localhost:${port}`,
        }
    )
);

app.use((err, req, res, next) => {
    // eslint-disable-line no-unused-vars
    if (err) Log.error(err);
    res.status(500);
    res.send(err.stack);
});

app.listen(port, ip, () => {
    Log.info(`Express | Listening on ${ip || 'localhost'}:${port}`);
});

module.exports = app;
