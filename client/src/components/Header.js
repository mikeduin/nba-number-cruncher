import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="ui pointing menu">
      <Link to="/netratings" className="item">
        Net Ratings
      </Link>
      <Link to="/schedule" className="item">
        Schedule
      </Link>
    </div>
  )
}

export default Header;
