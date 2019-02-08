import React from 'react';
import ReactTable from 'react-table';


import { connect } from 'react-redux';
import { fetchGame } from '../actions';

import NetRtgByQuarter from './netRatingGrids/NetRtgByQuarter';
import ByRotation from './netRatingGrids/ByRotation';
import PaceByQuarter from './paceGrids/PaceByQuarter';
import QuarterChart from './QuarterChart';


class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
  }

  render () {
    let game = this.props.game;
    if (!this.props.game.info) {
      return <div> Loading ... </div>
    } else {
      return (
        <div>
        <h2 className="ui center aligned icon header">
          <i className="circular users icon"></i>
          {game.info.v[0].tc} {game.info.v[0].tn} @ {game.info.h[0].tc} {game.info.h[0].tn}
        </h2>
        <QuarterChart
          homeData={this.props.game.homeObj}
          visData={this.props.game.visObj}
        />
        <br />
        <ByRotation netRatings={this.props.game.netRatingsArr} />
        <br />
        <NetRtgByQuarter netRatings={this.props.game.netRatingsArr} />
        <br />
        <PaceByQuarter pace={this.props.game.paceArr} />
        <br />
        </div>
      )
    }
  }

}

const mapStateToProps = state => {
  return {
    game: state.game
  }
}

export default connect(mapStateToProps, {fetchGame}) (GameSheet);
