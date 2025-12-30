/**
 * Migration: Add DraftKings event ID to schedule table
 * 
 * Adds draftkings_event_id column to track DraftKings' event IDs for each game
 * This allows us to fetch DraftKings props using their API
 */

exports.up = function(knex, Promise) {
  return knex.schema
    .table('schedule', t => {
      t.string('draftkings_event_id').comment('DraftKings event ID for fetching props');
      t.index('draftkings_event_id');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('schedule', t => {
      t.dropColumn('draftkings_event_id');
    });
};
