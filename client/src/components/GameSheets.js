import React from "react";
import moment from "moment";
import _ from 'lodash';

import { connect } from "react-redux";
import { fetchWeek } from "../actions";

class GameSheets extends React.Component {
  componentDidMount() {
    this.props.fetchWeek();
  }

  renderWeekGrid () {
    const dashedDates = this.props.week.weekArray.map(date => {
      date = date.toString();
      return date.slice(0,4)+'-'+date.slice(4,6)+'-'+date.slice(6,8);
    });

    const countedDates = this.props.week.weekGames.reduce((sums, game) => {
      sums[game.gdte] = (sums[game.gdte] || 0) + 1;
      return sums;
    }, {})

    return dashedDates.map(date => {
      return (
        <div className="column">
          <div className="ui segment">
            <div className="ui statistic">
              <div class="label">
                {moment(date).format('ddd')}
              </div>
              <div class="value">
                {moment(date).format('M/D')}
              </div>
              <div class="label">
                {countedDates[date]} Games
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
)(GameSheets);
