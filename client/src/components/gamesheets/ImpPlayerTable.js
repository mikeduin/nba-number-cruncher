import React from 'react';
import _ from 'lodash';
import { gameSecsToClockAndQuarter } from '../../modules/gameTimeFuncs';
import { Table } from 'semantic-ui-react';

const ImpPlayerTable = props => {
  console.log('props are ', props);

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell> Player </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {_.map(props.players, ({ name }) => (
          <Table.Row>
            <Table.Cell> {name} </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default ImpPlayerTable;
