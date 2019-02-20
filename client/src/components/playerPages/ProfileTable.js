import React from 'react';
import { Table } from 'semantic-ui-react';

const ProfileTable = (props) => {
  let player = props.player;
  return (
    <Table definition>
      <Table.Header>
        <Table.Row>
          <Table.Cell>

          </Table.Cell>
          <Table.Cell>
            Season
          </Table.Cell>
          <Table.Cell>
            Last 5
          </Table.Cell>
          <Table.Cell>
            Last 10
          </Table.Cell>
          <Table.Cell>
            Last 15
          </Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            MPG
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.min_full}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.min_l5}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.min_l10}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.min_l15}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Net Rating
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.net_rtg_full}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.net_rtg_l5}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.net_rtg_l10}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.net_rtg_l15}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Off Rating
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.off_rtg_full}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.off_rtg_l5}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.off_rtg_l10}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.off_rtg_l15}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Def Rating
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.def_rtg_full}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.def_rtg_l5}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.def_rtg_l10}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.def_rtg_l15}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Pace
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.pace_full}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.pace_l5}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.pace_l10}
          </Table.Cell>
          <Table.Cell>
            {player.mappedData.pace_l15}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default ProfileTable;
