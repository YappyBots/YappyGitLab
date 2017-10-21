const Command = require('../Command');

class RebootCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: 'reboot',
      description: 'reboot bot',
      usage: 'ping',
    };
    this.setConf({
      permLevel: 2,
    });
  }
  run(msg) {
    return msg.channel.send({
      embed: {
        color: 0x2ECC71,
        title: 'Updating',
        description: 'Restarting...',
      },
    })
    .then(() => {
      Log.info('RESTARTING - Executed `reboot` command');
      process.exit();
    });
  }
}

module.exports = RebootCommand;
