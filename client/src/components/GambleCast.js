import React from 'react';
import { connect } from 'react-redux';
import moment from "moment";
import './styles/gamblecast.css';
import BoxScore from './BoxScore';
import PlayerProps from './PlayerProps';
import { Header } from 'semantic-ui-react';
import { checkActiveGames, fetchActiveBoxScores, fetchDailyBoxScores, fetchPlayerProps, fetchWeek, setActiveDay } from '../actions';

class GambleCast extends React.Component {
  componentDidMount () {
    console.log('activeDay in Gamblecast init is ', this.props.activeDay);
    let effectiveDay = moment().format('YYYY-MM-DD')
    if (!this.props.match.params.date) {
      this.props.setActiveDay(effectiveDay);
    } else {
      effectiveDay = this.props.match.params.date;
      this.props.setActiveDay(this.props.match.params.date);
    }
    this.props.fetchWeek(effectiveDay);
    this.props.checkActiveGames();
    this.props.fetchDailyBoxScores();
    this.props.fetchActiveBoxScores();
    this.props.fetchPlayerProps();
    setInterval(() => {
      this.props.checkActiveGames();
      this.props.fetchActiveBoxScores();
      this.props.fetchPlayerProps();
    }, 5000)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.playerProps !== this.props.playerProps) {
      this.setState({ playerProps: this.props.playerProps });
    }
  }

  renderBoxScores = () => {
    const { gambleCast, games, playersMetadata} = this.props;
    if (games[0]) {
      return games.map(game => {
        const hTid = game.h[0].tid;
        const vTid = game.v[0].tid;
        return (
          <div key={game.gid}>
            <BoxScore game={game}/>
            <PlayerProps 
              key={`props-${game.gid}`} 
              game={game}
              playersMetadata={playersMetadata.filter(player => player.team_id == hTid || player.team_id == vTid)}
              boxScore={gambleCast[`live_${game.gid}`]}
            />
          </div>
        )
      })
    } else {
      return 'no games today'
    }
  }

  render() {
    if (this.props.activeDay.length < 1) {
      return <div> Loading ... </div>
    } else {
      console.log('this.props.activeDay in GambleCast render is ', this.props.activeDay);
      return (
        <div style={{paddingBottom: 150}} className='gamblecast-main'>
          <Header size='huge'> Today's Games </Header>
          {this.renderBoxScores()}
        </div>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    games: state.todaysGames,
    gambleCast: state.gambleCast,
    activeDay: state.activeDay,
    activeGames: state.activeGames,
    playerProps: state.playerProps,
    playersMetadata: state.playersMetadata
  }
}

export default connect (mapStateToProps, { fetchWeek, checkActiveGames, fetchActiveBoxScores, fetchDailyBoxScores, fetchPlayerProps, setActiveDay }) (GambleCast);
