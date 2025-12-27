import React from 'react';
import { Table } from 'semantic-ui-react';
import { headerMappers } from './Props.constants';

export const PropsTableHeader = ({ market, timeframeText, availableSportsbooks = [] }) => {
  const sportsbookCount = availableSportsbooks.length || 1;
  
  return <Table.Header>
  <Table.Row>
    <Table.HeaderCell rowSpan="2"> Player </Table.HeaderCell>
    <Table.HeaderCell colSpan={sportsbookCount} textAlign='center'> Prop Lines </Table.HeaderCell>
    <Table.HeaderCell colSpan={
      market === 'pts' ? 6 
      : market === 'ast' ? 4
      : 3
      } textAlign='center'> Live </Table.HeaderCell>
    <Table.HeaderCell colSpan="3" textAlign='center'> {timeframeText} </Table.HeaderCell>
    <Table.HeaderCell colSpan="2" textAlign='center' style={{backgroundColor: '#959EE7'}}> 2H </Table.HeaderCell>
    <Table.HeaderCell colSpan={market === 'pts' ? 4 : 2} textAlign='center' style={{backgroundColor: '#C793ED'}}> Q3 </Table.HeaderCell>
    <Table.HeaderCell colSpan={market === 'pts' ? 4 : 2} textAlign='center' style={{backgroundColor: '#E79595'}}> Q4 </Table.HeaderCell>
  </Table.Row>
  <Table.Row>
    {/* Sportsbook columns */}
    {availableSportsbooks.map(book => (
      <Table.HeaderCell key={book} style={{backgroundColor: '#f0f0f0'}}> {book} </Table.HeaderCell>
    ))}
    {/* live */}
    <Table.HeaderCell> MIN </Table.HeaderCell>
    <Table.HeaderCell> {headerMappers[market]} </Table.HeaderCell>
    {(market === 'pts' || market == 'ast') && <>
      <Table.HeaderCell> USG </Table.HeaderCell>
    </>}
    { market === 'pts' && <>
      <Table.HeaderCell> FG </Table.HeaderCell>
      <Table.HeaderCell> FT </Table.HeaderCell>
    </>}
    <Table.HeaderCell> PF </Table.HeaderCell>
    {/* season */}
    <Table.HeaderCell> GP </Table.HeaderCell>
    <Table.HeaderCell> MIN </Table.HeaderCell>
    <Table.HeaderCell> {headerMappers[market]} </Table.HeaderCell>
    {/* 2H */}
    <Table.HeaderCell style={{backgroundColor: '#BCC7F0'}}> MIN </Table.HeaderCell>
    <Table.HeaderCell style={{backgroundColor: '#BCC7F0'}}> {headerMappers[market]} </Table.HeaderCell>
    {/* 3Q */}
    <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> MIN </Table.HeaderCell>
    <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> {headerMappers[market]} </Table.HeaderCell>
    { market === 'pts' && <>
      <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> FGA </Table.HeaderCell>
      <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> FTA </Table.HeaderCell>
    </>}
    {/* 4Q */}
    <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> MIN </Table.HeaderCell>
    <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> {headerMappers[market]} </Table.HeaderCell>
    { market === 'pts' && <>
      <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> FGA </Table.HeaderCell>
      <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> FTA </Table.HeaderCell>
    </>}
  </Table.Row>
</Table.Header>
}