const pg = require('pg')
pg.defaults.ssl = {
   rejectUnauthorized: false,
}

module.exports = {
  development: {
    client: 'pg',
    // connection: process.env.DATABASE_URL
    connection: process.env.DATABASE_URL_TEST
  },
  production: {
    client: 'postgresql',
    // connection: process.env.DATABASE_URL
    connection: process.env.DATABASE_URL_TEST
  }
};
