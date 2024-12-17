import React from 'react';
import { Accordion } from 'semantic-ui-react';
import PlayerProps from './PlayerProps';

export const BoxScoreAccordion = ({ game, playersMetadata, boxScore }) => {
  const homeTeamName = game.h[0].tn;
  const awayTeamName = game.v[0].tn;

  const rootPanels = [
    { key: 'player-props',
    title: `${awayTeamName} @ ${homeTeamName} PROPS`,
    content: { content: <PlayerProps 
      key={`props-${game.gid}`}
      game={game}
      playersMetadata={playersMetadata}
      boxScore={boxScore}
    /> } 
    },
  ]

  return (
    <Accordion 
      panels={rootPanels} 
      styled 
      fluid
      attached='bottom'
      style={{marginBottom: 20}}
    />
  )  
}
