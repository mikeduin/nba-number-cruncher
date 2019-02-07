import React from "react";
import { Link } from 'react-router-dom';
import moment from "moment";
import _ from 'lodash';

import { connect } from "react-redux";
import { fetchWeek } from "../actions";

class Schedule extends React.Component {
  componentDidMount() {
    this.props.fetchWeek();
  }

  renderWeekGrid () {
    const dashedDates = this.props.week.weekArray.map(date => {
      date = date.toString();
      return `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
    });

    const countedDates = this.props.week.weekGames.reduce((sums, game) => {
      sums[game.gdte] = (sums[game.gdte] || 0) + 1;
      return sums;
    }, {})

    return dashedDates.map(date => {
      return (
        <div className="column" key={date}>
          <div className={`ui segment ${date === this.props.week.today ? 'inverted' : null}`}>
            <div className={`ui statistic ${date === this.props.week.today ? 'blue' : null}`}>
              <div className="label">
                {moment(date).format('ddd')}
              </div>
              <div className="value">
                {moment(date).format('M/D')}
              </div>
              <div className="label">
                {countedDates[date]} Games
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  renderGameGrid () {
    let todayGames = this.props.week.weekGames.filter(game => {
      return game.gdte === this.props.week.today;
    })

    return todayGames.map(game => {
      return (
        <div className="column" key={game.gid}>
          <div className="ui special cards">
            <div className="card">
              <div className="blurring dimmable image">
                <div className="ui dimmer">
                  <div className="content">
                    <div className="center">
                      <div className="ui inverted button"> View Analysis </div>
                    </div>
                  </div>
                </div>
                <img src="/images/logos/bos.svg" />
              </div>
              <div className="content">
                <Link className="header" to={`/gamesheet/${game.gid}`}>
                  {game.v[0].tc} {game.v[0].tn} @ {game.h[0].tc} {game.h[0].tn}
                </Link>
                <div className="meta">
                  <span className="date"> {moment(game.etm).format('h:mm A')} EST </span>
                </div>
              </div>
              <div className="extra content">
                <div>
                  <i className="users icon"></i>
                  More data here
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  render() {
    if (!this.props.week.weekArray) {
      return <div> Loading ... </div>
    } else {
      return (
        <div>
          Week {this.props.week.week}
          <div className="ui grid">
            <div className={`seven column row`}>
              {this.renderWeekGrid()}
            </div>
          </div>
          <div className="ui four column grid">
            {this.renderGameGrid()}
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
    week: state.week,
    weekGames: state.week.weekGames
  };
};

export default connect(
  mapStateToProps,
  { fetchWeek }
)(Schedule);
