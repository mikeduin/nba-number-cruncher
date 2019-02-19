import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';

import { fetchWeek } from '../actions';

import NetRatings from './NetRatings';
import Schedule from './Schedule';
import GameSheet from './GameSheet';
import Header from './Header';
import TodaysGames from './TodaysGames';
import GambleCast from './GambleCast';

class App extends React.Component {
  componentDidMount () {
    this.props.fetchWeek();
  }

  render () {
    // if (!this.props.todaysGames[1]) {
    //   return <div> </div>
    // } else {
      return (
        <div className="ui container">
          <BrowserRouter>
            <div>
              <Header />
              <Route path='/schedule' exact component={Schedule} />
              <Route path='/schedule/:date' component={Schedule} />
              <Route path='/netratings' exact component={NetRatings} />
              <Route path='/gamesheet/:gid' component={GameSheet} />
              <Route path='/gamblecast' component={GambleCast} />
              <Route path='/player/:pid' component={Player} />
              <TodaysGames />
            </div>
          </BrowserRouter>
        </div>
      )
    // }
  }
};

const mapStateToProps = state => {
  return {
    todaysGames: state.todaysGames
  }
}

export default connect(mapStateToProps, { fetchWeek })(App);
