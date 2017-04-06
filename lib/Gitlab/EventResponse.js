class EventResponse {
  constructor(bot, gitlab, info) {
    this.gitlab = gitlab;
    this.bot = bot;
    this._info = info;
  }
  get info() {
    return this._info;
  }
}

module.exports = EventResponse;
