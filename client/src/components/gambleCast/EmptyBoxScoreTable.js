import React from 'react';
import { Table } from 'semantic-ui-react';


const EmptyBoxScore = props => {
  let game = props.game;

  if (!game) {
    return <div> loading ... </div>
  } else {
    return (
      <div>
        <Table compact celled
          style={{marginBottom: 20}}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell> {game.stt} </Table.HeaderCell>
              <Table.HeaderCell colSpan="3">  </Table.HeaderCell>
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
            <Table.Row>
              <Table.Cell colSpan="4"> </Table.Cell>
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
              <Table.Cell colSpan="1"> </Table.Cell>
              <Table.Cell colSpan="3">   </Table.Cell>
              <Table.Cell colSpan="3">  </Table.Cell>
              <Table.Cell colSpan="3">   </Table.Cell>
              <Table.Cell colSpan="3">  </Table.Cell>
              <Table.Cell colSpan="3">  </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default EmptyBoxScore;
