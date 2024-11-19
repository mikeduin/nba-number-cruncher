exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.float('usg_full'),
    t.float('usg_l5'),
    t.float('usg_l10')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('usg_full'),
    t.dropColumn('usg_l5'),
    t.dropColumn('usg_l10')
  })
};
