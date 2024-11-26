import React from 'react';
import moment from 'moment';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryLabel, VictoryTooltip, VictoryCursorContainer, VictoryLegend } from 'victory';
import _ from 'lodash';
import { gameSecsToClockAndQuarter } from '../../modules/gameTimeFuncs';

const gameStintRenderer = (player) => {
  return player.gameStints.map(game => {
    let combData = [];
    game.game_stints.forEach(stint => {
      combData.push(
        [
          {x: stint[0], y: game.gdte, in: stint[0], out: stint[1]},
          {x: stint[1], y: game.gdte, in: stint[0], out: stint[1]},
          {x: stint[1], y: null}
        ]
      )
    })

    let data = _.flattenDeep(combData);

    return (
      <VictoryLine
        key={game.gid}
        data={data}

        style={{
          data: {
            stroke: player.mappedData.color,
            strokeWidth: 3.5
          }
        }}
      />
    )
  })
}

const GameStints = ({ player }) => {
  return (
    <VictoryChart
      theme={VictoryTheme.material}
      // height={"auto"} // doesn't work
      padding={{
        right: 15,
        top: 15,
        left: 50,
        bottom: 30
      }}
      domainPadding={{y: 2}}
      sortOrder="ascending"
      containerComponent={
        <VictoryCursorContainer
          title='Title here'
          cursorLabelOffset={{x: -50, y: -10}}
          cursorLabel={
            (d) => {
              return `${gameSecsToClockAndQuarter(d.datum.x)}`
            }
          }
        />
      }
    >
      {gameStintRenderer(player)}
      <VictoryAxis
        dependentAxis
        invertAxis={true}
        tickFormat={
          (x) => {
            let game = player.gameStints.filter(game => game.gdte === x);

            return (
              `${moment(x).format('M/DD')}, ${game[0].v[0].ta} ${game[0].v[0].s} @ ${game[0].h[0].ta} ${game[0].h[0].s}`
            )
          }
        }
        style={{
          tickLabels: {
            fontSize: 5,
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
  )
}

export default GameStints;