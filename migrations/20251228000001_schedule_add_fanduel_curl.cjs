exports.up = function(knex) {
  return knex.schema.table('schedule', function(t) {
    t.text('fanduel_curl').comment('Stored FanDuel cURL command for this game');
  });
};

exports.down = function(knex) {
  return knex.schema.table('schedule', function(t) {
    t.dropColumn('fanduel_curl');
  });
};
