import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  
import { Image, Tab, Table } from 'semantic-ui-react';
import '../styles/gamblecast.css';
// find and import player logo image references
import logos from '../../modules/logos';
import playerPanes from '../playerPages/PlayerPanes';
import ShootingCell from './ShootingCell';

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

const colorFga = (pct) => {
  if (pct < 42) {
    return '#db2828';
  } else if (pct > 48) {
    return 'green';
  } else {
    return 'black'; // Default color if the value is between 0.42 and 0.48
  }
}

const colorFta = (pct) => {
  if (pct < 70) {
    return '#db2828';
  } else if (pct > 79) {
    return 'green';
  } else {
    return 'black'; // Default color if the value is between 0.42 and 0.48
  }
}

const formatJuice = (value) => {
  if (parseInt(value) > 1) {
    return `+${value}`;
  } else {
    return value;
  }
}

const getShotPct = (fgm, fga) => fga > 0 ? ((fgm / fga) * 100).toFixed(0) : '0.0';

const PropsTable = ({ market, playerProps, playerStats, playersMetadata, timeframe, timeframeText }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [playerData, setPlayerData] = useState({});

  const toggleRow = (playerId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [playerId]: !prevState[playerId],
    }));
  };

  const handlePlayerRowClick = async (playerId) => {
    const response = await axios.get(`/api/fetchPlayerData/${playerId}`);
    if (response.status === 200) {
      setPlayerData((prevState) => ({
        ...prevState,
        [playerId]: response.data
      }));
    }
    toggleRow(playerId);
  }

  const getPlayerDataRow = (playerId) => {
    const panes = playerPanes(playerData[playerId]);
    return <Table.Row>
      <Table.Cell colSpan="20">
        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
      </Table.Cell>
    </Table.Row>
  }

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
        const fgm = getPlayerStat(seasonPlayerStats, 'fgm', false, null, timeframe);
        const fga = getPlayerStat(seasonPlayerStats, 'fga', false, null, timeframe);
        const fgPct = getShotPct(fgm, fga);
        const fgm3q = getPlayerStat(seasonPlayerStats, 'fgm', false, '3q', timeframe);
        const fga3q = getPlayerStat(seasonPlayerStats, 'fga', false, '3q', timeframe);
        const fgPct3q = getShotPct(fgm3q, fga3q);
        const fgm4q = getPlayerStat(seasonPlayerStats, 'fgm', false, '4q', timeframe);
        const fga4q = getPlayerStat(seasonPlayerStats, 'fga', false, '4q', timeframe);
        const fgPct4q = getShotPct(fgm4q, fga4q);
        const ftm = getPlayerStat(seasonPlayerStats, 'ftm', false, null, timeframe);
        const fta = getPlayerStat(seasonPlayerStats, 'fta', false, null, timeframe);
        const ftPct = getShotPct(ftm, fta);
        const ftm3q = getPlayerStat(seasonPlayerStats, 'ftm', false, '3q', timeframe);
        const fta3q = getPlayerStat(seasonPlayerStats, 'fta', false, '3q', timeframe);
        const ftPct3q = getShotPct(ftm3q, fta3q);
        const ftm4q = getPlayerStat(seasonPlayerStats, 'ftm', false, '4q', timeframe);
        const fta4q = getPlayerStat(seasonPlayerStats, 'fta', false, '4q', timeframe);
        const ftPct4q = getShotPct(ftm4q, fta4q);
        return (
          <React.Fragment key={`${prop.player_name}-${market}`}>
          <Table.Row 
            onClick={() => handlePlayerRowClick(prop.player_id)}
            style={{backgroundColor: prop[`${market}_active`] !== true ? '#D4D4D4' : 'white'}}>
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
            {(market === 'pts' || market == 'ast') && <>
              <Table.HeaderCell> {livePlayerStats?.usg && livePlayerStats?.usg > 0 ? livePlayerStats?.usg?.toFixed(1) : 0} </Table.HeaderCell>
            </>}
            { market === 'pts' && <>
              <Table.Cell style={{whiteSpace: 'nowrap'}}> {livePlayerStats?.fgm} - {livePlayerStats?.fga} </Table.Cell>
              <Table.Cell style={{whiteSpace: 'nowrap'}}> {livePlayerStats?.ftm} - {livePlayerStats?.fta} </Table.Cell>
            </>}      
            <Table.Cell textAlign='center'> {livePlayerStats?.fouls} </Table.Cell>
            <Table.Cell textAlign='center'> {getPlayerStat(seasonPlayerStats, 'min', false, null, timeframe)} </Table.Cell>
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
              <ShootingCell value={fga3q} percentage={fgPct3q} color={colorFga(fgPct3q)} />
              <ShootingCell value={fta3q} percentage={ftPct3q} color={colorFta(ftPct3q)} />
            </>}
            <Table.Cell> {getPlayerStat(seasonPlayerStats, 'min', false, '4q', timeframe)} </Table.Cell>
            <Table.Cell style={{fontSize: 16}}> <b>{getPlayerStat(seasonPlayerStats, market, false, '4q', timeframe)}</b> </Table.Cell>
            { market === 'pts' && <>
              <ShootingCell value={fga4q} percentage={fgPct4q} color={colorFga(fgPct4q)} />
              <ShootingCell value={fta4q} percentage={ftPct4q} color={colorFta(ftPct4q)} />
            </>}
          </Table.Row>
          {expandedRows[prop.player_id] && getPlayerDataRow(prop.player_id)}
          </React.Fragment>
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
          <Table.HeaderCell colSpan={
            market === 'pts' ? 6 
            : market === 'ast' ? 4
            : 3
            } textAlign='center'> Live </Table.HeaderCell>
          <Table.HeaderCell colSpan="2"> {timeframeText} </Table.HeaderCell>
          <Table.HeaderCell colSpan="2" textAlign='center' style={{backgroundColor: '#959EE7'}}> 2H </Table.HeaderCell>
          <Table.HeaderCell colSpan={market === 'pts' ? 4 : 2} textAlign='center' style={{backgroundColor: '#C793ED'}}> Q3 </Table.HeaderCell>
          <Table.HeaderCell colSpan={market === 'pts' ? 4 : 2} textAlign='center' style={{backgroundColor: '#E79595'}}> Q4 </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
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
      <Table.Body>
        {renderPropRows()}
      </Table.Body>
    </Table>
  )
}

export default PropsTable;