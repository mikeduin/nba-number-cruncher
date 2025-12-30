exports.up = function(knex) {
  return knex.schema.table('schedule', function(t) {
    t.text('draftkings_url').comment('Stored DraftKings URL for this game');
  });
};

exports.down = function(knex) {
  return knex.schema.table('schedule', function(t) {
    t.dropColumn('draftkings_url');
  });
};
