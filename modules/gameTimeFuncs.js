

module.exports = {
  gameSecsToClockAndQuarter: (secs) => {
    if (secs < 2881) {
      if (secs % 720 === 0) {
        if (secs === 0) {
          return (`Q1 12:00`);
        }
        let q = Math.floor(secs/720);
        let min = (
          Math.floor(
            (secs - (720*(q-1)))/60
          )
        );
        let remSecs = (secs - ((q-1)*720) - (min*60));

        return (`Q${q} 0:00`);
      } else {
        let q = Math.floor(secs/720) + 1;
        let min = (
          Math.floor(
            (secs - (720*(q-1)))/60
          )
        );
        let remSecs = (secs - ((q-1)*720) - (min*60));

        return (`Q${q} ${11-min}:${60-remSecs}`);
      }
    }
  }
}
