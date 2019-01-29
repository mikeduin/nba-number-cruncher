exports.up = function(knex, Promise) {
  return knex.schema.table("team_net_ratings", t => {
    t.float("bs_delta_full");
    t.float("bs_delta_l5");
    t.float("bs_delta_l10");
    t.float("bs_delta_l15");
    t.float("bs_delta_l20");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("team_net_ratings", t => {
    t.dropColumn("bs_delta_full");
    t.dropColumn("bs_delta_l5");
    t.dropColumn("bs_delta_l10");
    t.dropColumn("bs_delta_l15");
    t.dropColumn("bs_delta_l20");
  });
};
