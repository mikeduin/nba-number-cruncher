import React from 'react';
import {
  VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryLabel, VictoryTheme, VictoryLine, VictoryTooltip
} from 'victory';

class QuarterChart extends React.Component {

  render () {
    // let labelMath = datum._y > 0 ? -(homeFull[0].y)*2.5 : (homeFull[0].y)*2.5;

    let homeFull = [
      {x: 1, y: this.props.homeData.netRatings['1q_full']},
      {x: 2, y: this.props.homeData.netRatings['2q_full']},
      {x: 3, y: this.props.homeData.netRatings['3q_full']},
      {x: 4, y: this.props.homeData.netRatings['4q_full']},
    ];

    let homel5 = [
      {x: 1, y: this.props.homeData.netRatings['1q_l5']},
      {x: 2, y: this.props.homeData.netRatings['2q_l5']},
      {x: 3, y: this.props.homeData.netRatings['3q_l5']},
      {x: 4, y: this.props.homeData.netRatings['4q_l5']},
    ];

    let homel10 = [
      {x: 1, y: this.props.homeData.netRatings['1q_l10']},
      {x: 2, y: this.props.homeData.netRatings['2q_l10']},
      {x: 3, y: this.props.homeData.netRatings['3q_l10']},
      {x: 4, y: this.props.homeData.netRatings['4q_l10']},
    ];

    let homel15 = [
      {x: 1, y: this.props.homeData.netRatings['1q_l15']},
      {x: 2, y: this.props.homeData.netRatings['2q_l15']},
      {x: 3, y: this.props.homeData.netRatings['3q_l15']},
      {x: 4, y: this.props.homeData.netRatings['4q_l15']},
    ];

    let visFull = [
      {x: 1, y: this.props.visData.netRatings['1q_full']},
      {x: 2, y: this.props.visData.netRatings['2q_full']},
      {x: 3, y: this.props.visData.netRatings['3q_full']},
      {x: 4, y: this.props.visData.netRatings['4q_full']},
    ];

    let visl5 = [
      {x: 1, y: this.props.visData.netRatings['1q_l5']},
      {x: 2, y: this.props.visData.netRatings['2q_l5']},
      {x: 3, y: this.props.visData.netRatings['3q_l5']},
      {x: 4, y: this.props.visData.netRatings['4q_l5']},
    ];

    let visl10 = [
      {x: 1, y: this.props.visData.netRatings['1q_l10']},
      {x: 2, y: this.props.visData.netRatings['2q_l10']},
      {x: 3, y: this.props.visData.netRatings['3q_l10']},
      {x: 4, y: this.props.visData.netRatings['4q_l10']},
    ];

    let visl15 = [
      {x: 1, y: this.props.visData.netRatings['1q_l15']},
      {x: 2, y: this.props.visData.netRatings['2q_l15']},
      {x: 3, y: this.props.visData.netRatings['3q_l15']},
      {x: 4, y: this.props.visData.netRatings['4q_l15']},
    ];

    return (
      <div>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{y: 30}}
        >
          <VictoryAxis crossAxis
            domain={[-20, 20]}
            orientation={'top'}

          />
          <VictoryAxis
            dependentAxis
            categories={{
              x: ["1Q", "2Q", "3Q", "4Q"]
            }}
            tickValues={[1, 2, 3, 4]}
            tickFormat={[null]}
            invertAxis={true}
            style={{
              axis: {
                stroke: 'white',
                strokeLinecap: null
              }
            }}
          />

          <VictoryLine
            style={{
              data: {stroke: "#91A4AD", strokeWidth: 2},
              labels: {angle: 0, fill: "#91A4AD", fontSize: 15}
            }}
            labelComponent={<VictoryLabel y={95} x={275}/>}
            labels={["Q1"]}
            y={() => 1.5}
          >
          </VictoryLine>

          <VictoryLine
            style={{
              data: {stroke: "#91A4AD", strokeWidth: 2},
              labels: {angle: 0, fill: "#91A4AD", fontSize: 15}
            }}
            labelComponent={<VictoryLabel y={150} x={275}/>}
            labels={["Q2"]}
            y={() => 2.5}
          >
          </VictoryLine>

          <VictoryLine
            style={{
              data: {stroke: "#91A4AD", strokeWidth: 2},
              labels: {angle: 0, fill: "#91A4AD", fontSize: 15}
            }}
            labelComponent={<VictoryLabel y={205} x={275}/>}
            labels={["Q3"]}
            y={() => 3.5}
          >
          </VictoryLine>

          <VictoryLine
            style={{
              data: {stroke: "#91A4AD", strokeWidth: 2},
              labels: {angle: 0, fill: "#91A4AD", fontSize: 15}
            }}
            labelComponent={<VictoryLabel y={260} x={275}/>}
            labels={["Q4"]}
            y={() => 4.5}
          >
          </VictoryLine>

          <VictoryGroup horizontal offset={6}>
            <VictoryBar
              data={homeFull}
              barWidth={8}
              style={{ data: { fill: this.props.homeData.info.color}}}
              labels={(d) => d.y}
              labelComponent={
                <VictoryLabel
                  dx={-(homeFull[0].y)*2.5}
                  verticalAnchor={'middle'}
                  style={{
                    fill: '#91A4AD',
                    fontSize: 10
                  }}
                />
              }
            />

            <VictoryBar
              data={homel5}
              barWidth={4}
              style={{ data: { fill: this.props.homeData.info.color}}}
              labelComponent={<VictoryLabel dx={0} verticalAnchor={'middle'}/>}
            />

            <VictoryBar
              data={homel10}
              barWidth={4}
              style={{ data: { fill: this.props.homeData.info.color}}}
              labelComponent={<VictoryLabel dx={0} verticalAnchor={'middle'}/>}
            />

            <VictoryBar
              data={homel15}
              barWidth={4}
              style={{ data: { fill: this.props.homeData.info.color}}}
              labelComponent={<VictoryLabel dx={0} verticalAnchor={'middle'}/>}
            />

            <VictoryBar
              data={visFull}
              barWidth={8}
              style={{ data: { fill: this.props.visData.info.color}}}
              labels={(d) => d.y}
            />

            <VictoryBar
              data={visl5}
              barWidth={4}
              style={{ data: { fill: this.props.visData.info.color}}}
            />

            <VictoryBar
              data={visl10}
              barWidth={4}
              style={{ data: { fill: this.props.visData.info.color}}}
            />

            <VictoryBar
              data={visl15}
              barWidth={4}
              style={{ data: { fill: this.props.visData.info.color}}}
            />

          </VictoryGroup>

        </VictoryChart>
      </div>
    )
  }
}

export default QuarterChart;
