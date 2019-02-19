import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setActiveDay } from '../actions';
import _ from 'lodash';
import moment from 'moment';

class Header extends React.Component {
  componentWillMount() {
    this.resetComponent();
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: ''})

  // Will need to change result.title !!!
  handleResultSelect = (e, {result }) => this.setState({ value: result.title })

  handleSearchChange = (e, {value }) => {
    this.setState({ isLoading: true, value})

    setTimeout(() => {
      if (this.state.value.length < 1) {return this.resetComponent()}

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      // Will need to change result.title !!!
      const isMatch = result => re.test(result.title)

      this.setState({
        isLoading: false,
        // 'source' here references data
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
      <div className="ui pointing menu">
        <Link to="/schedule" className="item" onClick={this.setActiveDay}>
          Schedule
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
        <Link to="/netratings" className="item">
          Daily Digest
        </Link>
        <Search
          loading={isLoading}
          onResultSelect={this.handleResultSelect}
          onSearchChange={_.debounce(this.handleSearchChange, 500, {leading: true})}
          results={results}
          value={value}
          {...this.props}
        />
      </div>
    )
  }

}

export default connect(null, { setActiveDay }) (Header);
