import React, { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
import { Accordion, Button, Input, Segment, Image } from 'semantic-ui-react';
import PropsTable from './playerProps/PropsTable';
import { toast } from 'react-semantic-toasts';
import logos from '../modules/logos';
import { findKey } from 'lodash';

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

class PlayerProps extends React.Component {
  state = {
    playerProps: this.props.playerProps.data.filter(prop => prop.gid === this.props.game.gid),
    lastUpdated: null,
    activeProp: 'pts',
    activeTimeframe: 'full',
    bovadaUrl: '',
    betssonUrl: '',
    teamFilter: null,
  };

  componentDidMount () {
    console.log('playerProps are ', this.state.playerProps);
  }

  componentDidUpdate(prevProps) {
    if (this.props.playerProps.fetchedAt !== prevProps.playerProps.fetchedAt) {
      this.setState({
        playerProps: this.props.playerProps.data.filter(prop => prop.gid === this.props.game.gid),
        lastUpdated: this.props.playerProps.fetchedAt
      });
    }
  }

  updateSportsbookUrl = async (sportsbook) => {
    const gid = this.props.game.gid;
    const sportsbookUrl = sportsbook === 'bovada' ? this.state.bovadaUrl : this.state.betssonUrl;
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

  removeDuplicateProps = async (url) => {
    const gid = this.props.game.gid;
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

  updateProps = async (url) => {
    const gid = this.props.game.gid;
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

  setActivePropMarket = (market) => {
    this.setState({ activeProp: market })
  }

  setTeamFilter = (teamAbb) => {
    this.setState({ teamFilter: })
  }

  render () {
    const { boxScore, game, playersMetadata } = this.props;
    const { activeProp, activeTimeframe, playerProps } = this.state;

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
            <Input placeholder={game.betsson_url} style={{width: 700}} onChange={(e) => {this.setState({betssonUrl: e.target.value})}}/>
            <Button primary style={{marginLeft: 10}} onClick={() => this.updateSportsbookUrl('betsson')}>Update URL</Button>
            <Button color='red' style={{marginLeft: 10}} onClick={() => this.removeDuplicateProps()}>Remove Dups</Button>
            <Button color='green' style={{marginLeft: 10}} onClick={() => this.updateProps()}>Update Props</Button>
          </div>
          <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
            <div style={{marginRight: 10}}><i>MARKET:</i></div>
            {Object.values(marketMappers).map(market => 
              <Button 
                color='black'
                onClick={() => this.setActivePropMarket(market)}
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
                basic
                style={{maxWidth: 60, maxHeight: 60, padding: 0, display: 'flex', alignItems: 'center'}}
              > 
                <Image src={logos[game.v[0].ta]} /> 
              </Button>
              <Button
                basic
                style={{maxWidth: 60, maxHeight: 60, padding: 0, display: 'flex', alignItems: 'center'}}
              > 
                <Image src={logos[game.h[0].ta]} /> 
              </Button>
            </div>
            <div style={{marginRight: 10}}><i>SHOW AVERAGES FOR:</i></div>
            {Object.keys(timeMappers).map(timeframe => 
              <Button 
                color='black'
                onClick={() =>  this.setState({ activeTimeframe: timeMappers[timeframe] })}
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
          setActivePropMarket={this.setActivePropMarket}
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
}

const mapStateToProps = state => {
  return {
    playerProps: state.playerProps
  }
}

export default connect (mapStateToProps, {  }) (PlayerProps);