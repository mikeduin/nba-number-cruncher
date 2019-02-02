import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import NetRatings from './NetRatings';
import GameSheets from './GameSheets';
import Header from './Header';

const App = () => {
  return (
    <div className="ui container">
      <BrowserRouter>
        <div>
          <Header />
          <Route path='/gamesheets' exact component={GameSheets} />
          <Route path='/netratings' exact component={NetRatings} />
        </div>
      </BrowserRouter>
    </div>
  )
};

export default App;
