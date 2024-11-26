// OLD CODE
// const pg = require('pg')
// require('dotenv').config();
// END OLD CODE

// NEW CODE
import { config as dotenvConfig } from 'dotenv';
import pg from 'pg';
dotenvConfig();
// END NEW CODE

pg.defaults.ssl = {
   rejectUnauthorized: false,
}

const knexfile = {
  development: {
    client: 'pg',
    // connection: process.env.DATABASE_URL,
    connection: process.env.DATABASE_URL_TEST_NEW,
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

// NEW CODE
export default knexfile;
// END NEW CODE

// OLD CODE
// module.exports = knexfile;
// END OLD CODE