import React from 'react';
import { connect } from 'react-redux';
import { fetchPlayerData } from '../../actions';
import { Header, Image, Tab, TabPane, Grid } from 'semantic-ui-react';
import ProfileTable from './ProfileTable';
import GameStints from './GameStints';
import BoxScoresByQuarter from './BoxScoresByQuarter';
import logos from '../../modules/logos';

class Player extends React.Component {
  componentDidMount () {
    this.props.fetchPlayerData(this.props.match.params.pid);
  }

  render () {
    if (!this.props.playerData.mappedData) {
      return <div> Loading . . . </div>
    } else {
      const player = this.props.playerData;
      const panes = [
        {
          menuItem: 'Stats by Quarter',
          render: () => <BoxScoresByQuarter boxScores={player.boxScoresByQuarter} team={player.mappedData.team_abbreviation}/>,
        },
        {
          menuItem: 'Rotation Patterns',
          render: () => <GameStints player={player} />,
        }
      ]

      return (
        <div>
          <Grid divided='vertically'>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header as='h1'>
                  <Image src={logos[player.mappedData.team_abbreviation]} />
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
            <Grid.Row>
              <Grid.Column width={16}>
                <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
              </Grid.Column>
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
