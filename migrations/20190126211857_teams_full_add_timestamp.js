
exports.up = function(knex, Promise) {
  return knex.schema.table('teams_full', function(t){
    t.timestamp('updated_at');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('teams_full', function(t){
    t.dropColumn('updated_at');
  })
};
