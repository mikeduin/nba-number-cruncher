import React from 'react';
import GameStints from './GameStints';
import BoxScoresByQuarter from './BoxScoresByQuarter';
import StatTrendCharts from './StatTrendCharts';

const PlayerPanes = (player) => {
  return [
    {
      menuItem: 'Rotation Patterns',
      render: () => <GameStints player={player} />,
    },
    // {
    //   menuItem: 'Stat Trend Charts',
    //   render: () => <StatTrendCharts player={player} />,
    // },
    {
      menuItem: 'Stats by Quarter',
      render: () => <BoxScoresByQuarter boxScores={player.boxScoresByQuarter} team={player.mappedData.team_abbreviation}/>,
    }
  ]
}

export default PlayerPanes;