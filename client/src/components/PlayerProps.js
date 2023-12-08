import React, { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
import { Accordion, Button, Input, Segment } from 'semantic-ui-react';
import PropsTable from './playerProps/PropsTable';
import { toast } from 'react-semantic-toasts';
import { findKey } from 'lodash';

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
  'Total Rebounds and Assists': 'reb+ast',
};

const timeMappers = {
  'Season': 'full',
  'Last 5': 'l5',
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
    bovadaUrl: ''
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

  updateBovadaUrl = async (url) => {
    const gid = this.props.game.gid;
    if (this.state.bovadaUrl.length) {
      const response = await axios.post('/api//updateBovadaUrl', {gid, url: this.state.bovadaUrl});
      if (response.status === 200) {
        console.log('bovada URL updated');
        toast({
          type: 'warning',
          icon: 'check circle',
          color: 'violet',
          title: 'URL updated',
          description: `Bovada URL has been successfully updated`,
          animation: 'slide down',
          time: 3000
        });
        // react-semantic-toasts
      }
    } else {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'URL Not Updated',
        description: `No URL was input, Bovada URL was not updated`,
        animation: 'slide down',
        time: 3000
      });
    }
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
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5}}>
            <div style={{marginRight: 10}}><i>BOVADA URL:</i></div>
            <Input placeholder={game.bovada_url} style={{width: 700}} onChange={(e) => {this.setState({bovadaUrl: e.target.value})}}/>
            <Button primary style={{marginLeft: 10}} onClick={() => this.updateBovadaUrl()}>Update URL</Button>
          </div>
          <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
            <div style={{marginRight: 10}}><i>MARKET:</i></div>
            {Object.values(marketMappers).map(market => 
              <Button 
                color='black'
                onClick={() =>  this.setState({ activeProp: market })}
                basic={activeProp !== market}
                key={market}
              >
                {market.toUpperCase()}
              </Button>
            )}
          </div>

          <div style={{display: 'inline-flex', alignItems: 'center', marginBottom: 5}}>
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