// const pg = require('pg')
// pg.defaults.ssl = {
//    rejectUnauthorized: false,
// }

require('dotenv').config();
const parse = require("pg-connection-string").parse;

// const pgconfig = parse(process.env.MAIN_DB_URI);
const pgconfig = parse(process.env.DATABASE_URL_TEST_NEW);
// const pgconfig = parse(process.env.TEST_MAIN_DB_2);

// Add SSL setting to default environment variable
pgconfig.ssl = { rejectUnauthorized: false };

module.exports = {
  development: {
    client: 'pg',
    // connection: process.env.DATABASE_URL
    connection: pgconfig
  },
  production: {
    client: 'postgresql',
    // connection: process.env.DATABASE_URL
    connection: process.env.DATABASE_URL_TEST_NEW
  }
};
