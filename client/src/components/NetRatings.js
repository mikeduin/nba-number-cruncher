import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";

import { connect } from "react-redux";
import { fetchNetRatings } from "../actions";

class NetRatings extends React.Component {
  componentDidMount() {
    console.log("net ratings component has mounted");
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
          columns={[
            {
              Header: 'Team',
              accessor: 'team_name'
            },
            {
              Header: 'Full Roster',
              columns: [
                {
                  Header: 'Season',
                  accessor: 'team_full'
                },
                {
                  Header: 'L5',
                  accessor: 'team_l5'
                },
                {
                  Header: 'L10',
                  accessor: 'team_l10'
                },
                {
                  Header: 'L15',
                  accessor: 'team_l15'
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
