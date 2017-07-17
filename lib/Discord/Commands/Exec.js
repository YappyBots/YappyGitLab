const { exec } = require('child_process');
const Command = require('../Command');
const Log = require('../../Util/Log');

class ExecCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'exec',
      description: 'Execute a command in bash',
      usage: 'exec <command>',
    };
    this.setConf({
      permLevel: 2,
    });
  }
  run(msg, args) {
    let command = args.join(' ');

    let runningMessage = [
      '`RUNNING`',
      '```xl',
      this._clean(command),
      '```',
    ];

    let messageToEdit;

    msg.channel.send(runningMessage).then(message => {
      messageToEdit = message;
    }).then(() => this._exec(command))
    .then(stdout => {
      stdout = stdout.substring(0, 1500);

      let message = [
        '`STDOUT`',
        '```sh',
        this._clean(stdout) || ' ',
        '```',
      ].join('\n');

      messageToEdit.edit(message);
    })
    .catch(data => {
      let { stdout, stderr } = data;
      if (stderr && stderr.stack) {
        Log.error(stderr);
      }

      stderr = stderr ? stderr.substring(0, 800) : ' ';
      stdout = stdout ? stdout.substring(0, stderr ? stderr.length : 2046 - 40) : ' ';

      let message = [
        '`STDOUT`',
        '```sh',
        this._clean(stdout) || '',
        '```',
        '`STDERR`',
        '```sh',
        this._clean(stderr) || '',
        '```',
      ].join('\n').substring(0, 2000);

      messageToEdit.edit(message);
    });
  }
  _exec(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) return reject({ stdout, stderr });
        resolve(stdout);
      });
    });
  }
  _clean(text) {
    if (typeof text === 'string') {
      return text.replace('``', `\`${String.fromCharCode(8203)}\``);
    } else {
      return text;
    }
  }
}

module.exports = ExecCommand;
