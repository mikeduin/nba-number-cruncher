import React from 'react';
import { connect } from 'react-redux';
import { Table, Grid } from 'semantic-ui-react';

import TeamRoster from './TeamRoster';

class ScenarioBuilder extends React.Component {
  componentDidMount () {
    console.log(this.props);
  }

  render () {
    let game = this.props.game;
    let segment = 'full';

    if (!this.props.game) {
      return (<div> Loading ... </div>)
    } else {
      return (
        <div>

              { this.props.vPlayers[1] ?
                <TeamRoster
                  players={this.props.vPlayers}
                  hv={'v'}
                  /> : null
              }

              { this.props.hPlayers[1] ?
                <TeamRoster
                  players={this.props.hPlayers}
                  hv={'h'}
                  /> : null
              }

        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
    game: state.game,
    hPlayers: state.hPlayers,
    vPlayers: state.vPlayers,
    hColors: state.hColors,
    vColors: state.vColors
  }
}

export default connect (mapStateToProps) (ScenarioBuilder);
