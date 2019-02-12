import React from "react";
import moment from 'moment';
import { connect } from "react-redux";
import { changeTeamColor } from "../../actions";
import { Button, Icon } from 'semantic-ui-react';

class InfoTable extends React.Component {
  componentDidMount() {
    // console.log(this.props);
    console.log('in comp did mount ', this.props.game);
  };

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
            <div>
              <div> vs. {res.v[0].ta} </div>
              <div> {res.h[0].s} - {res.v[0].s} </div>
            </div>
          )
        } else {
          return (
            <div>
              <div> @ {res.h[0].ta} </div>
              <div> {res.v[0].s} - {res.h[0].s} </div>
            </div>
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
                <Button style={{backgroundColor: this.props.vColors.secondary}}

                onClick={() => this.toggleColor('v')}>
                  <Icon name="sync" inverted />
                </Button>
              </td>
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
                <Button style={{backgroundColor: this.props.hColors.secondary}}

                onClick={() => this.toggleColor('h')}>
                  <Icon inverted name="sync" />
                </Button>
              </td>
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
