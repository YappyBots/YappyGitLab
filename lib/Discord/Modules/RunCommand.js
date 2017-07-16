const Module = require('../Module');

class RunCommandModule extends Module {
  get priority() {
    return 10;
  }

  run(msg, args, next, command) {
    let bot = this.bot;
    let perms = bot.permissions(msg);
    let cmd;

    if (bot.commands.has(command)) {
      cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
      cmd = bot.commands.get(bot.aliases.get(command));
    } else {
      return next();
    }

    if (perms < cmd.conf.permLevel) return cmd.commandError(msg, `Insufficient permissions! Must be **${cmd._permLevelToWord(cmd.conf.permLevel)}** or higher`);
    if (msg.channel.type === 'dm' && cmd.conf.guildOnly) return cmd.commandError(msg, `You can only run **${cmd.help.name}** in a guild.`);

    try {
      let commandRun = cmd.run(msg, args);
      if (commandRun && commandRun.catch) {
        commandRun.catch(e => cmd.commandError(msg, e));
      }
    } catch (e) {
      cmd.commandError(msg, e);
    }
  }
}

module.exports = RunCommandModule;
