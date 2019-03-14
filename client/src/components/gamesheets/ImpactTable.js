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

  render () {
    const { column, data, direction } = this.state;

    return (
      <div>
          <Table sortable attached={this.props.attached}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={column === 'name' ? direction : null}
                  onClick={this.handleSort('name')}
                > {this.props.title} </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'diff_pace_delta' ? direction : null}
                  onClick={this.handleSort('diff_pace_delta', 'desc')}
                > Team <br /> Pace </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'team_offRtg_delta' ? direction : null}
                  onClick={this.handleSort('team_offRtg_delta', 'desc')}
                > Team <br /> Off Rtg </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'opp_offRtg_delta' ? direction : null}
                  onClick={this.handleSort('opp_offRtg_delta', 'desc')}
                > Opp <br />
                  Off Rtg </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'netRtg_delta' ? direction : null}
                  onClick={this.handleSort('netRtg_delta', 'desc')}
                > {this.props.sortedBy == 'netRtgDelta' ? <div>Team<br/>Net Rtg </div> : <div>Total<br/> Rating </div>}
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={column === 'net_rtg_full' ? direction : null}
                  onClick={this.handleSort('net_rtg_full', 'desc')}
                > Player<br/>Net Rtg
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {_.map(data, ({ name, id, team_abb, net_rtg_full, diff_pace_delta, team_offRtg_delta, opp_offRtg_delta, netRtg_delta, total_rating }) => (
                <Table.Row
                  key={id}
                >
                  <Table.Cell>
                    <Link to={`/player/${id}`}> {name} </Link>
                  </Table.Cell>
                  <Table.Cell> {diff_pace_delta} </Table.Cell>
                  <Table.Cell> {team_offRtg_delta} </Table.Cell>
                  <Table.Cell> {opp_offRtg_delta} </Table.Cell>
                  <Table.Cell> {this.props.sortedBy == 'netRtgDelta' ? netRtg_delta : total_rating.toFixed(2)} </Table.Cell>
                  <Table.Cell> {net_rtg_full} </Table.Cell>
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
