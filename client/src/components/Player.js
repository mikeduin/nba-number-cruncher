import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { fetchPlayerData } from '../actions';

import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryLabel } from 'victory';

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
            {x: stint[1], y: null}
          ]
        )
      })

      let data = _.flattenDeep(combData);
      console.log('data is ', data)

      return (
        <VictoryLine
          data={data}
          style={{
            data: {
              stroke: "red",
              strokeWidth: 3.5
            }
          }}
        />
      )
    })
  }

  render () {
    if (!this.props.playerData.mappedData) {
      return <div> Loading . . . </div>
    } else {
      return (
        <div>
        <div> {this.props.playerData.mappedData.player_name} </div>
        <VictoryChart
          theme={VictoryTheme.material}
          sortOrder="ascending"
          >
          {this.gameStintRenderer()}
          <VictoryAxis
            dependentAxis
            invertAxis={true}
            style={{
              tickLabels: {
                fontSize: 3,
                padding: 3
              }
            }}
          />
          <VictoryAxis crossAxis
            tickValues={[720, 1440, 2160, 2880]}
            tickFormat={["2Q", "3Q", "4Q", "OT"]}
            style={{
              tickLabels: {
                fontSize: 5,
                padding: 2
              }
            }}
          />
        </VictoryChart>
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
