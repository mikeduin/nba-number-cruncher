import React from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryLabel } from 'victory';

class QuarterChart extends React.Component {

  render () {
    let homeFull = [
      {x: 1, y: this.props.homeData.netRatings['1q_full']},
      {x: 2, y: this.props.homeData.netRatings['2q_full']},
      {x: 3, y: this.props.homeData.netRatings['3q_full']},
      {x: 4, y: this.props.homeData.netRatings['4q_full']},
    ];

    let visFull = [
      {x: 1, y: this.props.visData.netRatings['1q_full']},
      {x: 2, y: this.props.visData.netRatings['2q_full']},
      {x: 3, y: this.props.visData.netRatings['3q_full']},
      {x: 4, y: this.props.visData.netRatings['4q_full']},
    ];

    return (
      <div>
        <VictoryChart>
          <VictoryAxis crossAxis
            domain={[-20, 20]}
            orientation={'top'}
          />
          <VictoryAxis
            dependentAxis
            invertAxis={true}
            style={{
              axis: {
                strokeWidth: 80,
                stroke: 'white',
                strokeLinecap: null
              },
              tickLabels: {
                padding: -20
              }
            }}
          />
          <VictoryGroup horizontal offset={20}>
            <VictoryBar
              categories={{
                x: ["1Q", "2Q", "3Q", "4Q"]
              }}
              data={homeFull}
              labels={(d) => d.y}
              labelComponent={<VictoryLabel dx={0} verticalAnchor={'middle'}/>}
            />
            <VictoryBar data={visFull} />
          </VictoryGroup>
        </VictoryChart>
      </div>
    )
  }
}

export default QuarterChart;
