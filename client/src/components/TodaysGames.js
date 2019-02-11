import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Sidebar, Menu, Item, Button, Icon } from "semantic-ui-react";

import { fetchGame } from "../actions";

class TodaysGames extends React.Component {
  state = { visible: true };

  componentDidMount() {
    console.log(this.props);
  }

  hideSidebar = () => {
    console.log('gets here');
    this.setState({ visible: false });
  };
  showSidebar = () => this.setState({ visible: true });

  mapTodaysGames = () => {
    return this.props.todaysGames.map(game => {
      return (
        <Menu.Item
          key={game.id}
          as={Link}
          to={`/gamesheet/${game.gid}`}
          style={{ display: "inline" }}
          onClick={this.props.fetchGame(game.gid)}
        >
          <Item.Image size="mini" src={`/images/logos/${game.v[0].ta}.svg`} />
          {game.v[0].ta}
          <Item.Image size="mini" src={`/images/logos/${game.h[0].ta}.svg`} />
          {game.h[0].ta}
        </Menu.Item>
      );
    });
  };

  render() {
    return (
      <div>
        <Sidebar animation={"push"} direction={"bottom"} visible={this.state.visible}>
          <Menu inverted={true}>
            <Menu.Item
              style={{ textAlign: "center" }}
              onClick={this.hideSidebar}
            >
              {" "}
              TODAY'S <br /> GAMES <br />
              (click to hide)
            </Menu.Item>
            {this.mapTodaysGames()}
          </Menu>
        </Sidebar>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    todaysGames: state.todaysGames
  };
};

export default connect(
  mapStateToProps,
  { fetchGame }
)(TodaysGames);
