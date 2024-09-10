const checkPeriodStart = (secs) => {
  if (secs < 2880) {
    return (Math.floor(secs/720));
  } else {
    return (4 + Math.floor((secs-2880) / 300));
  };
}

export default checkPeriodStart;