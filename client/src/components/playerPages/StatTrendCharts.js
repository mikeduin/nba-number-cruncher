import React from 'react';
import moment from 'moment';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryLabel, VictoryTooltip, VictoryCursorContainer, VictoryLegend } from 'victory';

const StatTrendCharts = ({ player }) => {
  return (
    <VictoryChart
      theme={VictoryTheme.clean}
    >
      <VictoryLine />
    </VictoryChart>
  );
}

export default StatTrendCharts