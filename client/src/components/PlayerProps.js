import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Accordion, Segment } from 'semantic-ui-react';
import PropsTable from './playerProps/PropsTable';

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

class PlayerProps extends React.Component {
  state = {
    playerProps: this.props.playerProps.data.filter(prop => prop.gid === this.props.game.gid),
    lastUpdated: null,
    activeProp: 'pts',
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

  changePropState = (prop) => {
    this.setState({ activeProp: prop });
  }

  render () {
    const { game, playersMetadata } = this.props;
    const { activeProp } = this.state;

    const homeTeamName = game.h[0].tn;
    const awayTeamName = game.v[0].tn;

    const Level1Content = (
        <div style={{width: '100%'}}>
          <PropsTable 
            playerProps={this.state.playerProps}
            playersMetadata={playersMetadata} 
            market={activeProp}
          />
        </div>
    )
    
    const rootPanels = [
      { key: 'panel-1', title: `${awayTeamName} @ ${homeTeamName} PROPS`, content: { content: Level1Content } },
    ]

    return (
      <Accordion panels={rootPanels} styled fluid />
    )
  }  
}

const mapStateToProps = state => {
  return {
    playerProps: state.playerProps
  }
}

export default connect (mapStateToProps, {  }) (PlayerProps);