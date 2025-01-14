import React from 'react';
import { connect } from 'react-redux';
import { Accordion } from 'semantic-ui-react';
import PlayerProps from './PlayerProps';
import { BoxScoreNotes } from './BoxScoreNotes';

const BoxScoreAccordion = ({ game, playersMetadata, boxScore, teamNotes }) => {
  const { ta: hAbb, tn: hTeamName } = game.h[0];
  const { ta: vAbb, tn: vTeamName } = game.v[0];

  const rootPanels = [
    { 
      key: 'notes',
      title: `${vTeamName} @ ${hTeamName} NOTES`,
      content: { content: <BoxScoreNotes 
        gid={game.gid}
        hAbb={hAbb}
        vAbb={vAbb}
        teamNotes={{
          [hAbb]: teamNotes?.find((team) => team.abb === hAbb) ?? '',
          [vAbb]: teamNotes?.find((team) => team.abb === vAbb) ?? '',
        }}
        /> 
      }
    },
    { 
      key: 'player-props',
      title: `${vTeamName} @ ${hTeamName} PROPS`,
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

const mapStateToProps = state => {
  return {
    teamNotes: state.teamNotes
  }
}

export default connect (mapStateToProps) (BoxScoreAccordion);
