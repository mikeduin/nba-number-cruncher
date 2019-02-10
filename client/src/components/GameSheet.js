import React from 'react';
import ReactTable from 'react-table';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

import NetRtgByQuarter from './netRatingGrids/NetRtgByQuarter';
import ByRotation from './netRatingGrids/ByRotation';
import PaceByQuarter from './paceGrids/PaceByQuarter';
import QuarterChart from './QuarterChart';
import InfoTable from './gamesheets/InfoTable';
import ActiveDayGrid from './gamesheets/ActiveDayGrid';

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
        <ActiveDayGrid />
        <InfoTable />
        <h2 className="ui center aligned icon header">
          <i className="circular users icon"></i>
          {game.info.v[0].tc} {game.info.v[0].tn} @ {game.info.h[0].tc} {game.info.h[0].tn}
        </h2>
        <div className="ui grid">
          <div className="two column row">
            <div className="column">
              <QuarterChart
                homeData={game.homeObj}
                visData={game.visObj}
              />
            </div>
            <div className="column">
              <table className="ui celled table">
                <thead>
                  <tr>
                    <th> {game.info.v[0].ta} </th>
                    <th> @ </th>
                    <th> {game.info.h[0].ta} </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td> {game.info.away_spread_1q} </td>
                    <td> 1Q Spread </td>
                    <td> {game.info.home_spread_1q} </td>
                  </tr>
                  <tr>
                    <td> {game.info.away_money_1q} </td>
                    <td> 1Q ML </td>
                    <td> {game.info.home_money_1q} </td>
                  </tr>
                  <tr>
                    <td> {game.info.total_1q} </td>
                    <td> 1Q Total </td>
                    <td> {game.info.total_1q} </td>
                  </tr>
                  <tr>
                    <td> {game.info.away_spread_1h} </td>
                    <td> 1H Spread </td>
                    <td> {game.info.home_spread_1h} </td>
                  </tr>
                  <tr>
                    <td> {game.info.away_money_1h} </td>
                    <td> 1H ML </td>
                    <td> {game.info.home_money_1h} </td>
                  </tr>
                  <tr>
                    <td> {game.info.total_1h} </td>
                    <td> 1H Total </td>
                    <td> {game.info.total_1h} </td>
                  </tr>
                  <tr>
                    <td> {game.info.away_spread_full} </td>
                    <td> Game Spread </td>
                    <td> {game.info.home_spread_full} </td>
                  </tr>
                  <tr>
                    <td> {game.info.away_money_full} </td>
                    <td> Game ML </td>
                    <td> {game.info.home_money_full} </td>
                  </tr>
                  <tr>
                    <td> {game.info.total_full} </td>
                    <td> Game Total </td>
                    <td> {game.info.total_full} </td>
                  </tr>
                </tbody>
              </table>
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
    game: state.game
  }
}

export default connect(mapStateToProps, {fetchGame}) (GameSheet);
