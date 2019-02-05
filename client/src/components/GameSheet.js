import React from 'react';

class GameSheet extends React.Component {
  componentDidMount () {
    console.log(this.props.match.params);
  }

  render () {
    return (
      <div> Game Sheet </div>
    )
  }

}

export default GameSheet;
