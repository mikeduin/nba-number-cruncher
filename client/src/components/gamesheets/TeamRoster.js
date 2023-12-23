import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'semantic-ui-react';

class TeamRoster extends React.Component {
  componentDidMount () {
    console.log('TeamRoster loads');
    console.log(this.props);
  }

  addPlayers = (team, segment) => {
    let seg='full';
    // console.log('team is ', team);
    return team.map(player => {
      return (
        <Table.Row key={player.id}>
          <Table.Cell> {player.player_name} </Table.Cell>
          <Table.Cell> {player.min_full} </Table.Cell>
          <Table.Cell> {player.net_rtg_full} </Table.Cell>
          <Table.Cell> {player.off_rtg_full} </Table.Cell>
          <Table.Cell> {player.def_rtg_full} </Table.Cell>
          <Table.Cell> {player.pace_full} </Table.Cell>
        </Table.Row>
      )
    })
  }

  render () {
    let game = this.props.game;
    let hv = this.props.hv;

    if (!this.props.players) {
      return <div> Loading ... </div>
    } else {
      return (
        <Table compact style={{fontSize: 10}}>
          <Table.Header>
            <Table.Row textAlign='center'>
              <Table.HeaderCell
                style={{backgroundColor: this.props[`${hv}Colors`].active, color: 'white'}}
                colSpan={6}
              > {game.info[`${hv}`][0].tc} {game.info[`${hv}`][0].tn}
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell width={10}> Player </Table.HeaderCell>
              <Table.HeaderCell> MPG </Table.HeaderCell>
              <Table.HeaderCell> NetRtg </Table.HeaderCell>
              <Table.HeaderCell> OffRtg </Table.HeaderCell>
              <Table.HeaderCell> DefRtg </Table.HeaderCell>
              <Table.HeaderCell> Pace </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.addPlayers(this.props.players, 'full')}
          </Table.Body>
        </Table>
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

export default connect (mapStateToProps) (TeamRoster);
