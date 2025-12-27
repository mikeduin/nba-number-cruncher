/**
 * Migration: Add FanDuel event ID to schedule table
 * 
 * Adds fanduel_event_id column to track FanDuel's event IDs for each game
 * This allows us to fetch FanDuel props using their API
 */

exports.up = function(knex, Promise) {
  return knex.schema
    .table('schedule', t => {
      t.string('fanduel_event_id').comment('FanDuel event ID for fetching props');
      t.index('fanduel_event_id');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('schedule', t => {
      t.dropColumn('fanduel_event_id');
    });
};
