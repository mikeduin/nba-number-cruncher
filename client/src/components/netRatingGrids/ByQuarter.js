import React from 'react';
import ReactTable from 'react-table';

const ByQuarter = props => {
  return (
    <ReactTable
      data={props.netRatings}
      defaultPageSize={2}
      showPaginationBottom={false}
      columns={[
        {
          Header: 'Net_Rtg by Q',
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

export default ByQuarter;
