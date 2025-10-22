import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Segment } from 'semantic-ui-react';
import { marketMappers } from '../PlayerProps';
import { findKeyByValue, gameTimeToMinutes, maxArrayValue, renderInactives, sumQuarterStats, transformSummaryScore } from '../../utils';
import { 
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryCursorContainer, 
  VictoryGroup,
  VictoryTheme,
  VictoryLabel, 
  VictoryLine,
  VictoryScatter, 
  VictoryStack,
  VictoryTooltip,
  VictoryLegend,
} from 'victory';

const domainMax = {
  'pts': 20,
  'reb': 10,
  'ast': 10,
  'stl': 5,
  'blk': 5,
  'tov': 8,
  'fg3m': 8,
  'pts+reb+ast': 40,
  'pts+reb': 30,
  'pts+ast': 30,
  'reb+ast': 20,
}

const StatTrendCharts = ({ gameData, market, setActivePropMarket, livePropLine, liveStat, teamId }) => {
  const [chartMarket, setChartMarket] = useState(market);
  const [activePeriod, setActivePeriod] = useState(4); // 4 = TOTAL STATS

  console.log('gameData ', gameData);

  const chartData = useMemo(() => { // this is still not preventing component from rerendering
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
      const fullGameData = [];
      const minutesData = [];
      const labels = [];
      gameData.forEach(game => {
        const firstHalfStats = sumQuarterStats(game.periods.slice(0, 2));
        const secondHalfStats = sumQuarterStats(game.periods.slice(2, 4));
        const fullGameStats = game.periods[4];
        const fullGameMinutes = Math.round(gameTimeToMinutes(fullGameStats.min));
        const xAxis = { x: `${moment(game.gdte).format("MM/DD")}\n${transformSummaryScore(game.summary)}\n${renderInactives(game.periods[4].inactives, teamId)}` };

        minutesData.push({
          ...xAxis,
          y: fullGameMinutes
        })
        firstHalfData.push({
          ...xAxis,
          y: firstHalfStats[market]
        })
        secondHalfData.push({
          ...xAxis,
          y: secondHalfStats[market]
        })
        fullGameData.push({
          ...xAxis,
          y: fullGameStats[market]
        })
        labels.push({
          ...xAxis,
          y: 0,
          label: firstHalfStats[market] + secondHalfStats[market]
        })
      })
      return {
        stat: [firstHalfData, secondHalfData],
        fullGameStat: fullGameData,
        minutes: minutesData,
        labels
      };
    }
  }, [gameData, market, activePeriod, livePropLine, liveStat]);

  const styles = [
    { data: { fill: "#f3d437", stroke: "#d1b322", strokeWidth: 1 } },
    { data: { fill: "#979ee2", stroke: "#bec7ed", strokeWidth: 1 } },
  ];

  const maxMarketStat = maxArrayValue(chartData.fullGameStat.map(d => d.y));
  const derivedMax = maxMarketStat > domainMax[market] ? maxMarketStat : domainMax[market];
  const marketDomain = { y: [0, derivedMax] }

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
                setActivePropMarket({market, sort: false});
              }}
              basic={market !== chartMarket}
              key={market}
            >
              {market.toUpperCase()}
            </Button>
          )}
        </div>
      </div>
      <svg viewBox="0 0 450 350">
        <VictoryLegend
          standalone={false}
          x={360}
          y={5}
          orientation="horizontal"
          style={{
            border: { stroke: "grey" },
            labels: { fontSize: 8 }
          }}
          data={[
            {
              name: "1H",
              symbol: { fill: styles[0].data.fill },
            },
            {
              name: "2H",
              symbol: { fill: styles[1].data.fill },
            },
          ]}
          theme={VictoryTheme.clean}
        />
        {activePeriod === 4 // full game, since 1st period is 0
        ?
          <g>
            {/* Date Axis */}
            <VictoryAxis 
              crossAxis
              domainPadding={{ x: 15 }}
              standalone={false} // required to render in <g> instead of <svg>
              tickValues={chartData.minutes.map(d => d.x)}
              style={{
                tickLabels: { fontSize: 8, padding: 0 }, // dates
              }}
              // tickFormat={(t) => `${moment(t).format("MM/DD")}\n`}
            />
            {/* Primary Stat/Market Axis */}
            <VictoryAxis 
              dependentAxis
              orientation="left"
              standalone={false} // required to render in <g> instead of <svg>
              domain={marketDomain}
              label={findKeyByValue(marketMappers, chartMarket)} 
              style={{
                tickLabels: { fontSize: 12, padding: 4 },
              }}
            />
            {/* Axis for Live Prop Line and Live Stat */}
            <VictoryAxis
              dependentAxis
              orientation="left"
              standalone={false} // required to render in <g> instead of <svg>
              domain={marketDomain}
              tickLabelComponent={<VictoryLabel dx={395} />} // dx attribute moves label to far right (for prop price / live stat labels)
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
            />
            {/* Minutes Axis */}
            <VictoryAxis 
              dependentAxis
              orientation="right"
              standalone={false} // required to render in <g> instead of <svg>
              domain={[0, 48]}
              label={"Minutes"}
              axisLabelComponent={
                <VictoryLabel 
                  style={{fill: "#2d7ff9" }}
                  dy={13}
                />
              }
              style={{
                tickLabels: { fontSize: 12, padding: 4, fill: "#2d7ff9" },
              }}
            />
            {/* Game Log Bar Charts */}
            <VictoryStack 
              domainPadding={{ x: 15 }}
              standalone={false}
            >
              {chartData.stat.map((d, i) => (
                <VictoryBar
                  theme={VictoryTheme.clean}
                  domain={marketDomain}
                  key={i}
                  style={{ 
                    labels: { fill: "white" },
                    ...styles[i]
                  }}
                  data={d}
                  labels={({ datum }) => datum.y > 0 ? datum.y : ''} // only show label in bar if value > 0
                  labelComponent={
                    <VictoryLabel 
                      dy={12} 
                      style={{fontSize: 12}}
                    />
                  }
                />
              ))}
              {/* Full Game Stat Labels */}
              <VictoryBar standalone={false}  barRatio={0.25} data={chartData.labels} />
            </VictoryStack>
            {/* Minutes Line Chart -- keep this on bottom to keep on top of the visibility stack*/}
            <VictoryLine 
              theme={VictoryTheme.clean}
              standalone={false}
              domain={{
                y: [0, 48]
              }}  
              domainPadding={{ x: 15 }}
              // labels={({ datum }) => datum.y} // diabling these in favor of tooltips
              interpolation="monotoneX" // smooths lines between data points
              data={chartData.minutes}
              style={{ data: { stroke: "#2d7ff9", strokeWidth: 2 } }}
            />
            {/* Minutes Scatter */}
            <VictoryScatter
              size={3}
              standalone={false}
              data={chartData.minutes}
              domain={{
                y: [0, 48]
              }} 
              domainPadding={{ x: 15 }}
              labels={({ datum }) => datum.y}
              labelComponent={
                <VictoryTooltip dy={-10} />
              }
              // symbol={symbols[i]}
              style={{
                data: {
                  fill: "#2d7ff9"
                },
              }}
            />
          </g>
        : 
        <g>
          <VictoryBar 
            data={chartData.data()}
            labels={({ datum }) => datum.y}
          />
        </g>
          
        }
      </svg>
    </>
  );
}

export default StatTrendCharts