const Command = require('../Command');

class PingCommand extends Command {
    constructor(bot) {
        super(bot);
        this.props.help = {
            name: 'ping',
            description: 'ping, pong',
            usage: 'ping',
        };
    }
    run(msg) {
        const startTime = msg.createdTimestamp;
        return msg.channel.send(`⏱ Pinging...`).then(message => {
            const endTime = message.createdTimestamp;
            let difference = (endTime - startTime).toFixed(0);
            if (difference > 1000) difference = (difference / 1000).toFixed(0);
            let differenceText = endTime - startTime > 999 ? 's' : 'ms';
            return message.edit(
                `⏱ Ping, Pong! The message round-trip took ${difference} ${differenceText}. The heartbeat ping is ${this.bot.ws.ping.toFixed(0)}ms`
            );
        });
    }
}

module.exports = PingCommand;
