exports.up = knex => {
    return knex.schema
        .createTable('guilds', t => {
            t.string('id').primary();

            t.string('name').nullable();

            t.string('prefix').nullable();
        })

        .createTable('channels', t => {
            t.string('id').primary();

            t.string('name').nullable();
            t.string('guild_id').nullable();

            t.string('repo').nullable();

            t.boolean('use_embed').defaultTo(true);

            t.enum('events_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
            t.json('events_list').defaultTo(['merge_request/update']);

            t.enum('users_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
            t.json('users_list').defaultTo([]);

            t.enum('branches_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
            t.json('branches_list').defaultTo([]);

            t.enum('repos_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
            t.json('repos_list').defaultTo([]);

            t.foreign('guild_id')
                .references('guilds.id')
                .onDelete('cascade');
        });
};

exports.down = knex => {
    return knex.schema.dropTable('channels').dropTable('guilds');
};
