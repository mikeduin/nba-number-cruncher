module.exports = {
  development: {
    client: 'postgresql',
    // connection: 'postgres://mikeduin620:kennysmith30@nbanumbercruncher.chdu4cpdyavi.us-east-1.rds.amazonaws.com:5432/nba_number_cruncher'
    connection: process.env.DATABASE_URL
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL
  }
};
