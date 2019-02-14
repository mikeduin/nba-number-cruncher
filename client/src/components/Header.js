import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { setActiveDay } from '../actions';
import moment from 'moment';

class Header extends React.Component {

  setActiveDay = () => {
    let today = moment().format('YYYY-MM-DD');
    this.props.setActiveDay(today);
  }

  render () {
    return (
      <div className="ui pointing menu">
        <Link to="/schedule" className="item" onClick={this.setActiveDay}>
          Schedule
        </Link>
        <Link to="/gamblecast" className="item">
          GambleCast
        </Link>
        <Link to="/netratings" className="item">
          Net Ratings
        </Link>
      </div>
    )
  }

}

export default connect(null, { setActiveDay }) (Header);
