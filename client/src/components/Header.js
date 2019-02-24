import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Item } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setActiveDay, fetchPlayerData } from '../actions';
import _ from 'lodash';
import moment from 'moment';

const resultRenderer = ({ player_name, player_id, team_abbreviation, min_full, net_rtg_full }) => {
  return (
    <Link to={`/player/${player_id}`}>
      <Item style={{padding: 0}}>
        <Item.Image size='medium' src={`/images/logos/${team_abbreviation}.svg`} />
        <Item.Content style={{marginRight: 0}}>
          <Item.Header> {player_name} </Item.Header>
          <Item.Description> {min_full} MPG </Item.Description>
          <Item.Description> {net_rtg_full} NET RTG </Item.Description>
        </Item.Content>
      </Item>
    </Link>
  )
};

class Header extends React.Component {
  componentWillMount() {
    this.resetComponent();
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: ''})

  handleResultSelect = (e, {result }) => {
    this.setState({ value: result.player_name   });
    this.props.fetchPlayerData(result.player_id);
    this.setState({ value: ''});
  }

  handleSearchChange = (e, {value }) => {
    let source = this.props.players;

    this.setState({ isLoading: true, value})

    setTimeout(() => {
      if (this.state.value.length < 1) {return this.resetComponent()}

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.player_name)

      this.setState({
        isLoading: false,
        results: _.filter(source, isMatch)
      })
    }, 300)
  }

  setActiveDay = () => {
    let today = moment().format('YYYY-MM-DD');
    this.props.setActiveDay(today);
  }

  render () {
    const { isLoading, value, results } = this.state;

    return (
      <Menu pointing secondary>
        <Link to="/" className="item">
          Home
        </Link>
        <Link to="/schedule" className="item" onClick={this.setActiveDay}>
          Schedule
        </Link>
        <Link to="" className="item">
          Daily Digest
        </Link>
        <Link to="/gamblecast" className="item">
          GambleCast
        </Link>
        <Link to="" className="item">
          Teams
        </Link>
        <Link to="" className="item">
          Tools
        </Link>
        <Link to="" className="item">
          Research
        </Link>
        <Link to="/netratings" className="item">
          Net Ratings
        </Link>
        <Search
          style={{position: 'absolute', right: '10%'}}
          loading={isLoading}
          onResultSelect={this.handleResultSelect}
          onSearchChange={_.debounce(this.handleSearchChange, 500, {leading: true})}
          results={results}
          value={value}
          resultRenderer={resultRenderer}
        />
      </Menu>
    )
  }
}

export default connect(null, { setActiveDay, fetchPlayerData }) (Header);
