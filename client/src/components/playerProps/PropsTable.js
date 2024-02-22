import React from 'react';
import { connect } from 'react-redux';
import { Image, Table } from 'semantic-ui-react';
import '../styles/gamblecast.css';
// find and import player logo image references
import logos from '../../modules/logos';
import { Link } from 'react-router-dom';  

const headerMappers = {
  'pts': 'PTS',
  'reb': 'REB',
  'ast': 'AST',
  'stl': 'STL',
  'blk': 'BLK',
  'tov': 'TO',
  'fg3m': 'FG3M',
  'pts+reb+ast': 'P+R+A',
  'pts+reb': 'PTS+REB',
  'pts+ast': 'PTS+AST',
  'reb+ast': 'REB+AST'
};

const statMapper = {
  // market : db column prefix (e.g., ppg_3q_full has 'ppg' as the prefix)
  'pts': 'ppg',
  'reb': 'rpg',
  'ast': 'apg',
  'stl': 'spg',
  'blk': 'bpg',
  'tov': 'topg',
  'fg3m': '3pg',
  'fg3a': '3pa',
  'min': 'min',
  'fgm': 'fgm',
  'fga': 'fga',
  'ftm': 'ftm',
  'fta': 'fta',
}

function getPlayerStat(playerStats, market, live = true, phase = null, games = 'full') {
  if (!playerStats) return null;

  const formKey = (marketArg) => {
    let key = marketArg;
    if (!live) {
      key = statMapper[marketArg];
  
      if (!phase) {
        key=`${key}_${games}`;
      } else {
        key=`${key}_${phase}_${games}`;
      }
    }
    return key
  }

  // Check if the market is a combo market
  if (market.includes('+')) {
    // Split the combo market into individual markets
    const markets = market.split('+');
    const keys = markets.map(m => formKey(m));
    
    // Calculate the sum of the individual markets
    const sum = keys.reduce((total, s) => total + (playerStats[s] || 0), 0);
    return Math.round(sum * 10) / 10;
  } else {
    // If it's not a combo market, return the value of the specified market
    return playerStats[formKey(market)] || 0;
  }
}

const formatJuice = (value) => {
  if (parseInt(value) > 1) {
    return `+${value}`;
  } else {
    return value;
  }
}

class PropsTable extends React.Component {
  render () {
    const { market, playerProps, playerStats, playersMetadata, timeframe, timeframeText } = this.props;

    const renderPropRows = () => {
      return playerProps
        .sort((a, b) => {
          if (b[market] === a[market]) {
            return a[`${market}_over`] - b[`${market}_over`];
          }
          return b[market] - a[market];
        })
        .map(prop => { 
          const livePlayerStats = playerStats ? playerStats.filter(player => player.player_id === prop.player_id)[0] : null;
          const seasonPlayerStats = playersMetadata ? playersMetadata.filter(player => player.player_id === prop.player_id)[0] : null;
          return (
            <Table.Row key={`${prop.player_name}-${market}`} style={{backgroundColor: prop[`${market}_active`] !== true ? 'grey' : 'white'}}>
              <Table.Cell style={{position: 'relative'}}>
                <div style={{ position: 'absolute', top: 0, right: 5, height: '30px', width: '30px', display: 'inline-block'}}>
                  <Image size="mini" circular src={logos[prop.team]} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={`/player/${prop.player_id}`} className='player-link'>
                    {prop.player_name}
                  </Link>
                </div>
              </Table.Cell>
              <Table.Cell 
                style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                fontSize: '22px',
              }}> 
                <div style={{marginBottom: '5px '}}>
                  <b>{prop[market]}</b> 
                </div>
                <div>
                  <Table compact celled>
                    <Table.Header>
                    <Table.Row style={{
                        lineHeight: '3px',
                        fontSize: '10px',
                        padding: 0
                      }}>
                        <Table.HeaderCell>{formatJuice(prop[`${market}_over`])}</Table.HeaderCell>
                        <Table.HeaderCell>{formatJuice(prop[`${market}_under`])}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                  </Table>
                </div>
              </Table.Cell>
              <Table.Cell> {livePlayerStats?.min} </Table.Cell>
              <Table.Cell style={{fontSize: '20px'}}> <b>
                  { market === 'fg3m' 
                  ? `${getPlayerStat(livePlayerStats, market, true)} - ${getPlayerStat(livePlayerStats, 'fg3a', true)}`
                  : getPlayerStat(livePlayerStats, market, true) } </b>
              </Table.Cell>
              { market === 'pts' && <>
                <Table.Cell style={{whiteSpace: 'nowrap'}}> {livePlayerStats?.fgm} - {livePlayerStats?.fga} </Table.Cell>
                <Table.Cell style={{whiteSpace: 'nowrap'}}> {livePlayerStats?.ftm} - {livePlayerStats?.fta} </Table.Cell>
              </>}        
              <Table.Cell textAlign='center'> {livePlayerStats?.fouls} </Table.Cell>
              <Table.Cell style={{fontSize: 18}}> 
                  <b>{ market === 'fg3m' 
                  ? `${getPlayerStat(seasonPlayerStats, market, false, null, timeframe)} - ${getPlayerStat(seasonPlayerStats, 'fg3a', false, null, timeframe)}`
                  : getPlayerStat(seasonPlayerStats, market, false, null, timeframe) }</b> 
                </Table.Cell>
              <Table.Cell style={{fontSize: 16}}> 
                {(Math.round((getPlayerStat(seasonPlayerStats, 'min', false, '3q', timeframe) + getPlayerStat(seasonPlayerStats, 'min', false, '4q', timeframe)) * 10) / 10)}
              </Table.Cell>
              <Table.Cell style={{fontSize: 16}}> 
                <b>{(Math.round((getPlayerStat(seasonPlayerStats, market, false, '3q', timeframe) + getPlayerStat(seasonPlayerStats, market, false, '4q', timeframe)) * 10) / 10)}</b> 
              </Table.Cell>
              <Table.Cell> {getPlayerStat(seasonPlayerStats, 'min', false, '3q', timeframe)} </Table.Cell>
              <Table.Cell style={{fontSize: 16}}> <b>{getPlayerStat(seasonPlayerStats, market, false, '3q', timeframe)}</b> </Table.Cell>
              { market === 'pts' && <>
                <Table.Cell> {getPlayerStat(seasonPlayerStats, 'fgm', false, '3q', timeframe)} - {getPlayerStat(seasonPlayerStats, 'fga', false, '3q', timeframe)} </Table.Cell>
                <Table.Cell> {getPlayerStat(seasonPlayerStats, 'ftm', false, '3q', timeframe)} - {getPlayerStat(seasonPlayerStats, 'fta', false, '3q', timeframe)} </Table.Cell>
              </>}
              <Table.Cell> {getPlayerStat(seasonPlayerStats, 'min', false, '4q', timeframe)} </Table.Cell>
              <Table.Cell style={{fontSize: 16}}> <b>{getPlayerStat(seasonPlayerStats, market, false, '4q', timeframe)}</b> </Table.Cell>
              { market === 'pts' && <>
              <Table.Cell> {getPlayerStat(seasonPlayerStats, 'fgm', false, '4q', timeframe)} - {getPlayerStat(seasonPlayerStats, 'fga', false, '4q', timeframe)} </Table.Cell>
                <Table.Cell> {getPlayerStat(seasonPlayerStats, 'ftm', false, '4q', timeframe)} - {getPlayerStat(seasonPlayerStats, 'fta', false, '4q', timeframe)} </Table.Cell>
              </>}
            </Table.Row>
          )
        }) 
    }

    return (
      <Table
        attached='bottom' 
        compact 
        celled
        style={{marginBottom: 20}}
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan="2"> Player </Table.HeaderCell>
            <Table.HeaderCell rowSpan="2"> Bov Line </Table.HeaderCell>
            <Table.HeaderCell colSpan={market === 'pts' ? 5 : 3} textAlign='center'> Live </Table.HeaderCell>
            <Table.HeaderCell> {timeframeText} </Table.HeaderCell>
            <Table.HeaderCell colSpan="2" textAlign='center' style={{backgroundColor: '#959EE7'}}> 2H </Table.HeaderCell>
            <Table.HeaderCell colSpan={market === 'pts' ? 4 : 2} textAlign='center' style={{backgroundColor: '#C793ED'}}> Q3 </Table.HeaderCell>
            <Table.HeaderCell colSpan={market === 'pts' ? 4 : 2} textAlign='center' style={{backgroundColor: '#E79595'}}> Q4 </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell> MIN </Table.HeaderCell>
            <Table.HeaderCell> {headerMappers[market]} </Table.HeaderCell>
            { market === 'pts' && <>
              <Table.HeaderCell> FG </Table.HeaderCell>
              <Table.HeaderCell> FT </Table.HeaderCell>
            </>}
            <Table.HeaderCell> PF </Table.HeaderCell>
            {/* season */}
            <Table.HeaderCell> {headerMappers[market]} </Table.HeaderCell>
            {/* 2H */}
            <Table.HeaderCell style={{backgroundColor: '#BCC7F0'}}> MIN </Table.HeaderCell>
            <Table.HeaderCell style={{backgroundColor: '#BCC7F0'}}> {headerMappers[market]} </Table.HeaderCell>
            {/* 3Q */}
            <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> MIN </Table.HeaderCell>
            <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> {headerMappers[market]} </Table.HeaderCell>
            { market === 'pts' && <>
              <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> FG </Table.HeaderCell>
              <Table.HeaderCell style={{backgroundColor: '#D3BFE6'}}> FT </Table.HeaderCell>
            </>}
            {/* 4Q */}
            <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> MIN </Table.HeaderCell>
            <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> {headerMappers[market]} </Table.HeaderCell>
            { market === 'pts' && <>
              <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> FG </Table.HeaderCell>
              <Table.HeaderCell style={{backgroundColor: '#E3C0C0'}}> FT </Table.HeaderCell>
            </>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {renderPropRows()}
        </Table.Body>
      </Table>
    )
  }
}

export default PropsTable;