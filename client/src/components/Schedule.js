import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import momentTz from 'moment-timezone';
import ScheduleCard from './ScheduleCard';
import './styles/schedule.css';
import { Segment, Statistic, Grid, Icon } from "semantic-ui-react";

import { connect } from "react-redux";
import { fetchWeek, setActiveDay, changeSchedWeek } from "../actions";

class Schedule extends React.Component {
  componentDidMount() {
    if (!this.props.match.params.date) {
      console.log('setting active day to today');
      this.props.setActiveDay(momentTz.tz('America/Los_Angeles').format('YYYY-MM-DD'));
    } else {
      console.log('setting active day to match params', this.props.match.params.date);
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
          <Segment
            className={`${
              date === this.props.activeDay ? "inverted" : null
            }`}
          >
            <Statistic
              style={{marginLeft: -5}}
              className={`${
                date === this.props.activeDay ? "inverted" : null
              }`}
            >
              <Statistic.Label>{moment(date).format("ddd")}</Statistic.Label>
              <div className="schedGameDate">{moment(date).format("M/D")}</div>
              <Statistic.Label>{countedDates[date]>0 ? countedDates[date] : 'NO'} Games</Statistic.Label>
            </Statistic>
          </Segment>
        </Link>
      );
    });
  }

  renderGameGrid() {
    return this.props.dayGames.map(game => {
      return (
        <Grid.Column key={game.gid}>
          <ScheduleCard game={game} />
        </Grid.Column>
      );
    });
  }

  render() {
    if (!this.props.week.weekArray) {
      return <div> Loading ... </div>;
    } else {
      return (
        <div style={{marginBottom: 100}}>
          <div style={{display: 'inline-flex'}}>
            <Icon className="column" name='angle left' size='massive'
              onClick={() => this.props.changeSchedWeek(this.props.week, "dec")}
            />
            <div className="ui grid">
              <div className={`seven column row weeklyRow`}>
                {this.renderWeekGrid()}
              </div>
            </div>
            <Icon className="column" name='angle right' size='massive'
              onClick={() => this.props.changeSchedWeek(this.props.week, "inc")}
            />
          </div>

          <div className="dayHeader"> - GAMES OF {moment(this.props.activeDay).format('dddd, MMMM Do').toUpperCase()} - </div>

          <Grid columns={4}>{this.renderGameGrid()}</Grid>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
    week: state.week,
    weekGames: state.week.weekGames,
    activeDay: state.activeDay,
    dayGames: state.schedDayGames
  };
};

export default connect(
  mapStateToProps,
  { fetchWeek, setActiveDay, changeSchedWeek }
)(Schedule);
