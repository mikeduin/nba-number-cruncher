import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import NetRatings from './NetRatings';
import Schedule from './Schedule';
import GameSheet from './GameSheet';
import Header from './Header';

const App = () => {
  return (
    <div className="ui container">
      <BrowserRouter>
        <div>
          <Header />
          <Route path='/schedule' exact component={Schedule} />
          <Route path='/schedule/:date' component={Schedule} />
          <Route path='/netratings' exact component={NetRatings} />
          <Route path='/gamesheet/:gid' component={GameSheet} />
        </div>
      </BrowserRouter>
    </div>
  )
};

export default App;
