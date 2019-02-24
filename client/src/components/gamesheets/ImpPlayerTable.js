import React from 'react';
import _ from 'lodash';
import { gameSecsToClockAndQuarter } from '../../modules/gameTimeFuncs';
import { Table } from 'semantic-ui-react';

const ImpPlayerTable = props => {
  console.log('props are ', props);

  const breakUp = (arr) => {
    if (arr.length === 1) {
      return arr
    } else if (arr.length == 2) {
      return (
        <div>
          <div> {arr[0]} </div>
          <div> {arr[1]} </div>
        </div>
      )
    } else if (arr.length == 3) {
      return (
        <div>
          <div> {arr[0]} </div>
          <div> {arr[1]} </div>
          <div> {arr[2]} </div>
        </div>
      )
    } else {
      return arr
    }
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={6}> </Table.HeaderCell>
          <Table.HeaderCell colSpan={3}> Team On/Off Court Deltas </Table.HeaderCell>
          <Table.HeaderCell colSpan={8}> Rotation Patterns </Table.HeaderCell>
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
          <Table.HeaderCell> Q1In </Table.HeaderCell>
          <Table.HeaderCell> Q1Out </Table.HeaderCell>
          <Table.HeaderCell> Q2In </Table.HeaderCell>
          <Table.HeaderCell> Q2Out </Table.HeaderCell>
          <Table.HeaderCell> Q3In </Table.HeaderCell>
          <Table.HeaderCell> Q3Out </Table.HeaderCell>
          <Table.HeaderCell> Q4In </Table.HeaderCell>
          <Table.HeaderCell> Q4Out </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {_.map(props.players, ({ name, min_l15, net_rtg_full, off_rtg_full, def_rtg_full, pace_full, team_offRtg_delta, opp_offRtg_delta, team_netRtg_delta, sigEntries, sigExits }) => (
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
            <Table.Cell> {breakUp(sigEntries[0])} </Table.Cell>
            <Table.Cell> {breakUp(sigExits[0])} </Table.Cell>
            <Table.Cell> {breakUp(sigEntries[1])}</Table.Cell>
            <Table.Cell> {breakUp(sigExits[1])} </Table.Cell>
            <Table.Cell> {breakUp(sigEntries[2])}</Table.Cell>
            <Table.Cell> {breakUp(sigExits[2])} </Table.Cell>
            <Table.Cell> {breakUp(sigEntries[3])}</Table.Cell>
            <Table.Cell> {breakUp(sigExits[3])} </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default ImpPlayerTable;