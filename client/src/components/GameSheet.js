import React from 'react';
import ReactTable from 'react-table';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup } from 'victory';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

import ByQuarter from './netRatingGrids/ByQuarter';
import ByRotation from './netRatingGrids/ByRotation';


class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
  }

  // buildMasterTable () {
  //   let game = this.props.game;
  //   return (
  //     <table className="ui celled striped table">
  //       <thead>
  //         <tr>
  //           <th colspan='3'>NET RATING BREAKDOWN</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         <tr>
  //           <td> {game.info.v[0].tc} {game.info.v[0].tn} </td>
  //           <td> @ </td>
  //           <td> {game.info.h[0].tc} {game.info.h[0].tn} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].team_full} </td>
  //           <td> Full Roster, Season </td>
  //           <td> {game.netRatings[0].team_full} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].team_l5} </td>
  //           <td> Full Roster, Last 5 </td>
  //           <td> {game.netRatings[0].team_l5} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].team_l10} </td>
  //           <td> Full Roster, Last 10 </td>
  //           <td> {game.netRatings[0].team_l10} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].starters_full} </td>
  //           <td> Starters, Season </td>
  //           <td> {game.netRatings[0].starters_full} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].starters_l5} </td>
  //           <td> Starters, Last 5 </td>
  //           <td> {game.netRatings[0].starters_l5} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].starters_l10} </td>
  //           <td> Starters, Last 10 </td>
  //           <td> {game.netRatings[0].starters_l10} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].bench_full} </td>
  //           <td> Bench, Season </td>
  //           <td> {game.netRatings[0].bench_full} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].bench_l5} </td>
  //           <td> Bench, Last 5 </td>
  //           <td> {game.netRatings[0].bench_l5} </td>
  //         </tr>
  //         <tr>
  //           <td> {game.netRatings[1].bench_l10} </td>
  //           <td> Bench, Last 10 </td>
  //           <td> {game.netRatings[0].bench_l10} </td>
  //         </tr>
  //       </tbody>
  //     </table>
  //   )
  // }

  // buildNetRatingsTable () {
  //   return <
  // }

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
        <ByRotation netRatings={this.props.game.netRatings} />
        <br />
        <ByQuarter netRatings={this.props.game.netRatings} />


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
