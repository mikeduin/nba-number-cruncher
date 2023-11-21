const knex = require("../db/knex");

module.exports = {
  Schedule: () => knex('schedule'),
  Players: () => knex('player_data'),
  PlayerProps: () => knex('player_props'),
}
