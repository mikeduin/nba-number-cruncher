/**
 * Migration: Create app_settings table for global configuration
 * 
 * Stores application-wide settings like FanDuel px-context token
 */

exports.up = function(knex, Promise) {
  return knex.schema.createTable('app_settings', t => {
    t.increments('id').primary();
    t.string('setting_key').unique().notNullable().comment('Setting identifier');
    t.text('setting_value').comment('Setting value');
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.timestamp('created_at').defaultTo(knex.fn.now());
    
    t.index('setting_key');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('app_settings');
};
