const startPeriodSec = (per) => {
  if (per < 4) {
    return (per*720);
  } else {
    return (2880 + ((per-4)*300));
  };
};

export default startPeriodSec;
