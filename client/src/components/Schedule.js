import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import { connect } from "react-redux";
import { fetchWeek, setActiveDay } from "../actions";

class Schedule extends React.Component {
  componentDidMount() {
    if (!this.props.match.params.date) {
      this.props.setActiveDay(moment().format('YYYY-MM-DD'));
    } else {
      this.props.setActiveDay(this.props.match.params.date);
    }
  }

  renderWeekGrid() {
    const dashedDates = this.props.week.weekArray.map(date => {
      date = date.toString();
      return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    });

    const countedDates = this.props.week.weekGames.reduce((sums, game) => {
      sums[game.gdte] = (sums[game.gdte] || 0) + 1;
      return sums;
    }, {});

    return dashedDates.map(date => {
      return (
        <Link
          className="column"
          key={date}
          to={`/schedule/${date}`}
          onClick={() => this.props.setActiveDay(date)}
        >
          <div
            className={`ui segment ${
              date === this.props.activeDay ? "inverted" : null
            }`}
          >
            <div
              className={`ui statistic ${
                date === this.props.activeDay ? "blue" : null
              }`}
            >
              <div className="label">{moment(date).format("ddd")}</div>
              <div className="value">{moment(date).format("M/D")}</div>
              <div className="label">{countedDates[date]} Games</div>
            </div>
          </div>
        </Link>
      );
    });
  }

  renderGameGrid() {
    let dayGames = this.props.week.weekGames.filter(game => {
      return game.gdte === this.props.activeDay;
    });

    return dayGames.map(game => {
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
                  <span className="date">
                    {" "}
                    {moment(game.etm).format("h:mm A")} EST{" "}
                  </span>
                </div>
              </div>
              <div className="extra content">
                <div>
                  <i className="users icon" />
                  More data here
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    if (!this.props.week.weekArray) {
      return <div> Loading ... </div>;
    } else {
      return (
        <div>
          Week {this.props.week.week}
          <div className="ui grid">
            <div className={`seven column row`}>{this.renderWeekGrid()}</div>
          </div>
          <div className="ui four column grid">{this.renderGameGrid()}</div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
    week: state.week,
    weekGames: state.week.weekGames,
    activeDay: state.activeDay
  };
};

export default connect(
  mapStateToProps,
  { fetchWeek, setActiveDay }
)(Schedule);
