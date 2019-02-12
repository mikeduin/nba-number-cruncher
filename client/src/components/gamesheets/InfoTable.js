import React from "react";
import moment from 'moment';
import { connect } from "react-redux";
import { changeTeamColor } from "../../actions";
import { Button } from 'semantic-ui-react';

class InfoTable extends React.Component {
  componentDidMount() {
    // console.log(this.props);
    console.log('in comp did mount ', this.props.game);
  };

  toggleColor = (e) => {
    console.log(e.target.value);

    // if (teamInfo.color === teamInfo.color_active) {
    //   let color = teamInfo.color_2;
    // } else {
    //   let color = teamInfo.color;
    // };
    this.props.changeTeamColor();
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
    console.log(this.props.game);
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
                  backgroundColor: game.vObj.info.color_active,
                  color: "white"
                }}
              >
                {game.info.v[0].tc} {game.info.v[0].tn}
                <button className="ui button" value={'vObj'} onClick={this.toggleColor}>
                  <i className="sync alternate icon" />
                </button>
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
              <td> {game.info.h[0].tc} {game.info.h[0].tn}
                <Button value={'vObj'} onClick={this.toggleColor}>
                  <i className="sync alternate icon" />
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
    game: state.game
  };
}

export default connect(mapStateToProps, { changeTeamColor }) (InfoTable);
