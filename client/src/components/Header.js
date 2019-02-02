import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="ui secondary pointing menu">
      <Link to="/netratings" className="item">
        Net Ratings
      </Link>
      <Link to="/gamesheets" className="item">
        Game Sheets
      </Link>
    </div>
  )
}

export default Header;
