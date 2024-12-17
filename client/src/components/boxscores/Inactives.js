import React from 'react';
import { Label, LabelDetail, List, ListItem } from 'semantic-ui-react';

const renderPlayerLabels = (players, logo) => {
  // console.log('players in labels are ', players);
  if (players?.length) {
    return players.map(player => 
      <ListItem key={player.familyName}>
        <Label as='a' basic image>
          <img src={logo} />
          {`${player.firstName.slice(0, 1)}. ${player.familyName}` }
          <LabelDetail>{player.position}</LabelDetail>
          <LabelDetail>{Math.round(player.min)}</LabelDetail>
        </Label>
      </ListItem>
    )
  } else {
    return [];
  }
}

export const Inactives = ({ players, logo }) => {
  return <List horizontal>
    {renderPlayerLabels(players, logo)}
  </List>
}