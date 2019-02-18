import React from 'react';
import { connect } from 'react-redux';
import { fetchBoxScore } from '../actions';
import { Table } from 'semantic-ui-react';

class BoxScore extends React.Component {
  componentDidMount () {
    this.props.fetchBoxScore(this.props.game.gid);
    setInterval(() => {
      this.props.fetchBoxScore(this.props.game.gid);
      console.log('checking score');
    }, 5000)
  }

  render () {
    let game = this.props.game;
    let boxScore = this.props.gambleCast[`live_${game.gid}`];
    let snapshot = this.props.gambleCast[`live_snap_${game.gid}`]
    if (!boxScore) {
      return <div> Loading ... </div>
    } else {
      console.log(this.props.gambleCast)
      return (
        <div>
          <Table compact celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>  </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q{boxScore.period}, {boxScore.clock} </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q1 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q2 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell> Teams </Table.HeaderCell>
                <Table.HeaderCell> spread </Table.HeaderCell>
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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell> {game.away_team}  </Table.Cell>
                <Table.Cell> {game.away_spread_full}  </Table.Cell>
                <Table.Cell> {boxScore.hStats.points}  </Table.Cell>
                <Table.Cell> {boxScore.hStats.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q1.h.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q1.h.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q1.h.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q2.h.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q2.h.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q2.h.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q3.h.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q3.h.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q3.h.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q4.h.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q4.h.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q4.h.fouls}  </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell> {game.home_team} </Table.Cell>
                <Table.Cell> {game.home_spread_full}  </Table.Cell>
                <Table.Cell> {boxScore.vStats.points}  </Table.Cell>
                <Table.Cell> {boxScore.vStats.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q1.v.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q1.v.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q1.v.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q2.v.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q2.v.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q2.v.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q3.v.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q3.v.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q3.v.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q4.v.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q4.v.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q4.v.fouls}  </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell colSpan="4"> </Table.Cell>
                <Table.Cell> {boxScore.q1.t.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q1.t.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q1.t.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q2.t.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q2.t.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q2.t.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q3.t.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q3.t.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q3.t.fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q4.t.pts}  </Table.Cell>
                <Table.Cell> {boxScore.q4.t.fgPct.toFixed(1)}  </Table.Cell>
                <Table.Cell> {boxScore.q4.t.fouls}  </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell colSpan="4"> </Table.Cell>
                <Table.Cell colSpan="3"> Q1 PACE: {boxScore.q1.t.poss.toFixed(1)}  </Table.Cell>
                <Table.Cell colSpan="3"> Q2 PACE: {boxScore.q2.t.poss.toFixed(1)}  </Table.Cell>
                <Table.Cell colSpan="3"> Q3 PACE: {boxScore.q3.t.poss.toFixed(1)}  </Table.Cell>
                <Table.Cell colSpan="3"> Q4 PACE: {boxScore.q4.t.poss.toFixed(1)}  </Table.Cell>
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
