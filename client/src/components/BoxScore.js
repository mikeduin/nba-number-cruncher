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
                <Table.Cell> {boxScore.hStats.fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1.h_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q1.h_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1.h_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q2.h_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q2.h_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q2.h_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q3.h_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q3.h_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q3.h_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q4.h_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q4.h_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q4.h_fouls}  </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell> {game.home_team} </Table.Cell>
                <Table.Cell> {game.home_spread_full}  </Table.Cell>
                <Table.Cell> {boxScore.vStats.points}  </Table.Cell>
                <Table.Cell> {boxScore.vStats.fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1.v_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q1.v_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1.v_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q2.v_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q2.v_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q2.v_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q3.v_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q3.v_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q3.v_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q4.v_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q4.v_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q4.v_fouls}  </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell colSpan="4"> </Table.Cell>
                <Table.Cell> {boxScore.q1.t_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q1.t_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1.t_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q2.t_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q2.t_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q2.t_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q3.t_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q3.t_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q3.t_fouls}  </Table.Cell>
                <Table.Cell> {boxScore.q4.t_pts}  </Table.Cell>
                <Table.Cell> {boxScore.q4.t_fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q4.t_fouls}  </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell colSpan="4"> </Table.Cell>
                <Table.Cell colSpan="3"> Q1 POSS: {boxScore.q1.poss}  </Table.Cell>
                <Table.Cell colSpan="3"> Q2 POSS: {boxScore.q2.poss}  </Table.Cell>
                <Table.Cell colSpan="3"> Q3 POSS: {boxScore.q3.poss}  </Table.Cell>
                <Table.Cell colSpan="3"> Q4 POSS: {boxScore.q4.poss}  </Table.Cell>
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
