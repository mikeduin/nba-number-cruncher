import React from 'react';
import { Button, Table } from 'semantic-ui-react';

export const BoxScoreHeader = ({ setInactivesFilter, inactivesFilter }) => <Table.Row>
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
  <Table.HeaderCell textAlign = 'right'> 
    <i>Filter Inactives by MPG:</i> <div style={{width: 80, display: 'inline'}}> </div>
    <Button color={inactivesFilter === 5 ? 'blue' : null} onClick={() => setInactivesFilter(5)}>5+</Button> 
    <Button color={inactivesFilter === 10 ? 'blue' : null} onClick={() => setInactivesFilter(10)}>10+</Button> 
    <Button color={inactivesFilter === 0 ? 'blue' : null} onClick={() => setInactivesFilter(0)}>All</Button> 
  </Table.HeaderCell>
</Table.Row>
