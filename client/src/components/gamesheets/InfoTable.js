import React from "react";
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

  render() {
    console.log(this.props.game);
    let game = this.props.game;
    return (
      <div>
        <table className="ui celled table">
          <thead>
            <tr>
              <th colSpan="2"> </th>
              <th colSpan="3"> 1Q </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td> A </td>
              <td
                style={{
                  backgroundColor: game.visObj.info.color_active,
                  color: "white"
                }}
              >
                {game.info.v[0].tc} {game.info.v[0].tn}
                <button className="ui button" value={'visObj'} onClick={this.toggleColor}>
                  <i className="sync alternate icon" />
                </button>
              </td>
              <td>

              </td>
            </tr>
            <tr>
              <td> H </td>
              <td> {game.info.h[0].tc} {game.info.h[0].tn}
                <Button value={'visObj'} onClick={this.toggleColor}>
                  <i className="sync alternate icon" />
                </Button>
              </td>
              <td>

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
