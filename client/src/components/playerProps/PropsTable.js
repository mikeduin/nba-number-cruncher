import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  
import { Image, Tab, Table } from 'semantic-ui-react';
import '../styles/gamblecast.css';
// find and import player logo image references
import logos from '../../modules/logos';
import playerPanes from '../playerPages/PlayerPanes';
import { colorFga, colorFta, formatJuice, getShotPct, styleFouls} from './Props.helpers';
import { PropsTableHeader } from './PropsTableHeader';
import { statMapper, headerMappers } from './Props.constants';
import ShootingCell from './ShootingCell';

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

const PropsTable = ({ 
  market, playerProps, playerStats, playersMetadata, setActivePropMarket, sortProps, teamFilter, timeframe, timeframeText
}) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [playerData, setPlayerData] = useState({});

  const toggleRow = (playerId) => {
    setExpandedRows((prevState) => ({
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

  const getPlayerDataRow = ({ playerId, livePropLine, liveStat }) => {
    const panes = playerPanes(playerData[playerId], market, setActivePropMarket, livePropLine, liveStat);
    return <Table.Row>
      <Table.Cell colSpan="20">
        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
      </Table.Cell>
    </Table.Row>
  }

  const renderPropRows = () => {
    const filteredProps = teamFilter ? playerProps.filter(prop => prop.team === teamFilter) : playerProps;
    const sortedProps = sortProps 
      ? filteredProps.sort((a, b) => {
          if (b[market] === a[market]) {
            return a[`${market}_over`] - b[`${market}_over`];
          }
          return b[market] - a[market];
        })
      : filteredProps;

    return sortedProps
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
            <Table.Cell textAlign='center' style={styleFouls(livePlayerStats?.fouls)}> {livePlayerStats?.fouls} </Table.Cell>
            {/* Season */}
            <Table.Cell textAlign='center'> {getPlayerStat(seasonPlayerStats, 'gp', false, null, timeframe)} </Table.Cell>
            <Table.Cell textAlign='center'> {getPlayerStat(seasonPlayerStats, 'min', false, null, timeframe)} </Table.Cell>
            <Table.Cell style={{fontSize: 18}}> 
                <b>{ market === 'fg3m' 
                ? `${getPlayerStat(seasonPlayerStats, market, false, null, timeframe)} - ${getPlayerStat(seasonPlayerStats, 'fg3a', false, null, timeframe)}`
                : getPlayerStat(seasonPlayerStats, market, false, null, timeframe) }</b> 
              </Table.Cell>
            {/* 2H  */}
            <Table.Cell style={{fontSize: 16}}> 
              {(Math.round((getPlayerStat(seasonPlayerStats, 'min', false, '3q', timeframe) + getPlayerStat(seasonPlayerStats, 'min', false, '4q', timeframe)) * 10) / 10)}
            </Table.Cell>
            <Table.Cell style={{fontSize: 16}}> 
              <b>{(Math.round((getPlayerStat(seasonPlayerStats, market, false, '3q', timeframe) + getPlayerStat(seasonPlayerStats, market, false, '4q', timeframe)) * 10) / 10)}</b> 
            </Table.Cell>
            {/* 3Q */}
            <Table.Cell> {getPlayerStat(seasonPlayerStats, 'min', false, '3q', timeframe)} </Table.Cell>
            <Table.Cell style={{fontSize: 16}}> <b>{getPlayerStat(seasonPlayerStats, market, false, '3q', timeframe)}</b> </Table.Cell>
            { market === 'pts' && <>
              <ShootingCell value={fga3q} percentage={fgPct3q} color={colorFga(fgPct3q)} />
              <ShootingCell value={fta3q} percentage={ftPct3q} color={colorFta(ftPct3q)} />
            </>}
            {/* 4Q */}
            <Table.Cell> {getPlayerStat(seasonPlayerStats, 'min', false, '4q', timeframe)} </Table.Cell>
            <Table.Cell style={{fontSize: 16}}> <b>{getPlayerStat(seasonPlayerStats, market, false, '4q', timeframe)}</b> </Table.Cell>
            { market === 'pts' && <>
              <ShootingCell value={fga4q} percentage={fgPct4q} color={colorFga(fgPct4q)} />
              <ShootingCell value={fta4q} percentage={ftPct4q} color={colorFta(ftPct4q)} />
            </>}
          </Table.Row>
          {expandedRows[prop.player_id] && getPlayerDataRow({
            playerId: prop.player_id,
            livePropLine: prop[market],
            liveStat: getPlayerStat(livePlayerStats, market, true),
          })}
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
      <PropsTableHeader market={market} timeframeText={timeframeText}/>
      <Table.Body>
        {renderPropRows()}
      </Table.Body>
    </Table>
  )
}

export default PropsTable;