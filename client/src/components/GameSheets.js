import React from 'react';

import { connect } from 'react-redux';
import { fetchWeek } from '../actions';

class GameSheets extends React.Component {
  componentDidMount () {
    this.props.fetchWeek();
  }

  render () {
    return (
      <div> Master Game Sheets Page
        <div className="ui grid">
          <div className="seven column row">
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
    )
  }
};

const mapStateToProps = state => {
  return {week: state.week };
}

export default connect(mapStateToProps, {fetchWeek}) (GameSheets);
