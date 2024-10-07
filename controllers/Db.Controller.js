import knex from '../db/knex.js';

export const BoxScores = () => knex('box_scores_v2');
export const Players = () => knex('player_data');
export const PlayerProps = () => knex('player_props');
export const Schedule = () => knex('schedule');
export const Teams = () => knex('teams');
