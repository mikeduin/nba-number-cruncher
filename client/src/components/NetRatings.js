import React from 'react';
import { connect } from 'react-redux';
import { fetchNetRatings } from '../actions';

class NetRatings extends React.Component {
  componentDidMount() {
    console.log('net ratings component has mounted');
    this.props.fetchNetRatings();
  }


  render () {
    return <div> This is Net Ratings </div>
  }
}

const mapStateToProps = state => {
  return { netRatings: state.NetRatings };
}

export default connect (mapStateToProps, {fetchNetRatings}) (NetRatings);
