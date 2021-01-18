module.exports = {
  development: {
    client: 'postgresql',
    // connection: process.env.DATABASE_URL
    connection: process.env.DATABASE_URL_TEST
  },
  production: {
    client: 'postgresql',
    // connection: process.env.DATABASE_URL
    connection: process.env.DATABASE_URL_TEST
  }
};
