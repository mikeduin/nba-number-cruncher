import React from 'react';
import { connect } from 'react-redux';
import { fetchBoxScore } from '../actions';
import { Table } from 'semantic-ui-react';

class BoxScore extends React.Component {
  componentDidMount () {
    this.props.fetchBoxScore(this.props.game.gid);
  }

  render () {
    let game = this.props.game;
    let boxScore = this.props.gambleCast[game.gid.toString()];
    if (!boxScore) {
      return <div> Loading ... </div>
    } else {
      console.log(this.props.gambleCast)
      return (
        <div>
          <Table compact celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell> Teams </Table.HeaderCell>
                <Table.HeaderCell colSpan="2"> Game </Table.HeaderCell>
                <Table.HeaderCell colSpan="4"> Q1 </Table.HeaderCell>
                <Table.HeaderCell colSpan="4"> Q2 </Table.HeaderCell>
                <Table.HeaderCell colSpan="4"> Q3 </Table.HeaderCell>
                <Table.HeaderCell colSpan="4"> Q4 </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell> Teams </Table.HeaderCell>
                <Table.HeaderCell> spread </Table.HeaderCell>
                <Table.HeaderCell> score </Table.HeaderCell>
                <Table.HeaderCell> pts </Table.HeaderCell>
                <Table.HeaderCell> poss </Table.HeaderCell>
                <Table.HeaderCell> fg% </Table.HeaderCell>
                <Table.HeaderCell> fouls </Table.HeaderCell>
                <Table.HeaderCell> pts </Table.HeaderCell>
                <Table.HeaderCell> poss </Table.HeaderCell>
                <Table.HeaderCell> fg% </Table.HeaderCell>
                <Table.HeaderCell> fouls </Table.HeaderCell>
                <Table.HeaderCell> pts </Table.HeaderCell>
                <Table.HeaderCell> poss </Table.HeaderCell>
                <Table.HeaderCell> fg% </Table.HeaderCell>
                <Table.HeaderCell> fouls </Table.HeaderCell>
                <Table.HeaderCell> pts </Table.HeaderCell>
                <Table.HeaderCell> poss </Table.HeaderCell>
                <Table.HeaderCell> fg% </Table.HeaderCell>
                <Table.HeaderCell> fouls </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell> {game.away_team}  </Table.Cell>
                <Table.Cell> {game.away_spread_full}  </Table.Cell>
                <Table.Cell> {boxScore.hStats.points}  </Table.Cell>

              </Table.Row>
              <Table.Row>
                <Table.Cell> {game.home_team} </Table.Cell>
                <Table.Cell> {game.home_spread_full}  </Table.Cell>
                <Table.Cell> {boxScore.vStats.points}  </Table.Cell>

              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    gambleCast: state.gambleCast
  }
}

export default connect (mapStateToProps, { fetchBoxScore }) (BoxScore);
