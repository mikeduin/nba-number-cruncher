import React, { useState } from 'react';
import moment from 'moment';
import { Button, Segment } from 'semantic-ui-react';
import { marketMappers } from '../PlayerProps';
import { sumQuarterStats } from '../../utils';
import { VictoryChart, VictoryBar, VictoryLine, VictoryStack, VictoryTheme, VictoryAxis, VictoryLabel, VictoryTooltip, VictoryCursorContainer, VictoryLegend } from 'victory';

const domains = {
  'pts': { y: [0, 40] }
}

const StatTrendCharts = ({ gameData, market, setActivePropMarket, livePropLine, liveStat }) => {
  const [chartMarket, setChartMarket] = useState(market);
  const [activePeriod, setActivePeriod] = useState(4); // 4 = TOTAL STATS

  const chartData = () => {
    if (activePeriod !== 4) {
      return {
        data: gameData.map(game => ({
          x: moment(game.gdte).format("MM/DD"),
          y: game.periods[activePeriod][market]
        }))
      }
    } else {
      const firstHalfData = [];
      const secondHalfData = [];
      const labels = [];
      gameData.forEach(game => {
        const firstHalfStats = sumQuarterStats(game.periods.slice(0, 2));
        const secondHalfStats = sumQuarterStats(game.periods.slice(2, 4));
        firstHalfData.push({
          x: moment(game.gdte).format("MM/DD"),
          y: firstHalfStats[market]
        })
        secondHalfData.push({
          x: moment(game.gdte).format("MM/DD"),
          y: secondHalfStats[market]
        })
        labels.push({
          x: moment(game.gdte).format("MM/DD"),
          y: 0,
          label: firstHalfStats[market] + secondHalfStats[market]
        })
      })
      return {
        data: [firstHalfData, secondHalfData],
        labels
      };
    }
  }

  // console.log('chartData', chartData());
  const livePropLineData = () => {
    if (activePeriod !== 4) {
      return chartData().data.map(d => ({x: d.x, y: livePropLine}))
    } else {
      return chartData().data[0].map(d => ({x: d.x, y: livePropLine}))
    }
  }


  const styles = [
    { data: { fill: "#f3d437", stroke: "#d1b322", strokeWidth: 1 } },
    { data: { fill: "#0ca340", stroke: "#0ca340", strokeWidth: 1 } },
  ];

  return (
    <>
      <div 
        style={{display: 'flex', justifyContent: 'end'}}
      >
        <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>MARKET:</i></div>
          {Object.values(marketMappers).map(market => 
            <Button 
              color='black'
              onClick={() => {
                setChartMarket(market);
                setActivePropMarket(market);
              }}
              basic={market !== chartMarket}
              key={market}
            >
              {market.toUpperCase()}
            </Button>
          )}
        </div>
      </div>

      <VictoryChart
          theme={VictoryTheme.clean}
          domain={domains[chartMarket]}
          domainPadding={{ x: 15 }}
        >
          <VictoryAxis 
            crossAxis 
            style={{
              tickLabels: { fontSize: 8, padding: 4 },
            }}
          />
          <VictoryAxis dependentAxis />
          <VictoryAxis
            dependentAxis
            orientation="right"
            tickValues={[livePropLine, liveStat]}
            tickFormat={(tick) => {
              if (tick === livePropLine) {
                return `${tick} PROP`
              }
              if (tick === liveStat) {
                return `${tick} LIVE`
              }
            }}
            style={{
              tickLabels: { fontSize: 8, padding: 4 },
              grid: {
                stroke: ({ tick }) =>
                  tick === livePropLine
                    ? "#2d7ff9"
                    : "#CFD8DC",
                strokeDasharray: "10, 5",
              },
            }}
            // tickFormat={tickFormat(
            //   tempRange,
            // )}
            // style={{
            //   axis: {
            //     stroke: tempAxisColor,
            //   },
            //   ticks: {
            //     stroke: tempAxisColor,
            //   },
            //   tickLabels: {
            //     fill: tempAxisColor,
            //   },
            // }}
          />
          {/* <VictoryAxis
            dependentAxis
              style={{
                grid: {
                  stroke: ({ tick }) =>
                    tick === 5
                      ? "#2d7ff9"
                      : "#CFD8DC",
                  strokeDasharray: "10, 5",
                },
              }}
            /> */}
          {activePeriod === 4 
            ? <VictoryStack>
                {chartData().data.map((d, i) => (
                  <VictoryBar
                    key={i}
                    style={{ 
                      labels: { fill: "white" },
                      ...styles[i]
                    }}
                    data={d}
                    labels={({ datum }) => datum.y}
                    labelComponent={<VictoryLabel dy={20} />}
                  />
                ))}
                <VictoryBar barRatio={0.25} data={chartData().labels} />
              </VictoryStack>
            : 
              <VictoryBar 
                data={chartData.data()}
                labels={({ datum }) => datum.y}
              />
            }
          {/* <VictoryLine
            data={livePropLineData()}
            style={{
              data: {
                stroke: "#CFD8DC",
                strokeDasharray: "10, 5",
              }
            }}
            // labelComponent={
            //   <VictoryLabel
            //     dx={20}
            //     textAnchor="start"
            //     verticalAnchor="middle"
            //   />
            // }
          /> */}
      </VictoryChart>
      
    </>
  );
}

export default StatTrendCharts