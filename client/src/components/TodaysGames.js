import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Sidebar, Menu, Item } from 'semantic-ui-react';

class TodaysGames extends React.Component {

  componentDidMount () {
    console.log(this.props);
  }

  mapTodaysGames = () => {
    return this.props.todaysGames.map(game => {
      return (
        <Menu.Item key={game.id} as={Link} to={`/gamesheet/${game.gid}`} style={{display: 'inline'}}>
          <Item.Image size='mini' src={`/images/logos/${game.v[0].ta}.svg`}/>
          {game.v[0].ta}
          <br />
          <Item.Image size='mini' src={`/images/logos/${game.h[0].ta}.svg`}/>
          {game.h[0].ta}
        </Menu.Item>
      )
    })
  }

  render () {
    if (!this.props.todaysGames[1]) {
      return (<div> Blah </div>)
    } else {
      return (
        <div>
          <Sidebar animation={'push'} direction={'bottom'} visible={true}>
            <Menu inverted={true}>
              <Menu.Item> TODAY'S <br /> GAMES <br /> </Menu.Item>
              {this.mapTodaysGames()}
            </Menu>
          </Sidebar>
        </div>
      )
    }
  }
}

const mapStateToProps = state => {
  return {
    todaysGames: state.todaysGames
  }
}

export default connect (mapStateToProps, {}) (TodaysGames);
