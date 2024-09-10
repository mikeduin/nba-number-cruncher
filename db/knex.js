// const environment = process.env.NODE_ENV || 'development';
// const config = require('../knexfile.js')[environment];
// module.exports = require('knex')(config);

import knex from 'knex';
import { config as dotenvConfig } from 'dotenv';
import knexfile from '../knexfile.js';

dotenvConfig();

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

export default knex(config);