import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Grid, Table } from 'semantic-ui-react';


class ImpactTable extends React.Component {
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
      <div>
          <Table sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan={1}> </Table.HeaderCell>
                <Table.HeaderCell colSpan={4} textAlign="center"> Team On/Off Court Deltas </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell
                  sorted={column === 'name' ? direction : null}
                  onClick={this.handleSort('name')}
                > Player </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'diff_pace_delta' ? direction : null}
                  onClick={this.handleSort('diff_pace_delta', 'desc')}
                > Pace </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'team_offRtg_delta' ? direction : null}
                  onClick={this.handleSort('team_offRtg_delta', 'desc')}
                > Off <br />Rtg </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'opp_offRtg_delta' ? direction : null}
                  onClick={this.handleSort('opp_offRtg_delta', 'desc')}
                > Opp <br />
                  Off Rtg </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'netRtg_delta' ? direction : null}
                  onClick={this.handleSort('netRtg_delta', 'desc')}
                > Net <br />Rtg </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(data, ({ name, id, team_abb, min_l15, net_rtg_full, off_rtg_full, def_rtg_full, pace_full, diff_pace_delta, team_offRtg_delta, opp_offRtg_delta, netRtg_delta, sigEntries, sigExits }) => (
                <Table.Row
                  key={id}
                >
                  <Table.Cell>
                    <Link to={`/player/${id}`}> {name} </Link>
                  </Table.Cell>
                  <Table.Cell> {diff_pace_delta} </Table.Cell>
                  <Table.Cell> {team_offRtg_delta} </Table.Cell>
                  <Table.Cell> {opp_offRtg_delta} </Table.Cell>
                  <Table.Cell> {netRtg_delta} </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    game: state.game,
    hColors: state.hColors,
    vColors: state.vColors
  }
}

export default connect(mapStateToProps) (ImpactTable);
