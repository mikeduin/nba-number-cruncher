const moment = require('moment-timezone');
const teamLookup = require('../../modules/teamLookup');

module.exports = game => {
  try {
    const { etm, gid } = game;
    const hTid = game.h[0].tid;
    const vTid = game.v[0].tid;
  
    const hBovString = teamLookup.findById(hTid).bovada;
    const vBovString = teamLookup.findById(vTid).bovada;
  
    const utcDateTime = moment.utc(etm, 'YYYY-MM-DD HH:mm:ss.SSS Z');
    const easternDateTime = utcDateTime.tz('America/New_York');
  
    let modifiedDateTime
  
    if (gid === 22300281 || gid === 22300282 || gid === 22300283 || gid === 22300286 || gid === 22300285 || gid === 22300284) {
      modifiedDateTime = easternDateTime.add(10, 'minutes');
    } else {
      modifiedDateTime = easternDateTime;
    }
  
    // // Add 10 minutes to the Eastern Time
    // // const modifiedDateTime = easternDateTime.add(10, 'minutes');
    // const 
  
    // Format the resulting date as a string in the specified format
    const formattedDateTime = modifiedDateTime.format('YYYYMMDDHHmm');
  
  
    return `https://www.bovada.lv/sports/basketball/nba/${vBovString}-${hBovString}-${formattedDateTime}`;

  } catch (e) {
    console.log('error updating bovada url for ', game.gid, ' is ', e);
  }

} 