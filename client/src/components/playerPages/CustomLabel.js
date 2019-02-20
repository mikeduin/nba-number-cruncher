import React from 'react';
import { VictoryLabel, VictoryTooltip } from 'victory';

class CustomLabel extends React.Component {

  render () {
    console.log(this.props);
    return (
      <g>
        <VictoryLabel {...this.props} />
        <VictoryTooltip
          {...this.props}
          x={200} y={250}
          text={`#1`}
          orientation="top"
          pointerLength={0}
          cornerRadius={50}
          width={100}
          height={100}
          flyoutStyle={{ fill: "black" }}
        />
      </g>
    )
  }
}

export default CustomLabel;
