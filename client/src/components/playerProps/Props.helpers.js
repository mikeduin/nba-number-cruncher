export const colorFga = (pct) => {
  if (pct < 42) {
    return '#db2828';
  } else if (pct > 48) {
    return 'green';
  } else {
    return 'black'; // Default color if the value is between 0.42 and 0.48
  }
}

export const colorFta = (pct) => {
  if (pct < 70) {
    return '#db2828';
  } else if (pct > 79) {
    return 'green';
  } else {
    return 'black'; // Default color if the value is between 0.42 and 0.48
  }
}

export const styleFouls = (pf) => {
  if (pf === 3) {
    return {
      backgroundColor: '#FE8D01',
      fontWeight: 500,
      fontSize: 18
    } 
  } else if (pf === 4) {
    return {
      backgroundColor: '#E3242B',
      fontWeight: 800,
      fontSize: 18
    } 
  } else if (pf === 5) {
    return {
      backgroundColor: '#B90E0A',
      fontWeight: 800,
      fontSize: 18
    } 
  } else if (pf === 6) {
    return {
      backgroundColor: '#420C09',
      fontWeight: 800,
      fontSize: 18
    } 
  } else {
    return {color: 'black'}
  }
}

export const formatJuice = (value) => {
  if (parseInt(value) > 1) {
    return `+${value}`;
  } else {
    return value;
  }
}

export const getShotPct = (fgm, fga) => fga > 0 ? ((fgm / fga) * 100).toFixed(0) : '0.0';