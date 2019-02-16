import React from 'react';
import { connect } from 'react-redux';
import BoxScore from './BoxScore';

class GambleCast extends React.Component {
  componentDidMount () {
    console.log(this.props);
  }

  renderBoxScores = () => {
    return this.props.games.map(game => {
      return (
        <BoxScore key={game.gid} game={game}/>
      )
    })
  }

  render() {
    if (!this.props.games[0]) {
      return <div> Loading ... </div>
    } else {
      return (
        <div>
          {this.renderBoxScores()}
        </div>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    games: state.todaysGames,
    gambleCast: state.gambleCast
  }
}

export default connect (mapStateToProps) (GambleCast);
