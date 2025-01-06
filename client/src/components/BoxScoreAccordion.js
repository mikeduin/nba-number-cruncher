import React from 'react';
import { Accordion } from 'semantic-ui-react';
import PlayerProps from './PlayerProps';
import { BoxScoreNotes } from './BoxScoreNotes';

export const BoxScoreAccordion = ({ game, playersMetadata, boxScore }) => {
  const homeTeamName = game.h[0].tn;
  const awayTeamName = game.v[0].tn;

  const rootPanels = [
    { 
      key: 'notes',
      title: `${awayTeamName} @ ${homeTeamName} NOTES`,
      content: { content: <BoxScoreNotes 
        gid={game.gid}
        hAbb={game.h[0].ta}
        vAbb={game.v[0].ta}
        hNotes={game.h[0].notes}
        vNotes={game.v[0].notes}
        /> 
      }
    },
    { 
      key: 'player-props',
      title: `${awayTeamName} @ ${homeTeamName} PROPS`,
      content: { content: <PlayerProps 
        game={game}
        playersMetadata={playersMetadata}
        boxScore={boxScore}
        />
      } 
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
