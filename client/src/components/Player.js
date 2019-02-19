import React from 'react';
import { connect } from 'react-redux';
import { fetchPlayerData } from '../actions';

class Player extends React.Component {
  componentDidMount () {
    this.props.fetchPlayerData(this.props.match.params.pid);
  }

  render () {
    if (!this.props.playerData.mappedData) {
      return <div> Loading . . . </div>
    } else {
      return (
        <div> {this.props.playerData.mappedData.player_name} </div>
      )
    }
  }

}

const mapStateToProps = state => {
  return {
    playerData: state.playerData,
  }
}

export default connect (mapStateToProps, {fetchPlayerData}) (Player);
