import React from 'react';
import { Table } from 'semantic-ui-react';


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
    console.log(this);
    return (
        <Table compact celled
          style={{marginBottom: 20}}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell> {game.stt} </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> {spread}{game.total_full == null ? null : `, O/U ${game.total_full}`}
              </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q1 </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q2 </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
              <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell> Teams </Table.HeaderCell>
              <Table.HeaderCell> spread </Table.HeaderCell>
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
              <Table.Cell> {game.v[0].tn}  </Table.Cell>
              <Table.Cell> {game.away_spread_full}  </Table.Cell>
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
            <Table.Cell> {game.h[0].tn}  </Table.Cell>
            <Table.Cell> {game.home_spread_full}  </Table.Cell>
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
