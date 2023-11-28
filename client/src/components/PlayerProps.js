import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Accordion, Button, Segment } from 'semantic-ui-react';
import PropsTable from './playerProps/PropsTable';
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
    activeTimeframe: 'full'
  };

  componentDidMount () {
    // const { game, props } = this.props;
    // console.log('props are ', props); 
    console.log('playerProps are ', this.state.playerProps);
  }

  componentDidUpdate(prevProps) {
    if (this.props.playerProps.fetchedAt !== prevProps.playerProps.fetchedAt) {
      console.log('updating player props in PlayerProps');
      this.setState({
        playerProps: this.props.playerProps.data.filter(prop => prop.gid === this.props.game.gid),
        lastUpdated: this.props.playerProps.fetchedAt
      });
    }
  }

  render () {
    const { boxScore, game, playersMetadata } = this.props;
    const { activeProp, activeTimeframe, playerProps } = this.state;

    // console.log('boxScore in PlayerProps are ', boxScore);

    const homeTeamName = game.h[0].tn;
    const awayTeamName = game.v[0].tn;

    const Level1Content = (
      <div style={{width: '100%'}}>
        <Segment 
          attached='top'
          textAlign='right'
        >
          <div style={{display: 'inline-flex', alignItems: 'center'}}>
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
          <div style={{display: 'inline-flex', alignItems: 'center'}}>
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