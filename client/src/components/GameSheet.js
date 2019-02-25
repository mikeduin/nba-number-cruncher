import React from 'react';
import { Grid, Tab } from 'semantic-ui-react';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

import NetRtgByQuarter from './netRatingGrids/NetRtgByQuarter';
import ByRotation from './netRatingGrids/ByRotation';
import PaceByQuarter from './paceGrids/PaceByQuarter';
import QuarterChart from './QuarterChart';
import InfoTable from './gamesheets/InfoTable';
import ImpPlayerTable from './gamesheets/ImpPlayerTable';
import ScenarioBuilder from './gamesheets/ScenarioBuilder';

class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
  }

  render () {
    let game = this.props.game;
    if (!this.props.game.info || !this.props.hPlayers[0] || !this.props.vPlayers[0]) {
      return <div> Loading ... </div>
    } else {
      return (
        <div>
        <InfoTable />
        <Tab menu={{ secondary: true, pointing: true }} panes={[
          {menuItem: 'Ratings Tables', render: () =>
            <Tab.Pane>
              <br />
              <ByRotation netRatings={this.props.game.netRatingsArr} />
              <br />
              <NetRtgByQuarter netRatings={this.props.game.netRatingsArr} />
              <br />
              <PaceByQuarter pace={this.props.game.paceArr} />
              <br />
            </Tab.Pane>
          },
          {menuItem: 'Ratings Charts', render: () =>
            <Tab.Pane>
              <Grid>
                <Grid.Row columns={2}>
                  <Grid.Column>
                    <QuarterChart
                      homeData={game.hObj}
                      visData={game.vObj}
                      hColor={this.props.hColors.active}
                      vColor={this.props.vColors.active}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Tab.Pane>
          },
          {menuItem: 'Player Details', render: () =>
            <Tab.Pane>
              <ImpPlayerTable
                players={game.impPlayers}
              />
            </Tab.Pane>
          }
        ]}/>
        </div>
      )
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

export default connect(mapStateToProps, {fetchGame}) (GameSheet);
