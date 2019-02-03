import React from "react";
// import moment from "moment";

import { connect } from "react-redux";
import { fetchWeek } from "../actions";

class GameSheets extends React.Component {
  componentDidMount() {
    this.props.fetchWeek();
  }

  // findLength () {
  //   // return this.props.week.weekArray.length;
  //
  // }

  // renderWeekGrid () {
  //   // return this.props.week.weekArray.map(date => {
  //   //
  //   // })
  //   // return this.props.week.
  // }

  render() {
    if (!this.props.week.weekArray) {
      return <div> Loading ... </div>
    } else {
      return (
        <div>
          Week {this.props.week.week}
          <div className="ui grid">
            <div className={`${this.props.week.weekArray.length} column row`}>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
              <div className="column">
                <div className="ui segment"> a </div>
              </div>
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
