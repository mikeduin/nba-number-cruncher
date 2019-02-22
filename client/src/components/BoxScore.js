import React from 'react';
import { connect } from 'react-redux';
import { fetchBoxScore } from '../actions';
import { Table } from 'semantic-ui-react';
import EmptyBoxScore from './gambleCast/EmptyBoxScoreTable';

class BoxScore extends React.Component {
  state = {active: false};

  componentDidMount () {
    console.log('props in BS are ', this.props);
    this.props.fetchBoxScore(this.props.game.gid);

    // if (this.state.active) {
      setInterval(() => {
        this.props.fetchBoxScore(this.props.game.gid);
        console.log('checking score for ', this.props.game.gid);
      }, 5000)
    // }
  }

  checkSpread = () => {
    let game = this.props.game;
    let spread = '';

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

    return (
      <div> {spread}, O/U {game.odds.total_full} </div>
    )
  }

  render () {
    let game = this.props.game;
    let boxScore = this.props.gambleCast[`live_${game.gid}`];
    let snapshot = this.props.gambleCast[`live_snap_${game.gid}`];
    if (game.gid === 21800872 || game.gid === 21800871) {

      if (!boxScore || !boxScore.active || !boxScore.totals) {
        if (!game) {
          return <div> loading ... </div>
        } else {
          return <EmptyBoxScore game={game}/>
        }
      } else {
        if (!this.state.active) {
          this.setState({active: true})
        }
        // console.log('boxScore its getting to is ', boxScore);
        // console.log('main bs rendered props are ', this.props);
        console.log('this.props when boxScore is rendered is ', this.props);
        console.log('boxScore for ', game.gid ,' is', boxScore);
        return (
          <div>
            <Table compact celled
              style={{marginBottom: 20}}
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell> Q{boxScore.period}, {boxScore.clock} </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3">  </Table.HeaderCell>
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
                  <Table.HeaderCell>  </Table.HeaderCell>
                  <Table.HeaderCell colSpan="2"> {this.state.spread} </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q1 </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q2 </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell> Game ID {game.gid} </Table.HeaderCell>
                  <Table.HeaderCell colSpan="2"> GAME PACE: {boxScore.pace.toFixed(2)} </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q1 | PACE: {boxScore.q1.t.pace.toFixed(2)} </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q2 | PACE: {boxScore.q2.t.pace.toFixed(2)} </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q3 </Table.HeaderCell>
                  <Table.HeaderCell colSpan="3"> Q4 </Table.HeaderCell>
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
                  <Table.Cell> {boxScore.q1.v.pts}  </Table.Cell>
                  <Table.Cell> {boxScore.q1.v.fgPct}  </Table.Cell>
                  <Table.Cell> {boxScore.q1.v.fouls}  </Table.Cell>
                  <Table.Cell> {boxScore.q2.v.pts}  </Table.Cell>
                  <Table.Cell> {boxScore.q2.v.fgPct}  </Table.Cell>
                  <Table.Cell> {boxScore.q2.v.fouls}  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell> {game.home_team} </Table.Cell>
                  <Table.Cell> {boxScore.totals.h.pts}  </Table.Cell>
                  <Table.Cell> {boxScore.totals.h.fgPct}  </Table.Cell>
                  <Table.Cell> {boxScore.q1.h.pts}  </Table.Cell>
                  <Table.Cell> {boxScore.q1.h.fgPct}  </Table.Cell>
                  <Table.Cell> {boxScore.q1.h.fouls}  </Table.Cell>
                  <Table.Cell> {boxScore.q2.h.pts}  </Table.Cell>
                  <Table.Cell> {boxScore.q2.h.fgPct}  </Table.Cell>
                  <Table.Cell> {boxScore.q2.h.fouls}  </Table.Cell>
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
    } else {
      return (<div> Game not live </div>)
    }
  }
}

const mapStateToProps = state => {
  return {
    gambleCast: state.gambleCast
  }
}

export default connect (mapStateToProps, { fetchBoxScore }) (BoxScore);
