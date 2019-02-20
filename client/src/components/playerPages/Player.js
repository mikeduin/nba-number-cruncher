import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';
import { fetchPlayerData } from '../../actions';
import { Header, Image, Table, Grid } from 'semantic-ui-react';
import ProfileTable from './ProfileTable';
import CustomLabel from './CustomLabel';

import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryLabel, VictoryTooltip, PropTypes } from 'victory';

class Player extends React.Component {
  componentDidMount () {
    this.props.fetchPlayerData(this.props.match.params.pid);
  }

  gameStintRenderer = () => {
    let player = this.props.playerData;
    return player.gameStints.map(game => {
      let combData = [];
      game.game_stints.forEach(stint => {
        combData.push(
          [
            {x: stint[0], y: game.gdte},
            {x: stint[1], y: game.gdte},
            {x: stint[1], y: null}
          ]
        )
      })

      let data = _.flattenDeep(combData);



      return (
        <VictoryLine
          key={game.gid}
          data={data}
          labelComponent={ <CustomLabel/> }
          style={{
            data: {
              stroke: player.mappedData.color,
              strokeWidth: 3.5
            }
          }}
        />
      )
    })
  }

  render () {
    if (!this.props.playerData.mappedData) {
      return <div> Loading . . . </div>
    } else {
      let player = this.props.playerData;
      return (
        <div>
          <Grid divided='vertically'>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header as='h1'>
                  <Image src={`/images/logos/${player.mappedData.team_abbreviation}.svg`} />
                    <span> {player.mappedData.player_name.split(' ')[0]} </span>
                    <span style = {{
                      color: player.mappedData.color
                    }}> {player.mappedData.player_name.toUpperCase().split(' ')[1]} </span>
                </Header>
              </Grid.Column>
              <Grid.Column>
                <ProfileTable player={player}/>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
            <VictoryChart
              theme={VictoryTheme.material}
              sortOrder="ascending"
              >
              {this.gameStintRenderer()}
              <VictoryAxis
                dependentAxis
                invertAxis={true}
                tickFormat={
                  (x) => {
                    let game = player.gameStints.filter(game => game.gdte === x);

                    return (
                      `${moment(x).format('M/DD')}, ${game[0].v[0].ta} ${game[0].v[0].s} @ ${game[0].h[0].ta} ${game[0].h[0].s}`
                    )
                  }
                }
                style={{
                  tickLabels: {
                    fontSize: 3,
                    padding: 3
                  }
                }}
              />
              <VictoryAxis crossAxis
                tickValues={[720, 1440, 2160, 2880]}
                tickFormat={["2Q", "3Q", "4Q", "OT"]}
                style={{
                  tickLabels: {
                    fontSize: 5,
                    padding: 2
                  }
                }}
              />
            </VictoryChart>
            </Grid.Row>
          </Grid>


        </div>
      )
    }
  }

}

const mapStateToProps = state => {
  return {
    playerData: state.playerData,
  }
}

export default connect (mapStateToProps, {fetchPlayerData}) (Player);
