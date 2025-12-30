export enum SportsbookName {
  Bovada = 'Bovada',
  Betsson = 'Betsson',
  FanDuel = 'FanDuel',
  DraftKings = 'DraftKings',
}

// Type guard for runtime checking
export function isSportsbookName(value: any): value is SportsbookName {
  return Object.values(SportsbookName).includes(value);
}