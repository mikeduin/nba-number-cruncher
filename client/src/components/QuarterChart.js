import React from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup } from 'victory';

class QuarterChart extends React.Component {

  render () {
    let homeFull = [
      {x: 1, y: this.props.homeData['1q_full']},
      {x: 2, y: this.props.homeData['2q_full']},
      {x: 3, y: this.props.homeData['3q_full']},
      {x: 4, y: this.props.homeData['4q_full']},
    ];

    let visFull = [
      {x: 1, y: this.props.visData['1q_full']},
      {x: 2, y: this.props.visData['2q_full']},
      {x: 3, y: this.props.visData['3q_full']},
      {x: 4, y: this.props.visData['4q_full']},
    ];

    return (
      <div>
        <VictoryChart>
          <VictoryAxis crossAxis
            domain={[-20, 20]}
            orientation={'top'}
          />
          <VictoryAxis dependentAxis
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
            />
            <VictoryBar data={visFull} />
          </VictoryGroup>
        </VictoryChart>
      </div>
    )
  }
}

export default QuarterChart;
