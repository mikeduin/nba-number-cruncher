exports.up = function(knex, Promise) {
  return knex.schema.alterTable('players_l5', (t) => {
    t.float('fgm_new'); // create new column of type float
    t.float('fga_new'); // create new column of type float
  })
  .then(() => {
    return knex.raw(`UPDATE players_l5 SET fgm_new = CAST(fgm AS FLOAT), fga_new = CAST(fga AS FLOAT);`); // copy data from old columns to new
  })
  .then(() => {
    return knex.schema.alterTable('players_l5', (t) => {
      t.dropColumn('fgm'); // drop old column
      t.dropColumn('fga'); // drop old column
    });
  })
  .then(() => {
    return knex.schema.alterTable('players_l5', (t) => {
      t.renameColumn('fgm_new', 'fgm'); // rename new column to old column name
      t.renameColumn('fga_new', 'fga'); // rename new column to old column name
    });
  })
  .then(() => {
    return knex.schema.alterTable('players_l5', (t) => {
      t.dropColumn('fgm_pg');
      t.dropColumn('fga_pg');
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('players_l5', (t) => {
    t.integer('fgm_new');
    t.integer('fga_new');
  })
  .then(() => {
    return knex.raw(`UPDATE players_l5 SET fgm_new = CAST(fgm AS INTEGER), fga_new = CAST(fga AS INTEGER);`);
  })
  .then(() => {
    return knex.schema.alterTable('players_l5', (t) => {
      t.dropColumn('fgm');
      t.dropColumn('fga');
    });
  })
  .then(() => {
    return knex.schema.alterTable('players_l5', (t) => {
      t.renameColumn('fgm_new', 'fgm');
      t.renameColumn('fga_new', 'fga');
    });
  })
  .then(() => {
    return knex.schema.alterTable('players_l5', (t) => {
      t.float("fgm_pg");
      t.float("fga_pg");
    });
  });
};