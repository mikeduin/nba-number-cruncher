// const pg = require('pg')
// pg.defaults.ssl = {
//    rejectUnauthorized: false,
// }

// require('dotenv').config();
// const parse = require("pg-connection-string").parse;

// // const pgconfig = parse(process.env.MAIN_DB_URI);
// const pgconfig = parse(process.env.DATABASE_URL_TEST_NEW);
// // const pgconfig = parse(process.env.TEST_MAIN_DB_2);

// // Add SSL setting to default environment variable
// pgconfig.ssl = { rejectUnauthorized: false };

// module.exports = {
//   development: {
//     client: 'pg',
//     // connection: process.env.DATABASE_URL
//     connection: pgconfig
//   },
//   production: {
//     client: 'postgresql',
//     connection: process.env.DATABASE_URL
//     // connection: process.env.DATABASE_URL_TEST_NEW
//   }
// };

import { config as dotenvConfig } from 'dotenv';
import pg from 'pg';

dotenvConfig();

pg.defaults.ssl = {
   rejectUnauthorized: false,
}

// const parse = require("pg-connection-string").parse;
// const pgconfig = parse(process.env.TEST_DB_URL);

// console.log(process.env);

const knexfile = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    // connection: process.env.DATABASE_URL_TEST_NEW,
    acquireConnectionTimeout: 1000000,
    // connection: pgconfig,
    ssl: {
      rejectUnauthorized: false,  
    },
    ssl: 'no-verify' // try this if above does not work for you
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    // connection: process.env.DATABASE_URL_TEST_NEW,
    acquireConnectionTimeout: 1000000,
  }
};

export default knexfile;