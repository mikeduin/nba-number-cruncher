import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";

import { connect } from "react-redux";
import { fetchNetRatings } from "../actions";

class NetRatings extends React.Component {
  componentDidMount() {
    this.props.fetchNetRatings();
  }

  render() {
    return (
      <div>
        {" "}
        This is Net Ratings
        <ReactTable
          data={this.props.netRatings}
          defaultPageSize={30}
          pageSizeOptions={[30]}
          columns={[
            {
              Header: 'Team',
              accessor: 'team_name',
              minWidth: 150
            },
            {
              Header: 'Full Roster',
              columns: [
                {
                  Header: 'Season',
                  accessor: 'team_full',
                  maxWidth: 60
                },
                {
                  Header: 'L5',
                  accessor: 'team_l5',
                  maxWidth: 60
                },
                {
                  Header: 'L10',
                  accessor: 'team_l10',
                  maxWidth: 60
                },
                {
                  Header: 'L15',
                  accessor: 'team_l15',
                  maxWidth: 60
                }
              ]
            },
            {
              Header: 'Starters',
              columns: [
                {
                  Header: 'Season',
                  accessor: 'starters_full',
                  maxWidth: 60
                },
                {
                  Header: 'L5',
                  accessor: 'starters_l5',
                  maxWidth: 60
                },
                {
                  Header: 'L10',
                  accessor: 'starters_l10',
                  maxWidth: 60
                },
                {
                  Header: 'L15',
                  accessor: 'starters_l15',
                  maxWidth: 60
                }
              ]
            },
            {
              Header: 'Bench',
              columns: [
                {
                  Header: 'Season',
                  accessor: 'bench_full',
                  maxWidth: 60
                },
                {
                  Header: 'L5',
                  accessor: 'bench_l5',
                  maxWidth: 60
                },
                {
                  Header: 'L10',
                  accessor: 'bench_l10',
                  maxWidth: 60
                },
                {
                  Header: 'L15',
                  accessor: 'bench_l15',
                  maxWidth: 60
                }
              ]
            },
            {
              Header: 'Bench vs. Starters',
              columns: [
                {
                  Header: 'Season',
                  accessor: 'bs_delta_full',
                  maxWidth: 60
                },
                {
                  Header: 'L5',
                  accessor: 'bs_delta_l5',
                  maxWidth: 60
                },
                {
                  Header: 'L10',
                  accessor: 'bs_delta_l10',
                  maxWidth: 60
                },
                {
                  Header: 'L15',
                  accessor: 'bs_delta_l15',
                  maxWidth: 60
                }
              ]
            }
          ]}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { netRatings: state.netRatings };
};

export default connect(
  mapStateToProps,
  { fetchNetRatings }
)(NetRatings);
