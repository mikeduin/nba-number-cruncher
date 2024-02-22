import React from 'react';
import { Button, Header, Image, Segment, Tab, Table, TabPane, Grid } from 'semantic-ui-react';

const renderStatCells = (periods) => {
  return periods.map((period, i) => {
    return (
      <>
        <Table.Cell key={i}>
          {period.min}
        </Table.Cell>
        <Table.Cell>
          {period.fgm}-{period.fga}
        </Table.Cell>
        <Table.Cell>
          {period.fg3m}-{period.fg3a}
        </Table.Cell>
        <Table.Cell>
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
        </Table.Cell>
        <Table.Cell>
          {period.fouls}
        </Table.Cell> */}
        <Table.Cell>
          {period.pts}
        </Table.Cell>
      </>
    )
  })
}

const BoxScoresByQuarter = ({ boxScores, team }) => {
  const [half, setHalf] = React.useState(2);
  return (
    <>
    <Segment 
      attached='top'
      textAlign='center'
    >
      <Button   
        color='black'
        basic={half !== 1}
        size='large' 
        onClick={() => setHalf(1)}
      >1ST HALF</Button>
      <Button   
        color='black'
        basic={half !== 2}
        size='large' 
        onClick={() => setHalf(2)}
      >2ND HALF</Button>
    </Segment>
      <Table
        attached='bottom' 
        compact 
        celled
        style={{marginBottom: 20}}
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowspan="2"> Date </Table.HeaderCell>
            <Table.HeaderCell rowspan="2"> Game </Table.HeaderCell>
            <Table.HeaderCell colspan="9" textAlign='center'> {half === 1 ? '1ST' : '3RD'} QUARTER </Table.HeaderCell>
            <Table.HeaderCell colspan="9" textAlign='center'> {half === 1 ? '2ND' : '4TH'} QUARTER </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell> Min </Table.HeaderCell>
            <Table.HeaderCell> FG </Table.HeaderCell>
            <Table.HeaderCell> 3PT </Table.HeaderCell>
            <Table.HeaderCell> FT </Table.HeaderCell>
            <Table.HeaderCell> REB </Table.HeaderCell>
            <Table.HeaderCell> AST </Table.HeaderCell>
            <Table.HeaderCell> STL </Table.HeaderCell>
            <Table.HeaderCell> BLK </Table.HeaderCell>
            {/* <Table.HeaderCell> TOV </Table.HeaderCell>
            <Table.HeaderCell> PF </Table.HeaderCell> */}
            <Table.HeaderCell> PTS </Table.HeaderCell>
            <Table.HeaderCell> Min </Table.HeaderCell>
            <Table.HeaderCell> FG </Table.HeaderCell>
            <Table.HeaderCell> 3PT </Table.HeaderCell>
            <Table.HeaderCell> FT </Table.HeaderCell>
            <Table.HeaderCell> REB </Table.HeaderCell>
            <Table.HeaderCell> AST </Table.HeaderCell>
            <Table.HeaderCell> STL </Table.HeaderCell>
            <Table.HeaderCell> BLK </Table.HeaderCell>
            {/* <Table.HeaderCell> TOV </Table.HeaderCell>
            <Table.HeaderCell> PF </Table.HeaderCell> */}
            <Table.HeaderCell> PTS </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {boxScores.map((boxScore, i) => {
            const [aTeamAbb, , , hTeamAbb] = boxScore.summary.split(' ');
            return (
              <Table.Row key={i}>
                <Table.Cell>
                  {boxScore.gdte}
                </Table.Cell>
                <Table.Cell>
                  <a href={`https://www.nba.com/game/${aTeamAbb}-vs-${hTeamAbb}-00${boxScore.gid}/box-score`} target="_blank"> {boxScore.summary} </a>
                </Table.Cell>
                {renderStatCells(boxScore.periods.slice(half === 2 ? 2 : 0, half * 2))}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </>
  )
}

export default BoxScoresByQuarter;