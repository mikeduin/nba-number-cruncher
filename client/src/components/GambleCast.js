import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import BoxScore from './BoxScore';
import { Header } from 'semantic-ui-react';

class GambleCast extends React.Component {
  componentDidMount () {
    console.log('props in gcast are ', this.props);
  }

  renderBoxScores = () => {
    const checkActive = (gid) => {
      return this.props.activeGames.indexOf(gid) !== -1
    };

    if (this.props.games[0]) {
      return this.props.games.map(game => {
        return (
          <BoxScore key={game.gid} game={game} liveUpdates={checkActive(game.gid)}/>
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
        <div style={{marginBottom: 200}}>
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
    activeGames: state.activeGames
  }
}

export default connect (mapStateToProps) (GambleCast);
