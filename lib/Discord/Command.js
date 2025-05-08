const DefaultCommand = require('@YappyBots/addons').discord.structures.Command;
const { EmbedBuilder } = require('discord.js');

/**
 * Discord bot command
 */
class Command extends DefaultCommand {
    constructor(...args) {
        super(...args);

        this._path = Log._path;
        this.embed = EmbedBuilder;
    }

    errorUsage(msg) {
        return this.commandError(
            msg,
            `Correct usage: \`@Yappy ${this.help.usage}\`\nRun \`@Yappy help ${this.help.name}\` for help and examples`,
            'Incorrect Usage'
        );
    }
}

module.exports = Command;
