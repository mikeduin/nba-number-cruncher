import React from 'react';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

import NetRtgByQuarter from './netRatingGrids/NetRtgByQuarter';
import ByRotation from './netRatingGrids/ByRotation';
import PaceByQuarter from './paceGrids/PaceByQuarter';
import QuarterChart from './QuarterChart';
import InfoTable from './gamesheets/InfoTable';
import ScenarioBuilder from './gamesheets/ScenarioBuilder';

class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
  }

  render () {
    let game = this.props.game;
    if (!this.props.game.info || !this.props.hPlayers[0] || !this.props.vPlayers[0]) {
      return <div> Loading ... </div>
    } else {
      return (
        <div>
        <InfoTable />
        <div className="ui grid">
          <ScenarioBuilder  />
          <div className="three column row">
            <div className="column">
              <QuarterChart
                homeData={game.hObj}
                visData={game.vObj}
                hColor={this.props.hColors.active}
                vColor={this.props.vColors.active}
              />
            </div>
          </div>
        </div>

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
    game: state.game,
    hPlayers: state.hPlayers,
    vPlayers: state.vPlayers,
    hColors: state.hColors,
    vColors: state.vColors
  }
}

export default connect(mapStateToProps, {fetchGame}) (GameSheet);
