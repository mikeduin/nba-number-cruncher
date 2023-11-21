import React from 'react';
import { connect } from 'react-redux';
import { Image, Table } from 'semantic-ui-react';
// find and import player logo image references
import logos from '../../modules/logos';


const marketMappers = {
  'Total Points': 'pts',
  'Total Rebounds': 'reb',
  'Total Assists': 'ast',
  'Total Steals': 'stl',
  'Total Blocks': 'blk',
  'Total Turnovers': 'tov',
  'Total Made 3 Points Shots': 'fg3m',
  'Total Points, Rebounds and Assists': 'pts+reb+ast',
  'Total Points and Rebounds': 'pts+reb',
  'Total Points and Assists': 'pts+ast',
  'Total Rebounds and Assists': 'reb+ast'
};

const headerMappers = {
  'Total Points': 'PTS',
  'Total Rebounds': 'REB',
  'Total Assists': 'AST',
  'Total Steals': 'STL',
  'Total Blocks': 'BLK',
  'Total Turnovers': 'TO',
  'Total Made 3 Points Shots': '3PT',
  'Total Points, Rebounds and Assists': 'P+R+A',
  'Total Points and Rebounds': 'P+R',
  'Total Points and Assists': 'P+A',
  'Total Rebounds and Assists': 'R+A'
};

class PropsTable extends React.Component {


  render () {
    const { market, playerProps, playersMetadata } = this.props;

    console.log('playerProps in PropsTable are ', playerProps);
    console.log('playersMetadata in PropsTable are ', playersMetadata);

    const renderPropRows = () => {
      // const stat = marketMappers[market];
      return playerProps
        .sort((a, b) => b[market] - a[market])
        .map(prop => { 
          

          return (
            <Table.Row key={`${prop.player_name}-${market}`}>
              <Table.Cell style={{position: 'relative'}}>
                <div style={{ position: 'absolute', top: 0, right: 5, height: '30px', width: '30px', display: 'inline-block'}}>
                  <Image size="mini" circular src={logos[prop.team]} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{prop.player_name}</span>
                </div>
              </Table.Cell>
              <Table.Cell style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'column',
                      fontSize: '22px',
                    }}> 
                <div style={{marginBottom: '5px '}}>
                  {prop[market]} 
                </div>
                <div>
                  <Table compact celled>
                    <Table.Header>
                    <Table.Row style={{
                        lineHeight: '3px',
                        fontSize: '10px',
                        padding: 0
                      }}>
                        <Table.HeaderCell>{prop[`${market}_over`]}</Table.HeaderCell>
                        <Table.HeaderCell>{prop[`${market}_under`]}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                  </Table>
                </div>
              </Table.Cell>
              <Table.Cell> Season Avg </Table.Cell>
              <Table.Cell> MIN </Table.Cell>
              <Table.Cell> PTS </Table.Cell>
              <Table.Cell> FG </Table.Cell>
              <Table.Cell> FT </Table.Cell>
              <Table.Cell> Fouls </Table.Cell>
              <Table.Cell> MIN </Table.Cell>
              <Table.Cell> PTS </Table.Cell>
              <Table.Cell> FG </Table.Cell>
              <Table.Cell> FT </Table.Cell>
              <Table.Cell> MIN </Table.Cell>
              <Table.Cell> PTS </Table.Cell>
              <Table.Cell> FG </Table.Cell>
              <Table.Cell> FT </Table.Cell>
            </Table.Row>
          )
  }) 
    }

    return (
      <div>
        <Table compact celled
          style={{marginBottom: 20}}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell rowSpan="2"> Player </Table.HeaderCell>
              <Table.HeaderCell rowSpan="2"> Bov Line </Table.HeaderCell>
              <Table.HeaderCell rowSpan="2"> Season Avg </Table.HeaderCell>
              <Table.HeaderCell colSpan="5"> Live </Table.HeaderCell>
              <Table.HeaderCell colSpan="4"> Q3 </Table.HeaderCell>
              <Table.HeaderCell colSpan="4"> Q4 </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell> MIN </Table.HeaderCell>
              <Table.HeaderCell> PTS </Table.HeaderCell>
              <Table.HeaderCell> FG </Table.HeaderCell>
              <Table.HeaderCell> FT </Table.HeaderCell>
              <Table.HeaderCell> Fouls </Table.HeaderCell>
              <Table.HeaderCell> MIN </Table.HeaderCell>
              <Table.HeaderCell> PTS </Table.HeaderCell>
              <Table.HeaderCell> FG </Table.HeaderCell>
              <Table.HeaderCell> FT </Table.HeaderCell>
              <Table.HeaderCell> MIN </Table.HeaderCell>
              <Table.HeaderCell> PTS </Table.HeaderCell>
              <Table.HeaderCell> FG </Table.HeaderCell>
              <Table.HeaderCell> FT </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {renderPropRows()}
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default PropsTable;