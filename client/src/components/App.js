import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import ToastContainer from './ToastContainer';
import { Container } from 'semantic-ui-react';

import { fetchWeek, getPlayerMetadata, checkActiveGames, fetchDailyBoxScores, fetchActiveBoxScores } from '../actions';

import NetRatings from './NetRatings';
import Schedule from './Schedule';
import GameSheet from './GameSheet';
import Header from './Header';
import TodaysGames from './TodaysGames';
import GambleCast from './GambleCast';
import Player from './playerPages/Player';

class App extends React.Component {
  componentDidMount () {
    this.props.fetchWeek();
    this.props.getPlayerMetadata();
    // this.props.checkActiveGames();
    // console.log('activeDay in App is ', this.props.activeDay);
    // this.props.fetchDailyBoxScores();
    // this.props.fetchActiveBoxScores();
    // setInterval(()=>{
    //   this.props.checkActiveGames();
    //   this.props.fetchActiveBoxScores();
    // }, 5000);
  }

  render () {
    if (!this.props.players[1]) {
      return <div> Loading App ... </div>
    } else {
      return (
        <div style={{marginLeft: '19%', marginRight: '19%'}}>
          <BrowserRouter>
            <div>
              <Header players={this.props.players} />
              <ToastContainer />
              <Route path='/' exact component={Schedule} />
              <Route path='/schedule' exact component={Schedule} />
              <Route path='/schedule/:date' component={Schedule} />
              <Route path='/netratings' exact component={NetRatings} />
              <Route path='/gamesheet/:gid' component={GameSheet} />
              <Route path='/gamblecast' component={GambleCast} />
              <Route path='/gamblecast/:date' component={GambleCast} />
              <Route path='/player/:pid' component={Player} />
              <TodaysGames />
            </div>
          </BrowserRouter>
        </div>
      )
    }
  }
};

const mapStateToProps = state => {
  return {
    activeDay: state.activeDay,
    players: state.playersMetadata
  }
}

export default connect(mapStateToProps, { fetchWeek, getPlayerMetadata, checkActiveGames, fetchActiveBoxScores, fetchDailyBoxScores })(App);
