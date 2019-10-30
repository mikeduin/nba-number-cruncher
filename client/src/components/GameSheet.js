import React from 'react';
import { Grid, Tab, Segment } from 'semantic-ui-react';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

import NetRtgByQuarter from './netRatingGrids/NetRtgByQuarter';
import ByRotation from './netRatingGrids/ByRotation';
import PaceByQuarter from './paceGrids/PaceByQuarter';
import QuarterChart from './QuarterChart';
import InfoTable from './gamesheets/InfoTable';
import ImpactTable from './gamesheets/ImpactTable';
import RotationTable from './gamesheets/RotationTable';
import StatTable from './gamesheets/StatTable';
import OddsRating from './gamesheets/OddsRating';
import ScenarioBuilder from './gamesheets/ScenarioBuilder';

class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
  }

  render () {
    let game = this.props.game;
    if (!this.props.game.info || !this.props.hPlayers[0] || !this.props.vPlayers[0]) {
      console.log(this.props);
      return <div> Loading ... </div>
    } else {

      return (
        <div style={{marginBottom: 50}}>
        <InfoTable />
        <Tab menu={{ secondary: true, pointing: true }} panes={[
          {menuItem: 'Ratings Tables', render: () =>
            <Tab.Pane>
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
          {menuItem: 'Impact Players', render: () =>
            <Tab.Pane>
              <Grid columns={2}>
                <Grid.Row>
                  <Grid.Column>
                    <Segment raised textAlign="center"
                      style={{backgroundColor: this.props.vColors.active, color: '#E9E9E9', border: `solid 3px ${this.props.vColors.secondary}`}}
                    > <b>{game.info.v[0].tc.toUpperCase()}</b> On/Off Court Deltas </Segment>
                    <ImpactTable
                      players={game.vBetOn}
                      sortedBy={'netRtgDelta'}
                      title={'Net Rating: BET ON'}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <Segment raised textAlign="center"
                      style={{backgroundColor: this.props.hColors.active, color: '#E9E9E9', border: `solid 3px ${this.props.hColors.secondary}`}}
                    > <b>{game.info.h[0].tc.toUpperCase()}</b> On/Off Court Deltas </Segment>
                    <ImpactTable
                      players={game.hBetOn}
                      sortedBy={'netRtgDelta'}
                      title={'Net Rating: BET ON'}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <ImpactTable
                      players={game.vBetOff}
                      sortedBy={'netRtgDelta'}
                      title={'Net Rating: BET OFF'}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <ImpactTable
                      players={game.hBetOff}
                      sortedBy={'netRtgDelta'}
                      title={'Net Rating: BET OFF'}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Segment raised textAlign="center"
                      style={{backgroundColor: this.props.vColors.active, color: '#E9E9E9', border: `solid 3px ${this.props.vColors.secondary}`}}
                    > <b>{game.info.v[0].tc.toUpperCase()}</b> On/Off Court Deltas </Segment>
                    <ImpactTable
                      players={game.vBetOver}
                      sortedBy={'total_rating'}
                      title={'Total: BET OVER'}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <Segment raised textAlign="center"
                      style={{backgroundColor: this.props.hColors.active, color: '#E9E9E9', border: `solid 3px ${this.props.hColors.secondary}`}}
                    > <b>{game.info.h[0].tc.toUpperCase()}</b> On/Off Court Deltas </Segment>
                    <ImpactTable
                      players={game.hBetOver}
                      sortedBy={'total_rating'}
                      title={'Total: BET OVER'}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <ImpactTable
                      players={game.vBetUnder}
                      sortedBy={'total_rating'}
                      title={'Total: BET UNDER'}
                    />
                  </Grid.Column>
                  <Grid.Column>
                    <ImpactTable
                      players={game.hBetUnder}
                      sortedBy={'total_rating'}
                      title={'Total: BET UNDER'}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Tab.Pane>
          },
          {menuItem: 'Rotation Players', render: () =>
            <Tab.Pane>
              <RotationTable
                players={game.rotPlayers}
              />
            </Tab.Pane>
          },
          {menuItem: 'Traditional Stats', render: () =>
            <Tab.Pane>
              <StatTable
                game={game}
              />
            </Tab.Pane>
          },
          {menuItem: 'Odds vs. Ratings', render: () =>
            <Tab.Pane>
              <OddsRating
                game={game}
              />
            </Tab.Pane>
          }
        ]}/>

        <br />
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
