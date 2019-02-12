import React from "react";
import moment from 'moment';
import { connect } from "react-redux";
import { changeTeamColor } from "../../actions";
import { Button, Icon, Link } from 'semantic-ui-react';

class InfoTable extends React.Component {
  componentDidMount() {
    // console.log(this.props);
    console.log('in comp did mount ', this.props.game);
  };

  oddsFormat = value => {
    if (value > 0) {
      return `+${value}`;
    } else {
      return value;
    }
  }

  totalFormat = value => {
    if (value) {
      return `[${value}]`;
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

  dateResult = (hv, date) => {
    let game = this.props.game;

    let res = this.props.game[`${hv}Obj`].sched.find(entry => {
      return entry.gdte === date;
    });

    if (res) {
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
    } else {
      return '';
    }
  }

  render() {
    let game = this.props.game;
    return (
      <div>
        <table className="ui celled table">
          <thead>
            <tr>
              <th colSpan="2"> </th>
              <th colSpan="3" style={{textAlign: 'center'}}> ODDS </th>
              <th colSpan="10" style={{textAlign: 'center'}}> 10-DAY SCHEDULE WINDOW </th>
            </tr>
            <tr>
              <th colSpan="2"> </th>
              <th> Game <br /> {this.totalFormat(game.odds.total_full)} </th>
              <th> 1H <br /> {this.totalFormat(game.odds.total_1h)} </th>
              <th> 1Q <br /> {this.totalFormat(game.odds.total_1q)} </th>
              <th> {moment().subtract(6, 'days').format('M/D')}</th>
              <th> {moment().subtract(5, 'days').format('M/D')}</th>
              <th> {moment().subtract(4, 'days').format('M/D')}</th>
              <th> {moment().subtract(3, 'days').format('M/D')}</th>
              <th> {moment().subtract(2, 'days').format('M/D')}</th>
              <th> {moment().subtract(1, 'days').format('M/D')}</th>
              <th> {moment().format('M/D')} </th>
              <th> {moment().add(1, 'days').format('M/D')}</th>
              <th> {moment().add(2, 'days').format('M/D')}</th>
              <th> {moment().add(3, 'days').format('M/D')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td> A </td>
              <td
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
              </td>
              <td> {this.oddsFormat(game.odds.away_spread_full)} <br /> {this.oddsFormat(game.odds.away_money_full)}</td>
              <td> {this.oddsFormat(game.odds.away_spread_1h)} <br /> {this.oddsFormat(game.odds.away_money_1h)}</td>
              <td> {this.oddsFormat(game.odds.away_spread_1q)} <br /> {this.oddsFormat(game.odds.away_money_1q)}</td>
              <td>
                {this.dateResult('v', (moment().subtract(6, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().subtract(5, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().subtract(4, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().subtract(3, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().subtract(2, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().subtract(1, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().add(1, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().add(2, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('v', (moment().add(3, 'days').format('YYYY-MM-DD')))}
              </td>
            </tr>
            <tr>
              <td> H </td>
              <td
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
              </td>
              <td> {this.oddsFormat(game.odds.home_spread_full)} <br /> {this.oddsFormat(game.odds.home_money_full)}</td>
              <td> {this.oddsFormat(game.odds.home_spread_1h)} <br /> {this.oddsFormat(game.odds.home_money_1h)}</td>
              <td> {this.oddsFormat(game.odds.home_spread_1q)} <br /> {this.oddsFormat(game.odds.home_money_1q)}</td>
              <td>
                {this.dateResult('h', (moment().subtract(6, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().subtract(5, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().subtract(4, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().subtract(3, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().subtract(2, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().subtract(1, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().add(1, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().add(2, 'days').format('YYYY-MM-DD')))}
              </td>
              <td>
                {this.dateResult('h', (moment().add(3, 'days').format('YYYY-MM-DD')))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
