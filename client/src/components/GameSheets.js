import React from 'react';

import { connect } from 'react-redux';
import { fetchGmWk } from '../actions';

class GameSheets extends React.Component {
  componentDidMount () {
    this.props.fetchGmWk();
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
  return {gmWk: state.gmWk };
}

export default connect(mapStateToProps, {fetchGmWk}) (GameSheets);
