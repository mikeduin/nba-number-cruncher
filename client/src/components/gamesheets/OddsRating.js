import React from 'react';
import { Table } from 'semantic-ui-react';

const OddsRating = (props) => {
  const hInfo = props.game.hObj.info;
  const vInfo = props.game.vObj.info;
  const hStats = props.game.hTradStats;
  const vStats = props.game.vTradStats;
  const odds = props.game.odds;
  console.log('props are ', props);

  return (
    <div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>  </Table.HeaderCell>
            <Table.HeaderCell> Game </Table.HeaderCell>
            <Table.HeaderCell> 1H </Table.HeaderCell>
            <Table.HeaderCell> 1Q </Table.HeaderCell>
            <Table.HeaderCell> 2Q </Table.HeaderCell>
            <Table.HeaderCell> 2H </Table.HeaderCell>
            <Table.HeaderCell> 3Q </Table.HeaderCell>
            <Table.HeaderCell> 4Q </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell> Odds (Home) </Table.Cell>
            <Table.Cell> {odds.home_spread_full} </Table.Cell>
            <Table.Cell> {odds.home_spread_1h} </Table.Cell>
            <Table.Cell> {odds.home_spread_1q} </Table.Cell>
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

export default OddsRating;
