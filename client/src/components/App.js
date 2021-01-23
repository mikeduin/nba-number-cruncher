import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';

import { fetchWeek, getPlayerMetadata, checkActiveGames } from '../actions';

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
    setInterval(()=>{
      this.props.checkActiveGames()
      console.log('checking for active games in app wrapper every 5 seconds')
    }, 5000);
  }

  render () {
    if (!this.props.players[1]) {
      return <div> Loading App ... </div>
    } else {
      return (
        <div className="ui container">
          <BrowserRouter>
            <div>
              <Header players={this.props.players} />
              <Route path='/' exact />
              <Route path='/schedule' exact component={Schedule} />
              <Route path='/schedule/:date' component={Schedule} />
              <Route path='/netratings' exact component={NetRatings} />
              <Route path='/gamesheet/:gid' component={GameSheet} />
              <Route path='/gamblecast' component={GambleCast} />
              <Route path='/player/:pid' component={Player} />

            </div>
          </BrowserRouter>
        </div>
      )
    }
  }
};

              // <TodaysGames />

const mapStateToProps = state => {
  return {
    players: state.playersMetadata
  }
}

export default connect(mapStateToProps, { fetchWeek, getPlayerMetadata, checkActiveGames })(App);
