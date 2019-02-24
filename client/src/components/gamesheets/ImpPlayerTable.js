import React from 'react';
import _ from 'lodash';
import { Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { gameSecsToClockAndQuarter } from '../../modules/gameTimeFuncs';

class ImpPlayerTable extends React.Component {
  state = {
    column: null,
    data: this.props.players,
    direction: null
  }

  handleSort = (clickedColumn, dir = 'asc') => () => {
    const { column, data, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.orderBy(data, [clickedColumn], dir),
        direction: dir === 'desc'? 'descending' : 'ascending'
      })
      return
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending'
    })
  }

  breakUp (arr) {
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

  render () {
    const { column, data, direction } = this.state;

    return (
      <Table sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan={6}> </Table.HeaderCell>
            <Table.HeaderCell colSpan={3}> Team On/Off Court Deltas </Table.HeaderCell>
            <Table.HeaderCell colSpan={8} textAlign="center"> Rotation Patterns, Last 45 Days </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell
              sorted={column === 'name' ? direction : null}
              onClick={this.handleSort('name')}
            > Player </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'min_l15' ? direction : null}
              onClick={this.handleSort('min_l15', 'desc')}
            > MPG (L15) </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'net_rtg_full' ? direction : null}
              onClick={this.handleSort('net_rtg_full', 'desc')}
            > NetRtg </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'off_rtg_full' ? direction : null}
              onClick={this.handleSort('off_rtg_full', 'desc')}
            > OffRtg </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'def_rtg_full' ? direction : null}
              onClick={this.handleSort('def_rtg_full', 'desc')}
            > DefRtg </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'pace_full' ? direction : null}
              onClick={this.handleSort('pace_full', 'desc')}
            > Pace </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'team_offRtg_delta' ? direction : null}
              onClick={this.handleSort('team_offRtg_delta', 'desc')}
            > OffRtg </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'opp_offRtg_delta' ? direction : null}
              onClick={this.handleSort('opp_offRtg_delta', 'desc')}
            > DefRtg </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'netRtg_delta' ? direction : null}
              onClick={this.handleSort('netRtg_delta', 'desc')}
            > NetRtg </Table.HeaderCell>
            <Table.HeaderCell colSpan={2} textAlign="center"> Q1 <div><i> in {`\u00A0`} {`\u00A0`} {`\u00A0`} {`\u00A0`}  {`\u00A0`} {`\u00A0`} out </i></div> </Table.HeaderCell>
            <Table.HeaderCell colSpan={2} textAlign="center"> Q2 <div><i> in {`\u00A0`} {`\u00A0`} {`\u00A0`} {`\u00A0`}  {`\u00A0`} {`\u00A0`} out </i></div> </Table.HeaderCell>
            <Table.HeaderCell colSpan={2} textAlign="center"> Q3 <div><i> in {`\u00A0`} {`\u00A0`} {`\u00A0`} {`\u00A0`}  {`\u00A0`} {`\u00A0`} out </i></div> </Table.HeaderCell>
            <Table.HeaderCell colSpan={2} textAlign="center"> Q4 <div><i> in {`\u00A0`} {`\u00A0`} {`\u00A0`} {`\u00A0`}  {`\u00A0`} {`\u00A0`} out </i></div> </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(data, ({ name, id, team_abb, min_l15, net_rtg_full, off_rtg_full, def_rtg_full, pace_full, team_offRtg_delta, opp_offRtg_delta, netRtg_delta, sigEntries, sigExits }) => (
            <Table.Row key={id}>
              <Table.Cell> <Link to={`/player/${id}`}> {name} </Link> </Table.Cell>
              <Table.Cell> {min_l15} </Table.Cell>
              <Table.Cell> {net_rtg_full} </Table.Cell>
              <Table.Cell> {off_rtg_full} </Table.Cell>
              <Table.Cell> {def_rtg_full} </Table.Cell>
              <Table.Cell> {pace_full} </Table.Cell>
              <Table.Cell> {team_offRtg_delta} </Table.Cell>
              <Table.Cell> {opp_offRtg_delta} </Table.Cell>
              <Table.Cell> {netRtg_delta} </Table.Cell>
              <Table.Cell> {this.breakUp(sigEntries[0])} </Table.Cell>
              <Table.Cell> {this.breakUp(sigExits[0])} </Table.Cell>
              <Table.Cell> {this.breakUp(sigEntries[1])}</Table.Cell>
              <Table.Cell> {this.breakUp(sigExits[1])} </Table.Cell>
              <Table.Cell> {this.breakUp(sigEntries[2])}</Table.Cell>
              <Table.Cell> {this.breakUp(sigExits[2])} </Table.Cell>
              <Table.Cell> {this.breakUp(sigEntries[3])}</Table.Cell>
              <Table.Cell> {this.breakUp(sigExits[3])} </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }
}

export default ImpPlayerTable;
