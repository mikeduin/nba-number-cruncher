import React from "react";
import moment from 'moment';
import { connect } from "react-redux";
import { changeTeamColor } from "../../actions";
import { Button, Icon, Table, Grid } from 'semantic-ui-react';

class InfoTable extends React.Component {
  oddsFormat = value => {
    if (value > 0) {
      return `+${value}`;
    } else {
      return value;
    }
  }

  totalFormat = value => {
    if (value) {
      return `[O/U ${value}]`;
    } else {
      return '';
    }
  }

  toggleColor = (hv) => {
    let teamColors = this.props[`${hv}Colors`];
    let current = teamColors.active;
    let colorObj = {}

    if (current === teamColors.color_one) {
      colorObj.active = teamColors.color_two;
      colorObj.secondary = teamColors.color_one;
    } else {
      colorObj.active = teamColors.color_one;
      colorObj.secondary = teamColors.color_two;
    }

    this.props.changeTeamColor(hv, colorObj);
  };

  formatMatchup (res, hv = null) {
    let game = this.props.game;
    if (!hv) {
      return (
        <div key={res.gcode} style={{fontSize: 10}}>
          {moment(res.gdte).format('M/D')}:
          <a target='blank' href={`https://www.nba.com/games/${res.gcode}#/matchup`}>
            <div> {res.v[0].ta} {res.v[0].s} @  </div>
            <div> {res.h[0].ta} {res.h[0].s} </div>
          </a>
        </div>
      )
    } else {
      if (res.stt === 'Final') {
        if (res.h[0].ta === game.info[`${hv}`][0].ta) {
          return (
            <a target='blank' href={`https://www.nba.com/games/${res.gcode}#/matchup`}>
              <div> vs. {res.v[0].ta} </div>
              <div> {res.h[0].s} - {res.v[0].s} </div>
            </a>
          )
        } else {
          return (
            <a target='blank' href={`https://www.nba.com/games/${res.gcode}#/matchup`}>
              <div> @ {res.h[0].ta} </div>
              <div> {res.v[0].s} - {res.h[0].s} </div>
            </a>
          )
        }
      } else {
        if (res.h[0].ta === game.info[`${hv}`][0].ta) {
          return (
            <div>
              <div> vs. {res.v[0].ta} </div>
            </div>
          )
        } else {
          return (
            <div>
              <div> @ {res.h[0].ta} </div>
            </div>
          )
        }
      }
    }
  }

  dateResult = (hv, date) => {
    let res = this.props.game[`${hv}Obj`].sched.find(entry => {
      return entry.gdte === date;
    });

    if (res) {
      return this.formatMatchup(res, hv);
    } else {
      return '';
    }
  }

  returnMatchups = () => {
    return (
      <Grid columns={this.props.game.matchups.length}>
        {this.props.game.matchups.map(game => {
          if (game.stt === 'Final') {
            return this.formatMatchup(game);
          };
        })}
      </Grid>
    )
  }

  render() {
    let game = this.props.game;
    return (
        <Table celled structured>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan="2" textAlign='center'> PREVIOUS MATCHUPS </Table.HeaderCell>
              <Table.HeaderCell colSpan="3" textAlign='center'> ODDS </Table.HeaderCell>
              <Table.HeaderCell colSpan="10" textAlign='center'> SCHEDULE WINDOW </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell colSpan="2" textAlign='center'>  {this.returnMatchups()} </Table.HeaderCell>
              <Table.HeaderCell> Game <br /> {this.totalFormat(game.odds.total_full)} </Table.HeaderCell>
              <Table.HeaderCell> 1H <br /> {this.totalFormat(game.odds.total_1h)} </Table.HeaderCell>
              <Table.HeaderCell> 1Q <br /> {this.totalFormat(game.odds.total_1q)} </Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(8, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(7, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(6, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(5, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(4, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(3, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(2, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().subtract(1, 'days').format('M/D')}</Table.HeaderCell>
              <Table.HeaderCell> {moment().format('M/D')} </Table.HeaderCell>
              <Table.HeaderCell> {moment().add(1, 'days').format('M/D')}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body style={{fontSize: 11}}>
            <Table.Row>
              <Table.Cell style={{fontWeight: 700, backgroundColor: 'rgb(0,0,0,.03)'}}> A </Table.Cell>
              <Table.Cell
                style={{
                  backgroundColor: this.props.vColors.active,
                  color: "white"
                }}
              >
                {game.info.v[0].tc} {game.info.v[0].tn}
                <Button style={{
                  backgroundColor: this.props.vColors.secondary,
                  marginLeft: 10
                }}
                onClick={() => this.toggleColor('v')}>
                  <Icon name="sync" inverted />
                </Button>
              </Table.Cell>
              <Table.Cell> {this.oddsFormat(game.odds.away_spread_full)} <br /> {this.oddsFormat(game.odds.away_money_full)}</Table.Cell>
              <Table.Cell> {this.oddsFormat(game.odds.away_spread_1h)} <br /> {this.oddsFormat(game.odds.away_money_1h)}</Table.Cell>
              <Table.Cell> {this.oddsFormat(game.odds.away_spread_1q)} <br /> {this.oddsFormat(game.odds.away_money_1q)}</Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(8, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(7, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(6, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(5, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(4, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(3, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(2, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().subtract(1, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('v', (moment().add(1, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell style={{fontWeight: 700, backgroundColor: 'rgb(0,0,0,.03)'}}> H </Table.Cell>
              <Table.Cell
              style={{
                backgroundColor: this.props.hColors.active,
                color: "white"
              }}
              > {game.info.h[0].tc} {game.info.h[0].tn}
                <Button
                style={{
                  backgroundColor: this.props.hColors.secondary,
                  marginLeft: 10
                }}
                onClick={() => this.toggleColor('h')}>
                  <Icon inverted name="sync" />
                </Button>
              </Table.Cell>
              <Table.Cell> {this.oddsFormat(game.odds.home_spread_full)} <br /> {this.oddsFormat(game.odds.home_money_full)}</Table.Cell>
              <Table.Cell> {this.oddsFormat(game.odds.home_spread_1h)} <br /> {this.oddsFormat(game.odds.home_money_1h)}</Table.Cell>
              <Table.Cell> {this.oddsFormat(game.odds.home_spread_1q)} <br /> {this.oddsFormat(game.odds.home_money_1q)}</Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(8, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(7, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(6, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(5, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(4, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(3, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(2, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().subtract(1, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().format('YYYY-MM-DD')))}
              </Table.Cell>
              <Table.Cell>
                {this.dateResult('h', (moment().add(1, 'days').format('YYYY-MM-DD')))}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
    );
  }
}

const mapStateToProps = state => {
  return {
    game: state.game,
    hColors: state.hColors,
    vColors: state.vColors
  };
}

export default connect(mapStateToProps, { changeTeamColor }) (InfoTable);
