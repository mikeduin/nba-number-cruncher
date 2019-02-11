export const netRatingScale = value => {
  if (value < -17.49) {
    return 'rgb(255,0,0)';
  } else if (value > -17.5 && value < -9.99) {
    return 'rgb(255,51,51)';
  } else if (value > -10 && value < -5.99) {
    return 'rgb(255,102,102)';
  } else if (value > -6 && value < -2.99) {
    return 'rgb(255,153,153)';
  } else if (value > -3 && value < 0) {
    return 'rgb(255,204,204)';
  } else if (value > 0 && value < 3) {
    return 'rgb(211,232,211)';
  } else if (value > 2.99 && value < 6) {
    return 'rgb(167,209,167)';
  } else if (value > 5.99 && value < 10) {
    return 'rgb(122,185,122)';
  } else if (value > 9.99 && value < 17.5) {
    return 'rgb(78,162,78)';
  } else if (value > 17.49) {
    return 'rgb(34,139,34)';
  }
}

export const paceScale = value => {
  if (value < 92) {
    return 'rgb(255,0,0)';
  } else if (value > 91.9 && value < 94) {
    return 'rgb(255,51,51)';
  } else if (value > 93.9 && value < 96) {
    return 'rgb(255,102,102)';
  } else if (value > 95.9 && value < 98) {
    return 'rgb(255,153,153)';
  } else if (value > 97.9 && value < 100) {
    return 'rgb(255,204,204)';
  } else if (value > 100 && value < 102) {
    return 'rgb(211,232,211)';
  } else if (value > 101.99 && value < 104) {
    return 'rgb(167,209,167)';
  } else if (value > 103.99 && value < 106) {
    return 'rgb(122,185,122)';
  } else if (value > 105.99 && value < 108) {
    return 'rgb(78,162,78)';
  } else if (value > 107.99) {
    return 'rgb(34,139,34)';
  }
}
