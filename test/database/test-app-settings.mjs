import knex from '../../db/knex.js';

console.log('Testing app_settings table...\n');

try {
  // Test insert
  console.log('1. Testing insert...');
  await knex('app_settings').insert({
    setting_key: 'fanduel_px_context',
    setting_value: 'test_token_12345',
    created_at: new Date(),
    updated_at: new Date()
  });
  console.log('✅ Insert successful\n');
  
  // Test select
  console.log('2. Testing select...');
  const result = await knex('app_settings')
    .where({ setting_key: 'fanduel_px_context' })
    .first();
  console.log('✅ Select successful:', result);
  console.log('');
  
  // Test update with onConflict
  console.log('3. Testing update with onConflict...');
  await knex('app_settings')
    .insert({
      setting_key: 'fanduel_px_context',
      setting_value: 'updated_token_67890',
      created_at: new Date(),
      updated_at: new Date()
    })
    .onConflict('setting_key')
    .merge(['setting_value', 'updated_at']);
  console.log('✅ Update successful\n');
  
  // Test select again
  const result2 = await knex('app_settings')
    .where({ setting_key: 'fanduel_px_context' })
    .first();
  console.log('Updated value:', result2.setting_value);
  
  console.log('\n✅ All tests passed!');
  process.exit(0);
} catch (e) {
  console.error('\n❌ Error:', e.message);
  console.error('Stack:', e.stack);
  process.exit(1);
}
