import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Button, Input, Segment, Image } from 'semantic-ui-react';
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
  const [playerProps, setPlayerProps] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeProp, setActiveProp] = useState('pts');
  const [activeTimeframe, setActiveTimeframe] = useState('full');
  const [bovadaUrl, setBovadaUrl] = useState('');
  const [betssonUrl, setBetssonUrl] = useState('');
  const [fanDuelCurl, setFanDuelCurl] = useState('');
  const [draftKingsUrl, setDraftKingsUrl] = useState('');
  const [storedPxContext, setStoredPxContext] = useState(null);
  const [pxContextAge, setPxContextAge] = useState(null);
  const [teamFilter, setTeamFilter] = useState(null);
  const [sortProps, setSortProps] = useState(true);
  const [fanDuelEventId, setFanDuelEventId] = useState(game.fanduel_event_id || null);
  const [draftKingsEventId, setDraftKingsEventId] = useState(game.draftkings_event_id || null); 

  useEffect(() => {
    setPlayerProps(allPlayerProps.data.filter(prop => prop.gid === game.gid));
    setLastUpdated(allPlayerProps.fetchedAt);
    fetchStoredPxContext();
    setFanDuelEventId(game.fanduel_event_id || null);
    setDraftKingsEventId(game.draftkings_event_id || null);
    // Don't sync curl/url to state - let placeholder show saved values (like Betsson)
    // State is only used when user is actively editing
  }, [allPlayerProps.fetchedAt, game.gid, game.fanduel_event_id, game.draftkings_event_id, game.fanduel_curl, game.draftkings_url]);



  // Auto-save px-context when cURL is pasted
  useEffect(() => {
    if (fanDuelCurl) {
      const pxMatch = fanDuelCurl.match(/x-px-context[:'"]\s*([^'"\s]+)/);
      if (pxMatch) {
        // Silently save px-context in background
        axios.post('/api/updateFanDuelPxContext', { pxContext: pxMatch[1] })
          .then(() => {
            fetchStoredPxContext();
          })
          .catch(err => {
            console.error('Error auto-saving px-context:', err);
          });
      }
    }
  }, [fanDuelCurl]);

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

  const fetchStoredPxContext = async () => {
    try {
      const response = await axios.get('/api/getFanDuelPxContext');
      if (response.data.message === 'success') {
        setStoredPxContext(response.data.pxContext);
        if (response.data.updatedAt) {
          const age = Math.floor((new Date() - new Date(response.data.updatedAt)) / 60000);
          setPxContextAge(age);
        }
      }
    } catch (error) {
      console.error('Error fetching px-context:', error);
    }
  };

  const updatePxContextOnly = async () => {
    try {
      if (!fanDuelCurl) {
        toast({
          type: 'error',
          icon: 'exclamation',
          color: 'red',
          title: 'Invalid cURL',
          description: `Please paste a cURL command first`,
          animation: 'slide down',
          time: 3000
        });
        return;
      }
      
      const pxMatch = fanDuelCurl.match(/x-px-context[:'"\\s]+([^'"\\s]+)/);
      if (!pxMatch) {
        toast({
          type: 'error',
          icon: 'exclamation',
          color: 'red',
          title: 'Invalid cURL',
          description: `Could not find x-px-context in the cURL command`,
          animation: 'slide down',
          time: 3000
        });
        return;
      }
      
      const response = await axios.post('/api/updateFanDuelPxContext', { pxContext: pxMatch[1] });
      if (response.data.message === 'success') {
        toast({
          type: 'success',
          icon: 'check circle',
          color: 'green',
          title: 'Token Updated',
          description: 'px-context token has been saved globally',
          animation: 'slide down',
          time: 3000
        });
        fetchStoredPxContext();
      }
    } catch (error) {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'Error updating token',
        description: error.response?.data?.error || error.message,
        animation: 'slide down',
        time: 3000
      });
    }
  };

  const saveFanDuelEventId = async () => {
    if (!fanDuelCurl) {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'No cURL provided',
        description: `Please paste a cURL command first`,
        animation: 'slide down',
        time: 3000
      });
      return;
    }

    const gid = game.gid;
    try {
      const response = await axios.post('/api/updateFanDuelEventId', {gid, curlCommand: fanDuelCurl});
      setFanDuelEventId(response.data.eventId);
      if (response.data.message === 'success') {
        toast({
          type: 'success',
          icon: 'check circle',
          color: 'green',
          title: 'Event ID & Token Saved',
          description: `FanDuel event ID ${response.data.eventId} saved for game ${gid} (px-context also updated)`,
          animation: 'slide down',
          time: 4000
        });
        fetchStoredPxContext();
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }
    } catch (error) {
      const isTokenExpired = error.response?.status === 403 || error.response?.data?.needsNewToken;
      toast({
        type: 'error',
        icon: 'exclamation',
        color: isTokenExpired ? 'orange' : 'red',
        title: isTokenExpired ? 'Token Expired' : 'Error updating props',
        description: error.response?.data?.error || error.message,
        animation: 'slide down',
        time: isTokenExpired ? 8000 : 3000
      });
    }
  }

  const saveDraftKingsEventId = async () => {
    if (!draftKingsUrl) {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'No URL or Event ID provided',
        description: `Please enter a DraftKings URL or event ID`,
        animation: 'slide down',
        time: 3000
      });
      return;
    }

    const gid = game.gid;
    try {
      const response = await axios.post('/api/updateDraftKingsEventId', {gid, urlOrEventId: draftKingsUrl});
      setDraftKingsEventId(response.data.eventId);
      if (response.data.message === 'success') {
        toast({
          type: 'success',
          icon: 'check circle',
          color: 'green',
          title: 'Event ID Saved',
          description: `DraftKings event ID ${response.data.eventId} saved for game ${gid}`,
          animation: 'slide down',
          time: 4000
        });
        // Keep the URL in the input - don't clear it
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }
    } catch (error) {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'Error updating event ID',
        description: error.response?.data?.error || error.message,
        animation: 'slide down',
        time: 3000
      });
    }
  }

  const updateProps = async (sportsbook) => {
    const gid = game.gid;
    
    // Extract pxContext from FanDuel cURL if sportsbook is FanDuel and cURL is provided
    let pxContext = null;
    if (sportsbook === 'FanDuel' && fanDuelCurl) {
      const pxMatch = fanDuelCurl.match(/x-px-context[:']\s*([^'"]+)/);
      if (pxMatch) {
        pxContext = pxMatch[1];
      }
    }
    
    // If FanDuel but no px-context extracted and no stored one, show error
    if (sportsbook === 'FanDuel' && !pxContext && !storedPxContext) {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'No px-context Available',
        description: `Please paste a cURL command first to set px-context token`,
        animation: 'slide down',
        time: 3000
      });
      return;
    }
    
    const response = await axios.post(`/api/updateProps`, {gid, sportsbook, pxContext});
    if (response.status === 200) {
      const { missingTeams } = response.data;
      
      // Refresh stored px-context if we just used a new one
      if (pxContext) {
        fetchStoredPxContext();
      }
      
      if (missingTeams && missingTeams.length > 0) {
        toast({
          type: 'warning',
          icon: 'exclamation triangle',
          color: 'orange',
          title: 'Name Mismatches Found',
          description: `${missingTeams.length} player(s) need name mapping: ${missingTeams.join(', ')}`,
          animation: 'slide down',
          time: 8000
        });
      }
      
      toast({
        type: 'warning',
        icon: 'check circle',
        color: 'violet',
        title: 'Props updated',
        description: `Props have been updated for game ${gid}`,
        animation: 'slide down',
        time: 3000
      });
    }
  }

  const setActivePropMarket = ({ market, sort = true }) => {
    setActiveProp(market);
    setSortProps(sort);
  };
  const handleTeamFilter = (teamAbb) => {
    setTeamFilter(teamFilter === teamAbb ? null : teamAbb);
  }

  return (
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
          <Button color='green' style={{marginLeft: 10}} onClick={() => updateProps('Bovada')}>Update Props [BOV]</Button>
          <Button color='green' style={{marginLeft: 10}} onClick={() => updateProps('Betsson')}>Update Props [BSN]</Button>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>FANDUEL cURL:</i></div>
          <Input 
            placeholder={game.fanduel_curl || "Paste cURL command from FanDuel (token auto-saves)"}
            style={{width: 700}} 
            onChange={(e) => setFanDuelCurl(e.target.value)}
            value={fanDuelCurl}
          />
          <Button primary style={{marginLeft: 10}} onClick={saveFanDuelEventId}>Save Event ID</Button>
          <Button color='orange' style={{marginLeft: 10}} onClick={() => updateProps('FanDuel')}>Update Props [FD]</Button>
        </div>
        {storedPxContext && (
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 5, fontSize: '11px', color: '#666'}}>
            <i>✓ Token stored ({pxContextAge < 60 ? `${pxContextAge}min ago` : `${Math.floor(pxContextAge/60)}h ago`})</i>
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>DRAFTKINGS URL:</i></div>
          <Input 
            placeholder={game.draftkings_url || "Paste DraftKings URL or event ID"}
            style={{width: 700}} 
            onChange={(e) => setDraftKingsUrl(e.target.value)}
            value={draftKingsUrl}
          />
          <Button primary style={{marginLeft: 10}} onClick={saveDraftKingsEventId}>Save Event ID</Button>
          <Button color='teal' style={{marginLeft: 10}} onClick={() => updateProps('DraftKings')}>Update Props [DK]</Button>
        </div>
        <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
          <div style={{marginRight: 10}}><i>MARKET:</i></div>
          {Object.values(marketMappers).map(market => 
            <Button 
              color='black'
              onClick={() => setActivePropMarket({ market })}
              basic={activeProp !== market}
              key={market}
            >
              {market.toUpperCase()}
            </Button>
          )}
        </div>

        <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
          <div style={{marginRight: 40, display: 'inline-flex', alignItems: 'center'}}>
          <div style={{marginRight: 10}}><i>FILTER BY TEAM:</i></div>
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
        sortProps={sortProps}
      />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    allPlayerProps: state.playerProps
  }
}

export default connect (mapStateToProps, {  }) (PlayerProps);