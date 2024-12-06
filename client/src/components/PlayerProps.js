import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Accordion, Button, Input, Segment, Image } from 'semantic-ui-react';
import PropsTable from './playerProps/PropsTable';
import { toast } from 'react-semantic-toasts';
import logos from '../modules/logos';

export const marketMappers = {
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
  'Total Rebounds and Assists': 'reb+ast',
};

const timeMappers = {
  'Reg Season': 'full',
  'Last 5 (RS)': 'l5',
  'Playoffs': 'post'
  // 'Last 10': 'l10',
  // 'Last 15': 'l15',
};

function findKeyByValue(obj, targetValue) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === targetValue) {
      return key;
    }
  }
  return null; // Return null if the value is not found
}

const PlayerProps = ({ game, playersMetadata, boxScore, allPlayerProps }) => {
  console.log('allPlayerProps are ', allPlayerProps);
  const [playerProps, setPlayerProps] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeProp, setActiveProp] = useState('pts');
  const [activeTimeframe, setActiveTimeframe] = useState(null);
  const [bovadaUrl, setBovadaUrl] = useState('');
  const [betssonUrl, setBetssonUrl] = useState('');
  const [teamFilter, setTeamFilter] = useState(null);

  useEffect(() => {
    setPlayerProps(allPlayerProps.data.filter(prop => prop.gid === game.gid));
    setLastUpdated(allPlayerProps.fetchedAt);
  }, [allPlayerProps.fetchedAt]);

  const updateSportsbookUrl = async (sportsbook) => {
    const gid = game.gid;
    const sportsbookUrl = sportsbook === 'bovada' ? bovadaUrl : betssonUrl;
    if (sportsbookUrl.length) {
      const response = await axios.post('/api/updateSportsbookUrl', {gid, sportsbook, url: sportsbookUrl});
      if (response.status === 200) {
        toast({
          type: 'warning',
          icon: 'check circle',
          color: 'violet',
          title: 'URL updated',
          description: `Sportsbook URL has been successfully updated`,
          animation: 'slide down',
          time: 3000
        });
      }
    } else {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'URL Not Updated',
        description: `No URL was input, Sportsbook URL was not updated`,
        animation: 'slide down',
        time: 3000
      });
    }
  }

  const removeDuplicateProps = async () => {
    const gid = game.gid;
    const response = await axios.delete(`/api/deleteDuplicateProps/${gid}`);
    if (response.status === 200) {
      toast({
        type: 'warning',
        icon: 'check circle',
        color: 'violet',
        title: 'Duplicates deleted',
        description: `Duplicate props have been removed for game ${gid}`,
        animation: 'slide down',
        time: 3000
      });
    }
  }

  const updateProps = async () => {
    const gid = game.gid;
    const response = await axios.post(`/api/updateProps`, {gid});
    if (response.status === 200) {
      toast({
        type: 'warning',
        icon: 'check circle',
        color: 'violet',
        title: 'Props updated',
        description: `Props have been updated for for game ${gid}`,
        animation: 'slide down',
        time: 3000
      });
    }
  }

  const setActivePropMarket = (market) => setActiveProp(market);
  const handleTeamFilter = (teamAbb) => {
    setTeamFilter(teamFilter === teamAbb ? null : teamAbb);
  }

  const homeTeamName = game.h[0].tn;
  const awayTeamName = game.v[0].tn;

  const Level1Content = (
    <div style={{width: '100%'}}>
      <Segment 
        attached='top'
        textAlign='right'
      >
        {/* <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>BOVADA URL:</i></div>
          <Input placeholder={game.bovada_url} style={{width: 700}} onChange={(e) => {this.setState({bovadaUrl: e.target.value})}}/>
          <Button primary style={{marginLeft: 10}} onClick={() => this.updateSportsbookUrl('bovada')}>Update URL</Button>
          <Button color='red' style={{marginLeft: 10}} onClick={() => this.removeDuplicateProps()}>Remove Dups</Button>
        </div> */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>BETSSON URL:</i></div>
          <Input placeholder={game.betsson_url} style={{width: 700}} onChange={(e) => setBetssonUrl(e.target.value)}/>
          <Button primary style={{marginLeft: 10}} onClick={() => updateSportsbookUrl('betsson')}>Update URL</Button>
          <Button color='red' style={{marginLeft: 10}} onClick={() => removeDuplicateProps()}>Remove Dups</Button>
          <Button color='green' style={{marginLeft: 10}} onClick={() => updateProps()}>Update Props</Button>
        </div>
        <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>MARKET:</i></div>
          {Object.values(marketMappers).map(market => 
            <Button 
              color='black'
              onClick={() => setActivePropMarket(market)}
              basic={activeProp !== market}
              key={market}
            >
              {market.toUpperCase()}
            </Button>
          )}
        </div>

        <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
          <div style={{marginRight: 40, display: 'inline-flex', alignItems: 'center'}}>
            <i>FILTER BY TEAM:</i>
            <Button
              color='black'
              basic={teamFilter !== game.v[0].ta}
              style={{maxWidth: 60, maxHeight: 60, padding: 0, display: 'flex', alignItems: 'center'}}
              onClick={() => handleTeamFilter(game.v[0].ta)}
            > 
              <Image src={logos[game.v[0].ta]} /> 
            </Button>
            <Button
              color='black'
              basic={teamFilter !== game.h[0].ta}
              style={{maxWidth: 60, maxHeight: 60, padding: 0, display: 'flex', alignItems: 'center'}}
              onClick={() => handleTeamFilter(game.h[0].ta)}
            > 
              <Image src={logos[game.h[0].ta]} /> 
            </Button>
          </div>
          <div style={{marginRight: 10}}><i>SHOW AVERAGES FOR:</i></div>
          {Object.keys(timeMappers).map(timeframe => 
            <Button 
              color='black'
              onClick={() =>  setActiveTimeframe(timeMappers[timeframe])}
              basic={activeTimeframe !== timeMappers[timeframe]}
              key={timeframe}
            >
              {timeframe.toUpperCase()}
            </Button>
          )}
        </div>

      </Segment>
      <PropsTable 
        playerProps={playerProps}
        playerStats={boxScore ? boxScore.playerStats : []}
        playersMetadata={playersMetadata} 
        market={activeProp}
        timeframe={activeTimeframe}
        timeframeText={findKeyByValue(timeMappers, activeTimeframe)}
        setActivePropMarket={setActivePropMarket}
        teamFilter={teamFilter}
      />
    </div>
  )

  const rootPanels = [
    { key: 'panel-1', title: `${awayTeamName} @ ${homeTeamName} PROPS`, content: { content: Level1Content } },
  ]

  return (
    <Accordion 
      panels={rootPanels} 
      styled 
      fluid
      attached='bottom'
      style={{marginBottom: 20}}
    />
  )  
}

const mapStateToProps = state => {
  return {
    allPlayerProps: state.playerProps
  }
}

export default connect (mapStateToProps, {  }) (PlayerProps);