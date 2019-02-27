import React from 'react';

class ImpactTable extends React.Component {
  

  render () {
    return (
      <div> this is impact table </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    game: this.state.game,
    hColors: state.hColors,
    vColors: state.vColors
  }
}

export default connect(mapStateToProps) (ImpactTable);
