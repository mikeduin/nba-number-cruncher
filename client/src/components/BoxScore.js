import React from 'react';
import { connect } from 'react-redux';
import { fetchBoxScore } from '../actions';
import { Table } from 'semantic-ui-react';
import EmptyBoxScore from './gambleCast/EmptyBoxScoreTable';

class BoxScore extends React.Component {
  state = {final: false};

  componentDidMount () {
    const game = this.props.game;

    setInterval(() => {
      if (this.props.activeGames.indexOf(this.props.game.gid) !== -1 && !this.state.final) {
        console.log('fetching box score for ', this.props.game.gid);
        this.props.fetchBoxScore(this.props.game.gid);

        if (this.props.gambleCast[`live_${game.gid}`]) {
          if (this.props.gambleCast[`live_${game.gid}`].final == true) {
            this.setState({final: true})
          }
        }
      }
    }, 5000);
  }

  checkSpread = () => {
    let game = this.props.game;
    // let spread = '';
    console.log('spread fn running');

    if (game.odds.home_spread_full < game.odds.away_spread_full) {
        this.setState({
          spread: `${game.info.h[0].ta} ${game.odds.home_spread_full}`
        })
    } else if (game.odds.away_spread_full < game.odds.home_spread_full) {
        this.setState({
          spread: `${game.info.v[0].ta} ${game.odds.away_spread_full}`
        })
    } else {
      this.setState({
        spread: `${game.info.h[0].ta} PK`
      })
    }
    //
    // return (
    //   <div> {spread}, O/U {game.odds.total_full} </div>
    // )
  }

  render () {
    let game = this.props.game;
    let boxScore = this.props.gambleCast[`live_${game.gid}`];
    // console.log('boxScore for ', game.gid ,' is', boxScore);

    if (!boxScore || !boxScore.totals ) {
      if (!game) {
        return <div> loading ... </div>
      } else {
        return <EmptyBoxScore game={game}/>
      }
    } else {
      // console.log('this.props when boxScore is rendered is ', this.props);
      return (
        <div>
          <Table compact celled
            style={{marginBottom: 20}}
          >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell> {boxScore.final ? 'FINAL' : `Q${boxScore.period}, ${boxScore.clock}`} </Table.HeaderCell>
                <Table.HeaderCell colSpan="2">  </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q1 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q2 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
              </Table.Row>
              <Table.Row style={{
                lineHeight: '3px',
                fontSize: '10px',
                padding: 0
              }}>
                <Table.HeaderCell textAlign="right"> <i>Odds -></i> </Table.HeaderCell>
                <Table.HeaderCell colSpan="2">  </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q1 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q2 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell> Game ID {game.gid} </Table.HeaderCell>
                <Table.HeaderCell colSpan="2"> GAME PACE:  {boxScore.totals ? boxScore.totals.t.pace.toFixed(2) : null} </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q1 | PACE: {boxScore.q1 != null ? boxScore.q1.t.pace.toFixed(2) : null} </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q2 | PACE: {boxScore.q2 != null ? boxScore.q2.t.pace.toFixed(2) : null} </Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q3 | PACE: {boxScore.q3 != null ? boxScore.q3.t.pace.toFixed(2) : null}</Table.HeaderCell>
                <Table.HeaderCell colSpan="3"> Q4 | PACE: {boxScore.q4 != null ? boxScore.q4.t.pace.toFixed(2) : null}</Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell> Teams </Table.HeaderCell>
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
                <Table.Cell> {boxScore.totals.v.pts}  </Table.Cell>
                <Table.Cell> {boxScore.totals.v.fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.v.pts : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.v.fgPct : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.v.fouls : null}  </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.v.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.v.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.v.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.v.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.v.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.v.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.v.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.v.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.v.fouls : null} </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell> {game.home_team} </Table.Cell>
                <Table.Cell> {boxScore.totals.h.pts}  </Table.Cell>
                <Table.Cell> {boxScore.totals.h.fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.h.pts : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.h.fgPct : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.h.fouls : null}  </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.h.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.h.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.h.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.h.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.h.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.h.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.h.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.h.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.h.fouls : null} </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell colSpan="4"> </Table.Cell>

              </Table.Row>
              <Table.Row>
                <Table.Cell colSpan="1"> </Table.Cell>

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
    gambleCast: state.gambleCast,
    activeGames: state.activeGames,
    completedGames: state.completedGames
  }
}

export default connect (mapStateToProps, { fetchBoxScore }) (BoxScore);
