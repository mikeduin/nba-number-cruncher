import React from 'react';
import ReactTable from 'react-table';

const ByRotation = props => {
  return (
    <ReactTable
      data={props.netRatings}
      defaultPageSize={2}
      showPaginationBottom={false}
      columns={[
        {
          Header: 'Net_Rtg by Rotation',
          accessor: 'team_name',
          width: 150
        },
        {
          Header: 'Full Roster',
          columns: [
            {
              Header: 'Season',
              accessor: 'team_full',
              maxWidth: 60,
              Cell: row => (
                <span style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#CB1844'
                }}>
                  { row.value }
                </span>
              )
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
          Header: 'Bench vs. Starter Delta',
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
  )
}

export default ByRotation;
