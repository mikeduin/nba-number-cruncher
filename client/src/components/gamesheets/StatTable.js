import React from 'react';
import { Table } from 'semantic-ui-react';

const StatTable = props => {
  const hInfo = props.game.hObj.info;
  const vInfo = props.game.vObj.info;
  const hStats = props.game.hTradStats;
  const vStats = props.game.vTradStats;

  return (
    <div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell> Team </Table.HeaderCell>
            <Table.HeaderCell> FG% </Table.HeaderCell>
            <Table.HeaderCell> 2PT% </Table.HeaderCell>
            <Table.HeaderCell> 3PT% </Table.HeaderCell>
            <Table.HeaderCell> FT% </Table.HeaderCell>
            <Table.HeaderCell> OReb/gm </Table.HeaderCell>
            <Table.HeaderCell> TO/gm </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell> {vInfo.name} </Table.Cell>
            <Table.Cell> {vStats.fg_pct} </Table.Cell>
            <Table.Cell> {vStats.fg2_pct.toFixed(3)} </Table.Cell>
            <Table.Cell> {vStats.fg3_pct} </Table.Cell>
            <Table.Cell> {vStats.ft_pct} </Table.Cell>
            <Table.Cell> {vStats.oreb} </Table.Cell>
            <Table.Cell> {vStats.tov} </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell> {hInfo.name} </Table.Cell>
            <Table.Cell> {hStats.fg_pct} </Table.Cell>
            <Table.Cell> {hStats.fg2_pct.toFixed(3)} </Table.Cell>
            <Table.Cell> {hStats.fg3_pct} </Table.Cell>
            <Table.Cell> {hStats.ft_pct} </Table.Cell>
            <Table.Cell> {hStats.oreb} </Table.Cell>
            <Table.Cell> {hStats.tov} </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}

export default StatTable;
