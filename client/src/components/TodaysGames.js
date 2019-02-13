import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Sidebar, Menu, Item, Button, Icon } from "semantic-ui-react";

import { fetchGame } from "../actions";

class TodaysGames extends React.Component {
  state = { visible: true };

  hideSidebar = () => {
    this.setState({ visible: false });
  };

  fetchGame = (id) => {
    this.props.fetchGame(id);
  }

  showSidebar = () => this.setState({ visible: true });

  mapTodaysGames = () => {
    return this.props.todaysGames.map(game => {
      return (
        <Menu.Item
          key={game.gid}
          as={Link}
          to={`/gamesheet/${game.gid}`}
          style={{ display: "inline" }}
          onClick={() => {this.fetchGame(this.key)}}
          fitted='vertically'
        >
          <Item.Image size="mini" src={`/images/logos/${game.v[0].ta}.svg`} />
          {game.v[0].ta}
          <br />
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
          <Menu fluid widths={this.props.todaysGames.length+1} inverted={true}>
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
        <Button circular icon visible={!this.state.visible} onClick={this.showSidebar}>
          <Icon name='calendar alternate' />
        </Button>
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
