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
          <Table.HeaderCell colSpan={6}> </Table.HeaderCell>
          <Table.HeaderCell colSpan={3}> Team On/Off Court Deltas </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell> Player </Table.HeaderCell>
          <Table.HeaderCell> MPG (L15) </Table.HeaderCell>
          <Table.HeaderCell> NetRtg </Table.HeaderCell>
          <Table.HeaderCell> OffRtg </Table.HeaderCell>
          <Table.HeaderCell> DefRtg </Table.HeaderCell>
          <Table.HeaderCell> Pace </Table.HeaderCell>
          <Table.HeaderCell> OffRtg </Table.HeaderCell>
          <Table.HeaderCell> DefRtg </Table.HeaderCell>
          <Table.HeaderCell> NetRtg </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {_.map(props.players, ({ name, min_l15, net_rtg_full, off_rtg_full, def_rtg_full, pace_full, team_offRtg_delta, opp_offRtg_delta, team_netRtg_delta }) => (
          <Table.Row>
            <Table.Cell> {name} </Table.Cell>
            <Table.Cell> {min_l15} </Table.Cell>
            <Table.Cell> {net_rtg_full} </Table.Cell>
            <Table.Cell> {off_rtg_full} </Table.Cell>
            <Table.Cell> {def_rtg_full} </Table.Cell>
            <Table.Cell> {pace_full} </Table.Cell>
            <Table.Cell> {team_offRtg_delta} </Table.Cell>
            <Table.Cell> {opp_offRtg_delta} </Table.Cell>
            <Table.Cell> {team_netRtg_delta} </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default ImpPlayerTable;
