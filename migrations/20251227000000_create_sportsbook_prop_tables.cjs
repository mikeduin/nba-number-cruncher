/**
 * Migration: Add sportsbook tracking to player_props
 * 
 * Strategy:
 * - Keep existing wide-format structure (it works great!)
 * - Add 'sportsbook' column to track source (Betsson, FanDuel, etc.)
 * - Both sportsbooks use same table/structure
 * - Frontend stays exactly the same
 */

exports.up = function(knex, Promise) {
  return knex.schema
    .table('player_props', t => {
      t.string('sportsbook').defaultTo('Betsson').comment('Betsson, FanDuel, etc.');
      t.index('sportsbook');
      t.index(['gid', 'sportsbook'], 'idx_game_sportsbook');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('player_props', t => {
      t.dropColumn('sportsbook');
    });
};
