import React from 'react';
import { Button, Header, Image, Segment, Tab, Table, TabPane, Grid } from 'semantic-ui-react';
import { gameTimeToMinutes, minutesToGameTime, sumQuarterStats } from '../../utils';

const renderStatCells = (periods) => {
  return periods.map((period, i) => {
    return (
      <React.Fragment key={i}>
        <Table.Cell key={i}>
          {period.min}
        </Table.Cell>
        <Table.Cell style={{whiteSpace: 'nowrap'}}>
          {period.fgm}-{period.fga}
        </Table.Cell>
        <Table.Cell style={{whiteSpace: 'nowrap'}}>
          {period.fg3m}-{period.fg3a}
        </Table.Cell>
        <Table.Cell style={{whiteSpace: 'nowrap'}}>
          {period.ftm}-{period.fta}
        </Table.Cell>
        <Table.Cell>
          {period.reb}
        </Table.Cell>
        <Table.Cell>
          {period.ast}
        </Table.Cell>
        <Table.Cell>
          {period.stl}
        </Table.Cell>
        <Table.Cell>
          {period.blk}
        </Table.Cell>
        {/* <Table.Cell>
          {period.tov}
        </Table.Cell> */}
        <Table.Cell>
          {period.fouls}
        </Table.Cell>
        <Table.Cell>
          {period.pts}
        </Table.Cell>
      </React.Fragment>
    )
  })
}

const renderHeaders = () => <>
    <Table.HeaderCell> Min </Table.HeaderCell>
    <Table.HeaderCell> FG </Table.HeaderCell>
    <Table.HeaderCell> 3PT </Table.HeaderCell>
    <Table.HeaderCell> FT </Table.HeaderCell>
    <Table.HeaderCell> REB </Table.HeaderCell>
    <Table.HeaderCell> AST </Table.HeaderCell>
    <Table.HeaderCell> STL </Table.HeaderCell>
    <Table.HeaderCell> BLK </Table.HeaderCell>
    {/* <Table.HeaderCell> TOV </Table.HeaderCell> */}
    <Table.HeaderCell> PF </Table.HeaderCell>
    <Table.HeaderCell> PTS </Table.HeaderCell>
</>

const transformMinutesToGametime = (halfStats) => {
  const { min, ...rest } = halfStats;
  return {
    min: minutesToGameTime(halfStats.min),
    ...rest
  }
}

const BoxScoresByQuarter = ({ boxScores, team }) => {
  const [half, setHalf] = React.useState(0);
  
  return (
    <>
    <Segment 
      attached='top'
      textAlign='center'
    >
      <Button   
        color='black'
        basic={half !== 0}
        size='large' 
        onClick={() => setHalf(0)}
      >FULL GAME (by H)</Button>
      <Button   
        color='black'
        basic={half !== 1}
        size='large' 
        onClick={() => setHalf(1)}
      >1ST HALF (by Q)</Button>
      <Button   
        color='black'
        basic={half !== 2}
        size='large' 
        onClick={() => setHalf(2)}
      >2ND HALF (by Q)</Button>
    </Segment>
      <Table
        attached='bottom' 
        compact 
        celled
        style={{marginBottom: 20}}
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan="2"> Date </Table.HeaderCell>
            <Table.HeaderCell rowSpan="2"> Game </Table.HeaderCell>
            <Table.HeaderCell colSpan="10" textAlign='center'> 
              {half === 0 
                ? '1ST HALF' 
                : half === 1 
                ? '1ST QUARTER'
                : '3RD QUARTER'
              } 
            </Table.HeaderCell>
            <Table.HeaderCell colSpan="10" textAlign='center'>
            {half === 0 
                ? '2ND HALF' 
                : half === 1 
                ? '2ND QUARTER'
                : '4TH QUARTER'
              } 
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            {renderHeaders()}
            {renderHeaders()}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {boxScores.map((boxScore, i) => {
            const [aTeamAbb, , , hTeamAbb] = boxScore.summary.split(' ');
            const firstHalfStats = sumQuarterStats(boxScore.periods.slice(0, 2));
            const secondHalfStats = sumQuarterStats(boxScore.periods.slice(2, 4));
            const statsByHalf = [
              transformMinutesToGametime(firstHalfStats), 
              transformMinutesToGametime(secondHalfStats)];
            let effectivePeriods = statsByHalf;
            if (half === 1) {
              effectivePeriods = boxScore.periods.slice(0, 2);
            }
            if (half === 2) {
              effectivePeriods = boxScore.periods.slice(2, 4);
            }
            return (
              <Table.Row key={`${boxScore.gid}-${half}-${i}`}>
                <Table.Cell>
                  {boxScore.gdte}
                </Table.Cell>
                <Table.Cell>
                  <a href={`https://www.nba.com/game/${aTeamAbb}-vs-${hTeamAbb}-00${boxScore.gid}/box-score`} target="_blank"> {boxScore.summary} </a>
                </Table.Cell>
                {renderStatCells(effectivePeriods)}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </>
  )
}

export default BoxScoresByQuarter;