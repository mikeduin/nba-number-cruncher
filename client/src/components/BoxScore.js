import React from 'react';
import { connect } from 'react-redux';
import { Image, Table } from 'semantic-ui-react';
import { EmptyBoxScore, BoxScoreHeader, Inactives } from './boxscores';
import logos from '../modules/logos';

class BoxScore extends React.Component {
  state = {
    final: false,
    gameSpread: null,
    q1Spread: null,
    q2Spread: null,
    q3Spread: null,
    q4Spread: null,
    hNormal: null,
    vNormal: null,
    inactivesFilter: 10
  };

  checkSpread = (period, home, away, total) => {
    let game = this.props.game;

    if (home < away) {
        this.setState({
          [`${period}`]: `${game.h[0].ta} ${home}, O/U ${total}`
        })
    } else if (away < home) {
        this.setState({
          [`${period}`]: `${game.v[0].ta} ${away}, O/U ${total}`
        })
    } else {
      this.setState({
        [`${period}`]: `${game.h[0].ta} PK, O/U ${total}`
      })
    }
  }

  setInactivesFilter = (val) => {
    this.setState({inactivesFilter: val})
  }

  componentDidMount () {
    const { game, teamStats, fetchBoxScore, gambleCast } = this.props;
    const { hNormal, final, gameSpread } = this.state;
    this.checkSpread('gameSpread', game.home_spread_full, game.away_spread_full, game.total_full);
    this.checkSpread('q1Spread', game.home_spread_1q, game.away_spread_1q, game.total_1q);
  }

  render () {
    let game = this.props.game;
    let boxScore = this.props.gambleCast[`live_${game.gid}`];

    // console.log('game in boxScores is ', game);

    if (!boxScore || !boxScore.totals || !game ) {
      if (!game) {
        return <div> loading ... </div>
      } else {
        return <EmptyBoxScore game={game}/>
      }
    } else {
      return (
          <Table 
            compact 
            celled
            attached='top'
          >
            <Table.Header>
              <Table.Row style={{
                lineHeight: '3px',
                fontSize: '10px',
                padding: 0
              }}>
                <Table.HeaderCell style={{minWidth: 150}}> Game ID {game.gid}</Table.HeaderCell>
                <Table.HeaderCell colSpan="2" style={{minWidth: 150}}>
                  {this.state.gameSpread}
                </Table.HeaderCell>
                <Table.HeaderCell colSpan="3" style={{minWidth: 175}}> {this.state.q1Spread} </Table.HeaderCell>
                <Table.HeaderCell colSpan="3" style={{minWidth: 175}}> Q2 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3" style={{minWidth: 175}}> Q3 </Table.HeaderCell>
                <Table.HeaderCell colSpan="3" style={{minWidth: 175}}> Q4 </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell> {boxScore.final ? 'FINAL' : `Q${boxScore.period}, ${boxScore.clock}`} </Table.HeaderCell>
                <Table.HeaderCell colSpan="2">
                  GAME PACE: {boxScore.totals?.t?.pace?.toFixed(2) ?? null}
                </Table.HeaderCell>
                <Table.HeaderCell colSpan="3">
                  Q1 | PACE: {boxScore.q1?.t?.pace?.toFixed(2) ?? null}
                </Table.HeaderCell>
                <Table.HeaderCell colSpan="3">
                  Q2 | PACE: {boxScore.q2?.t?.pace?.toFixed(2) ?? null}
                </Table.HeaderCell>
                <Table.HeaderCell colSpan="3">
                  Q3 | PACE: {boxScore.q3?.t?.pace?.toFixed(2) ?? null}
                </Table.HeaderCell>
                <Table.HeaderCell colSpan="3">
                  Q4 | PACE: {boxScore.q4?.t?.pace?.toFixed(2) ?? null}
                </Table.HeaderCell>
                <Table.HeaderCell style={{width: 550}}>
                  INACTIVES
                </Table.HeaderCell>
              </Table.Row>
              <BoxScoreHeader setInactivesFilter={this.setInactivesFilter} inactivesFilter={this.state.inactivesFilter}/>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell> 
                  <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Image size="mini" circular src={game?.v[0] ? logos[game?.v[0].ta] : null} /> {game.v[0].tn}
                  </div>
                </Table.Cell>
                <Table.Cell> {boxScore.totals.v?.pts}  </Table.Cell>
                <Table.Cell> {boxScore.totals.v?.fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.v?.pts : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.v?.fgPct : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.v?.fouls : null}  </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.v?.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.v?.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.v?.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.v?.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.v?.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.v?.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.v?.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.v?.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.v?.fouls : null} </Table.Cell>
                <Table.Cell> <Inactives logo={game?.v[0] ? logos[game?.v[0].ta] : null} players={boxScore.inactives?.v.filter(player => player.min >= this.state.inactivesFilter)}/></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell> 
                  <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Image size="mini" circular src={game?.h[0] ? logos[game.h[0].ta] : null} /> {game.h[0].tn}
                  </div>
                </Table.Cell>
                <Table.Cell> {boxScore.totals.h?.pts}  </Table.Cell>
                <Table.Cell> {boxScore.totals.h?.fgPct}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.h?.pts : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.h?.fgPct : null}  </Table.Cell>
                <Table.Cell> {boxScore.q1 ? boxScore.q1.h?.fouls : null}  </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.h?.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.h?.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q2 ? boxScore.q2.h?.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.h?.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.h?.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q3 ? boxScore.q3.h?.fouls : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.h?.pts : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.h?.fgPct : null} </Table.Cell>
                <Table.Cell> {boxScore.q4 ? boxScore.q4.h?.fouls : null} </Table.Cell>
                <Table.Cell> <Inactives logo={game?.h[0] ? logos[game.h[0].ta] : null} players={boxScore.inactives?.h.filter(player => player.min >= this.state.inactivesFilter)}/></Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    gambleCast: state.gambleCast,
    activeGames: state.activeGames,
    completedGames: state.completedGames
    // teamStats: state.week.teamStats
  }
}

export default connect (mapStateToProps, null) (BoxScore);
