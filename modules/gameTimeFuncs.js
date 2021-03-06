module.exports = {
  gameSecsToClockAndQuarter: (secs) => {
    if (secs < 2881) {
      let q = Math.floor(secs/720) + 1;

      let min = (
        Math.floor(
          (secs - (720*(q-1)))/60
        )
      );

      if (secs % 720 === 0) {
        return (`Q${q} 12:00`);
      } else {
        let remSecs = (60 - (secs - ((q-1)*720) - (min*60))).toFixed(0);

        if (remSecs < 10) {
          remSecs = `0${remSecs}`;
        }

        if (remSecs === 0 || remSecs == 60) {
          return (`Q${q} ${12-min}:00`);
        } else {
          return (`Q${q} ${11-min}:${remSecs}`);
        }
      }
    } else {
      if ((secs-2880) % 300 === 0) {

        let q = Math.floor((secs-2880)/300);
        let min = (
          Math.floor(
            ((secs-2880) - (300*(q-1)))/60
          )
        );

        return (`OT${q} 0:00`);
      } else {
        let q = Math.floor((secs-2880)/300) + 1;
        let min = (
          Math.floor(
            ((secs-2880) - (300*(q-1)))/60
          )
        );
        let remSecs = (60 - ((secs-2880) - ((q-1)*300) - (min*60))).toFixed(0);

        if (remSecs < 10) {
          remSecs = `0${remSecs}`;
        }

        if (remSecs === 0) {
          return (`OT${q} ${5-min}:00`);
        } else {
          return (`OT${q} ${4-min}:${remSecs}`);
        }
      }
    }
  }
}
