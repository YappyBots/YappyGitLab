const mongoose = require('mongoose');

mongoose.connect(process.env.YAPPY_GITLAB_MONGODB || 'localhost', (err) => {
  if (err) return Log.error(`MongoDB | `, err);
  Log.info('MongoDB | Connected to database');
});

module.exports = {
  ChannelConfig: require('./ChannelConfig'),
  ServerConfig: require('./ServerConfig'),
};
