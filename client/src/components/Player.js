import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { fetchPlayerData } from '../actions';

import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';

class Player extends React.Component {
  componentDidMount () {
    this.props.fetchPlayerData(this.props.match.params.pid);
  }

  gameStintRenderer = () => {
    let gameStints = this.props.playerData.gameStints;
    return gameStints.map(game => {
      let combData = [];
      game.game_stints.forEach(stint => {
        combData.push(
          [
            {x: stint[0], y: game.gdte},
            {x: stint[1], y: game.gdte},
            {x: stint[1]+0.1, y: null}
          ]
        )
      })

      let data = _.flattenDeep(combData);
      console.log(data);



      // return (
      //   <VictoryLine
      //     data={[
      //       { x: 1, y: val*2 },
      //       { x: 10, y: val*2 },
      //       { x: 10.1, y: null},
      //       { x: 20, y: val*2},
      //       { x: 28, y: val*2}
      //     ]}
      //     style={{
      //       data: {
      //         stroke: "red",
      //         strokeWidth: 8
      //       }
      //     }}
      //   />
      // )
    })
  }

  render () {
    if (!this.props.playerData.mappedData) {
      return <div> Loading . . . </div>
    } else {
      this.gameStintRenderer();
      return (
        <div>
        <div> {this.props.playerData.mappedData.player_name} </div>

        </div>
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
