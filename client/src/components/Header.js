import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { setActiveDay } from '../actions';
import moment from 'moment';

class Header extends React.Component {

  setActiveDay = () => {
    let today = moment().format('YYYYMMDD');
    console.log('today is ', today);
    this.props.setActiveDay(today);
  }

  render () {
    return (
      <div className="ui pointing menu">
        <Link to="/netratings" className="item">
          Net Ratings
        </Link>
        <Link to="/schedule" className="item" onClick={this.setActiveDay}>
          Schedule
        </Link>
      </div>
    )
  }

}

// const mapStateToProps = state => {
//   return {
//     setActiveDay: setActiveDay
//   }
// }


export default connect(null, { setActiveDay }) (Header);

// as soon as you click schedule, you are going to set the active day state
