import React from 'react';
import { Image, Table } from 'semantic-ui-react';
import logos from '../../modules/logos';


const EmptyBoxScore = props => {
  const game = props.game;

  let spread = '';

  if (game.home_spread_full < game.away_spread_full) {
    spread =`${game.h[0].ta} ${game.home_spread_full}`
  } else if (game.away_spread_full < game.home_spread_full) {
    spread = `${game.v[0].ta} ${game.away_spread_full}`
  } else if (game.home_spread_full == null) {
    spread = 'NO LINE'
  } else {
    spread = `${game.h[0].ta} PK`;
  }


  if (!game) {
    return <div> loading ... </div>
  } else {
    return (
        <Table compact celled
          attached='top'
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell> {game.stt} </Table.HeaderCell>
              <Table.HeaderCell colSpan="2"> GAME </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q1 </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q2 </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
            </Table.Row>
            <Table.Row style={{
              lineHeight: '3px',
              fontSize: '10px',
              padding: 0
            }}>
              <Table.HeaderCell textAlign="right"> <i>Odds -></i> </Table.HeaderCell>
              <Table.HeaderCell colSpan="2"> {spread}{game.total_full == null ? null : `, O/U ${game.total_full}`} </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell> Teams </Table.HeaderCell>
              <Table.HeaderCell> score </Table.HeaderCell>
              <Table.HeaderCell> fg% </Table.HeaderCell>
              <Table.HeaderCell> pts </Table.HeaderCell>
              <Table.HeaderCell> fg% </Table.HeaderCell>
              <Table.HeaderCell> fouls </Table.HeaderCell>
              <Table.HeaderCell> pts </Table.HeaderCell>
              <Table.HeaderCell> fg% </Table.HeaderCell>
              <Table.HeaderCell> fouls </Table.HeaderCell>
              <Table.HeaderCell> pts </Table.HeaderCell>
              <Table.HeaderCell> fg% </Table.HeaderCell>
              <Table.HeaderCell> fouls </Table.HeaderCell>
              <Table.HeaderCell> pts </Table.HeaderCell>
              <Table.HeaderCell> fg% </Table.HeaderCell>
              <Table.HeaderCell> fouls </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell style={{display: 'inline-flex', alignItems: 'center'}}> <Image size="mini" circular src={logos[game.v[0].ta]} /> <b>{game.v[0].tn}</b>  </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
              <Table.Cell> </Table.Cell>
            </Table.Row>
            <Table.Row>
            <Table.Cell style={{display: 'inline-flex', alignItems: 'center'}}> <Image size="mini" circular src={logos[game.h[0].ta]} /> <b>{game.h[0].tn}</b>  </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            <Table.Cell> </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
    )
  }
}

export default EmptyBoxScore;
