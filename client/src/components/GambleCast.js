import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import './styles/gamblecast.css';
import BoxScore from './BoxScore';
import PlayerProps from './PlayerProps';
import { Header } from 'semantic-ui-react';
import { fetchPlayerProps } from '../actions';

class GambleCast extends React.Component {
  componentDidMount () {
    const { fetchPlayerProps } = this.props;
    fetchPlayerProps();
    setInterval(() => {
      fetchPlayerProps();
    }, 3000)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.playerProps !== this.props.playerProps) {
      this.setState({ playerProps: this.props.playerProps });
    }
  }

  renderBoxScores = () => {
    const { activeGames, gambleCast, games, playerProps, playersMetadata} = this.props;
    // console.log('playerProps are ', playerProps);
    // console.log('playersMetadata in gamblecast are ', playersMetadata);

    const checkActive = (gid) => {
      return activeGames.indexOf(gid) !== -1
    };

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

export default connect (mapStateToProps, { fetchPlayerProps }) (GambleCast);
