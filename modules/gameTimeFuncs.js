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

        return (`Q${q} 0:00`);
      } else {
        let q = Math.floor(secs/720) + 1;
        let min = (
          Math.floor(
            (secs - (720*(q-1)))/60
          )
        );
        let remSecs = (secs - ((q-1)*720) - (min*60));

        if (remSecs === 0) {
          return (`Q${q} ${12-min}:00`);
        } else {
          return (`Q${q} ${11-min}:${60-remSecs}`);
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
        let remSecs = ((secs-2880) - ((q-1)*300) - (min*60));

        if (remSecs === 0) {
          return (`OT${q} ${5-min}:00`);
        } else {
          return (`OT${q} ${4-min}:${60-remSecs}`);
        }
      }
    }
  }
}
