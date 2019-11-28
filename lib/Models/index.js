const knex = require('knex')(require('../../knexfile'));

const bookshelf = require('bookshelf')(knex);

bookshelf.plugin([__dirname + '/plugin.js']);

module.exports = bookshelf;