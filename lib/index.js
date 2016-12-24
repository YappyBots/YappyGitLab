const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

global.Log = require('./Util/Log');

require('./Web');
require('./Models');
require('./Util');
require('./Util/YappyGithub');
require('./Discord');
require('./Gitlab');

process.on('unhandledRejection', Log.error);
process.on('uncaughtException', Log.error);
