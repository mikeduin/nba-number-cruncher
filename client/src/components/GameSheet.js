import React from 'react';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
  }

  render () {
    return (
      <div> Game Sheet </div>
    )
  }

}

const mapStateToProps = state => {
  return {
    game: state.game
  }
}

export default connect(mapStateToProps, {fetchGame}) (GameSheet);
