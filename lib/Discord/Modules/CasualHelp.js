const Module = require('../Module');
const snekfetch = require('snekfetch');
const Discord = require('discord.js');

class CasualHelpModule extends Module {
  constructor(...args) {
    super(...args);

    this.cooldowns = new Discord.Collection();
  }

  get priority() {
    return 1;
  }

  get help() {
    return {
      general: this.textToEmbed('Yappy, the GitLab Monitor - Information', [
        'Hi! My name is Yappy, the GitLab Monitor.',
        'I am a bot that enables events from a GitLab repo(s) to be sent to a channel.',
        '',
        'You can choose a custom prefix with `GL! conf set prefix <NEW_PREFIX>`',
        'You can invite Yappy to your server at https://bit.ly/DiscordYappyGitlabInvite.',
        "You can join Yappy's official server at https://bit.ly/DiscordYappyServer.",
        '',
        'To learn how to set up Yappy, simply ask "how does Yappy work?".',
        'Keep in mind, however, that those recognitions are powered by an AI, and have a per-channel cooldown of 15 seconds.',
      ]),
      webhook: this.textToEmbed('Yappy, the GitLab Monitor - Set Up', [
        'Follow the following steps to set up Yappy with ANY repo.',
        '',
        '**Discord**',
        '1. Go to the channel you want events in for a repo',
        '2. Say `GL! init REPO`, where `REPO` can be `username/repo`, a gitlab url.. more usage info at `GL! help init`',
        '',
        '**GitLab**',
        '1. Go to the GitLab repo you want to have events for',
        '2. Click Settings > Integrations',
        '3. Set `URL` to https://www.yappybots.tk/gitlab',
        '4. Select the events you want to emit to the channel',
        '5. Click "Add Webhook"',
        '',
        'Now you can test the webhook by, in Settings > Integrations, scrolling down to "Webhooks (#)", finding the webhook pointing to the url mentioned above, and clicking the "Test" butotn on the right.',
        'Keep in mind you will need to have a commit or two in the repo, as it will simulate a push request.',
      ]),
      domain: this.textToEmbed('Yappy Bots domain has expired', [
        'Our domain https://www.yappybots.tk expired recently, and we did not get a notice.',
        'The new domain is https://www.yappybots.tk, which will hopefully be temporary until we are able to get our old one back.',
        'We apologize for the inconvinience.',
      ]),
    };
  }

  run(msg, args, next) {
    if (msg.content.split(' ').length < 3) return next();
    let text = msg.content;

    return this._request(msg, text).then(res => {
      if (!res.body.result)
        return next(res.body.status ? res.body.status.errorDetails : res.body);
      const result = res.body.result;
      const action = result.action;
      const helpMessages = this.help;
      if (action === 'input.unknown') return next();

      // cooldown so less spam
      if (Date.now() - this.cooldowns.get(msg.channel.id) < 15000) {
        return this.moduleError(
          msg,
          `There are ${this.calculateCooldownLeft(
            msg
          )} left until the response will be sent again.`
        );
      }

      if (action === 'help.general')
        msg.channel.send({ embed: helpMessages.general });
      if (action === 'help.webhook')
        msg.channel.send({ embed: helpMessages.webhook });
      if (action === 'help.domain')
        msg.channel.send({ embed: helpMessages.domain });

      this.cooldowns.set(msg.channel.id, Date.now());
    });
  }

  _request(msg, text) {
    const url = `https://api.api.ai/api/query?v=20150910&v=20150910&query=${encodeURI(
      text
    )}&lang=en&sessionId=${msg.id}`;
    return snekfetch
      .get(url)
      .set('Authorization', 'Bearer 79eb39589b364c74b2504b322390139a');
  }

  calculateCooldownLeft(msg) {
    let timeLeft = Date.now() - this.cooldowns.get(msg.channel.id);
    return `${(15 - timeLeft / 1000).toFixed(0)} second(s)`;
  }
}

module.exports = CasualHelpModule;
