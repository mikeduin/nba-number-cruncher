import React from 'react';
import GameStints from './GameStints';
import BoxScoresByQuarter from './BoxScoresByQuarter';
import StatTrendCharts from './StatTrendCharts';

const PlayerPanes = (player, market, setActivePropMarket, livePropLine, liveStat) => {
  return [
    {
      menuItem: 'Stat Trend Charts',
      render: () => 
        <StatTrendCharts 
          gameData={player.boxScoresByQuarter.slice(0, 10).reverse()}
          market={market}
          setActivePropMarket={setActivePropMarket}
          livePropLine={livePropLine}
          liveStat={liveStat}
          teamId={player.mappedData.team_id}
        />,
    },
    {
      menuItem: 'Rotation Patterns',
      render: () => <GameStints player={player} />,
    },
    {
      menuItem: 'Stats by Quarter',
      render: () => <BoxScoresByQuarter boxScores={player.boxScoresByQuarter} team={player.mappedData.team_abbreviation}/>,
    }
  ]
}

export default PlayerPanes;