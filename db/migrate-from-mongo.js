const mongoose = require('mongoose');
const { default: PQueue } = require('p-queue');
const ProgressBar = require('progress');
const Guild = require('../lib/Models/Guild');
const Channel = require('../lib/Models/Channel');

require('dotenv').config();

const uniqueElementsBy = (arr, fn) =>
    arr.reduce((acc, v) => {
        if (!acc.some(x => fn(v, x))) acc.push(v);
        return acc;
    }, []);
const uniqueBy = prop => (a, b) => a[prop] == b[prop];
const progressBarFormat = '[:bar] :rate/s :percent :elapseds (estimated :etas)';

const channelConfig = mongoose.model('ChannelConfig', {
    guildName: String,
    guildID: String,
    channelName: String,
    channelID: String,
    repos: Array,
    repo: String,
    embed: Boolean,
    disabledEvents: {
        type: Array,
        default: ['merge_request/update', 'job'],
    },
    ignoredUsers: Array,
    ignoredBranches: Array,
});

const serverConfig = mongoose.model('ServerConfig', {
    guildName: String,
    guildID: String,
    prefix: String,
});

process.on('unhandledRejection', console.error);

(async () => {
    console.log('DB |> Connecting');

    await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
    });

    console.log('DB |> Connected');

    // === GUILDS ===

    console.log('DB |> Guilds |> Retrieving');

    const guilds = await Guild.fetchAll();
    const allGuilds = await serverConfig.find({});

    console.log('DB |> Guilds |> Filtering');

    const guildsToMigrate = uniqueElementsBy(
        allGuilds.filter(g => g && g.guildID && !guilds.get(g.guildID)),
        uniqueBy('guildID')
    );

    console.log(`DB |> Guilds |> Migrating (${guildsToMigrate.length})`);

    let progress;

    if (guildsToMigrate.length) {
        progress = new ProgressBar(`DB |> Guilds |> Migrating ${progressBarFormat}`, { total: guildsToMigrate.length, width: 20 });
    }

    for (const guild of guildsToMigrate) {
        await Guild.forge({
            id: guild.guildID,
            name: guild.guildName,
            prefix: guild.prefix,
        }).save(null, {
            method: 'insert',
        });

        progress.tick();
    }

    // === CHANNELS ===

    console.log('DB |> Channels |> Retrieving');

    const channels = await Channel.fetchAll();
    const allChannels = await channelConfig.find({});
    const channelsAdded = [];

    console.log('DB |> Channels |> Filtering');

    const channelsToMigrate = allChannels.filter(ch => ch && ch.channelID && !channels.get(ch.channelID) && ch.guildID);

    console.log(`DB |> Channels |> Migrating (${channelsToMigrate.length})`);

    if (channelsToMigrate.length) {
        progress = new ProgressBar(`DB |> Channels |> Migrating ${progressBarFormat}`, { total: channelsToMigrate.length, width: 20 });
    }

    for (const ch of channelsToMigrate) {
        if (channelsAdded.includes(ch.channelID)) continue;

        const channel = await Channel.forge({
            id: ch.channelID,
            name: ch.channelName,
            guild_id: ch.guildID,
            repo: ch.repo,
            use_embed: !!ch.embed,
            events_list: JSON.stringify(ch.disabledEvents || []) || [],
            users_list: JSON.stringify(ch.ignoredUsers || []) || [],
            branches_list: JSON.stringify(ch.ignoredBranches || []) || [],
        }).save(null, {
            method: 'insert',
        });

        if (Array.isArray(ch.repos))
            await Promise.all(
                ch.repos.map(repo =>
                    channel.related('repos').create({
                        name: repo,
                    })
                )
            );

        channelsAdded.push(ch.channelID);
        progress.tick();
    }

    console.log();
    console.log(`DB |> Channels |> Migrated (${channelsAdded.length})`);

    if (channelsToMigrate.length) process.stdout.write('\n');

    process.exit(0);
})().then(() => process.exit());
