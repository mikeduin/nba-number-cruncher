import React from 'react';
import ReactTable from 'react-table';

import { connect } from 'react-redux';
import { fetchGame } from '../actions';

class GameSheet extends React.Component {
  componentDidMount () {
    this.props.fetchGame(this.props.match.params);
    console.log(this.props)
  }

  buildNetRatingsTable () {
    return (
      <ReactTable
        data={this.props.game.teams}
        defaultPageSize={2}
        showPaginationBottom={false}
        columns={[
          {
            Header: 'NET RATING BY QUARTER',
            accessor: 'team_name',
            width: 150
          },
          {
            Header: '1Q',
            columns: [
              {
                Header: 'Season',
                accessor: '1q_full',
                maxWidth: 60
              },
              {
                Header: 'L5',
                accessor: '1q_l5',
                maxWidth: 60
              },
              {
                Header: 'L10',
                accessor: '1q_l10',
                maxWidth: 60
              },
              {
                Header: 'L15',
                accessor: '1q_l15',
                maxWidth: 60
              }
            ]
          },
          {
            Header: '2Q',
            columns: [
              {
                Header: 'Season',
                accessor: '2q_full',
                maxWidth: 60
              },
              {
                Header: 'L5',
                accessor: '2q_l5',
                maxWidth: 60
              },
              {
                Header: 'L10',
                accessor: '2q_l10',
                maxWidth: 60
              },
              {
                Header: 'L15',
                accessor: '2q_l15',
                maxWidth: 60
              }
            ]
          },
          {
            Header: '3Q',
            columns: [
              {
                Header: 'Season',
                accessor: '3q_full',
                maxWidth: 60
              },
              {
                Header: 'L5',
                accessor: '3q_l5',
                maxWidth: 60
              },
              {
                Header: 'L10',
                accessor: '3q_l10',
                maxWidth: 60
              },
              {
                Header: 'L15',
                accessor: '3q_l15',
                maxWidth: 60
              }
            ]
          },
          {
            Header: '4Q',
            columns: [
              {
                Header: 'Season',
                accessor: '4q_full',
                maxWidth: 60
              },
              {
                Header: 'L5',
                accessor: '4q_l5',
                maxWidth: 60
              },
              {
                Header: 'L10',
                accessor: '4q_l10',
                maxWidth: 60
              },
              {
                Header: 'L15',
                accessor: '4q_l15',
                maxWidth: 60
              }
            ]
          }
        ]}
      />
    )
  }

  render () {
    if (!this.props.game.info) {
      return <div> Loading ... </div>
    } else {
      let game = this.props.game;
      return (
        <div>
        <h2 className="ui center aligned icon header">
          <i className="circular users icon"></i>
          {game.info.v[0].tc} {game.info.v[0].tn} @ {game.info.h[0].tc} {game.info.h[0].tn}
        </h2>
        {this.buildNetRatingsTable()}
        </div>
      )
    }
  }

}

const mapStateToProps = state => {
  return {
    game: state.game
  }
}

export default connect(mapStateToProps, {fetchGame}) (GameSheet);
