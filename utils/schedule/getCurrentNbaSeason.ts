import moment from 'moment-timezone';

export const getCurrentNbaSeason = () => {
  if (moment().isBefore('2024-09-01')) {
    return '2023-24';
  } else if (moment().isBefore(`2025-09-01`)) {
    return '2024-25';
  } else if (moment().isBefore(`2026-10-01`)) {
    return '2025-26';
  } else if (moment().isBefore(`2027-10-01`)) {
    return '2026-27';
  } else if (moment().isBefore(`2028-10-01`)) {
    return '2027-28';
  } else {
    throw new Error('configure getCurrentNbaSeason for current dates');
  }
}

export const getCurrentNbaSeasonInt = () => parseInt(getCurrentNbaSeason().slice(0, 4));