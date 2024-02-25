import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Sidebar, Menu, Item, Button, Icon, Transition } from "semantic-ui-react";
import logos from '../modules/logos';

import { fetchGame } from "../actions";

class TodaysGames extends React.Component {
  state = {
    visible: true
  };

  hideSidebar = () => {
    this.setState({ visible: false});
  };

  fetchGame = (id) => {
    this.props.fetchGame(id);
  }

  showSidebar = () => this.setState({ visible: true});

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
          <Item.Image size="mini" src={logos[game.v[0].ta]} />
          {game.v[0].ta}
          <br />
          <Item.Image size="mini" src={logos[game.h[0].ta]} />
          {game.h[0].ta}
        </Menu.Item>
      );
    });
  };

  render() {
    const { todaysGames } = this.props;
    return (
      <div>
        <Sidebar animation={"push"} direction={"bottom"} visible={this.state.visible}>
          <Menu fluid widths={todaysGames.length > 11 ? todaysGames.length : todaysGames.length + 1} inverted={true}>
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
        <Transition visible={!this.state.visible} animation='fly right' duration={1200}>
          <Button
            size='tiny' circular secondary
            onClick={this.showSidebar}
            style={{
              position: 'fixed',
              bottom: 50,
              left: -45,
              transform: 'rotate(-90deg)'
            }}
          >
            TODAY'S  GAMES
          </Button>
        </Transition>
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
