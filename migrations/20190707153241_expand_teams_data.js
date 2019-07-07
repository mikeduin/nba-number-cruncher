exports.up = function(knex, Promise) {
  return knex.schema.table('teams', (t) => {
    t.boolean('isNBAFranchise');
    t.boolean('isAllStar');
    t.string('confName');
    t.string('divName');
    t.string('fullName');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('teams', (t) => {
    t.dropColumn('isNBAFranchise');
    t.dropColumn('isAllStar');
    t.dropColumn('confName');
    t.dropColumn('divName');
    t.dropColumn('fullName');
  })
};
