const mongoose = require('mongoose');

mongoose.connect(process.env.YAPPY_GITLAB_MONGODB || 'localhost', {
  useMongoClient: true,
  autoReconnect: true,
  keepAlive: 1,
  connectTimeoutMS: 30000,
})
.then(() => {
  Log.info(`MongoDB | Connected to DB`);
})
.catch((err) => {
  Log.error(`MongoDB |`, err);
  process.exit(err.code || 1);
});

module.exports = {
  ChannelConfig: require('./ChannelConfig'),
  ServerConfig: require('./ServerConfig'),
};
