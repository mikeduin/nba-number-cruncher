import knex from './db/knex.js';

const gid = process.argv[2] || '0022400648';

const saved = await knex('player_props')
  .where({ gid, sportsbook: 'FanDuel' })
  .select('player_name', 'pts', 'pts_over', 'pts_under', 'reb', 'reb_over', 'reb_under', 
          'ast', 'ast_over', 'ast_under', 'blk', 'blk_over', 'blk_under', 
          'stl', 'stl_over', 'stl_under', 'fg3m', 'fg3m_over', 'fg3m_under',
          'pts+reb', 'pts+reb_over', 'pts+reb_under',
          'pts+ast', 'pts+ast_over', 'pts+ast_under',
          'pts+reb+ast', 'pts+reb+ast_over', 'pts+reb+ast_under',
          'reb+ast', 'reb+ast_over', 'reb+ast_under')
  .orderBy('player_name');

console.log(`\n✅ Found ${saved.length} FanDuel prop entries for game ${gid}\n`);

saved.forEach(p => {
  console.log(`${p.player_name}:`);
  if (p.pts) console.log(`  Points: ${p.pts} (O:${p.pts_over} U:${p.pts_under})`);
  if (p.reb) console.log(`  Rebounds: ${p.reb} (O:${p.reb_over} U:${p.reb_under})`);
  if (p.ast) console.log(`  Assists: ${p.ast} (O:${p.ast_over} U:${p.ast_under})`);
  if (p.blk) console.log(`  Blocks: ${p.blk} (O:${p.blk_over} U:${p.blk_under})`);
  if (p.stl) console.log(`  Steals: ${p.stl} (O:${p.stl_over} U:${p.stl_under})`);
  if (p.fg3m) console.log(`  Made 3s: ${p.fg3m} (O:${p.fg3m_over} U:${p.fg3m_under})`);
  if (p['pts+reb']) console.log(`  Pts+Reb: ${p['pts+reb']} (O:${p['pts+reb_over']} U:${p['pts+reb_under']})`);
  if (p['pts+ast']) console.log(`  Pts+Ast: ${p['pts+ast']} (O:${p['pts+ast_over']} U:${p['pts+ast_under']})`);
  if (p['pts+reb+ast']) console.log(`  Pts+Reb+Ast: ${p['pts+reb+ast']} (O:${p['pts+reb+ast_over']} U:${p['pts+reb+ast_under']})`);
  if (p['reb+ast']) console.log(`  Reb+Ast: ${p['reb+ast']} (O:${p['reb+ast_over']} U:${p['reb+ast_under']})`);
  console.log('');
});

await knex.destroy();
