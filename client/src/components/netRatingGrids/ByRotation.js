import React from 'react';
import ReactTable from 'react-table';

const ByRotation = props => {
  let findColor = (value) => {
    if (value < -17.49) {
      return 'rgb(255,0,0)';
    } else if (value > -17.5 && value < -9.99) {
      return 'rgb(255,51,51)';
    } else if (value > -10 && value < -5.99) {
      return 'rgb(255,102,102)';
    } else if (value > -6 && value < -2.99) {
      return 'rgb(255,153,153)';
    } else if (value > -3 && value < 0) {
      return 'rgb(255,204,204)';
    } else if (value > 0 && value < 3) {
      return 'rgb(211,232,211)';
    } else if (value > 2.99 && value < 6) {
      return 'rgb(167,209,167)';
    } else if (value > 5.99 && value < 10) {
      return 'rgb(122,185,122)';
    } else if (value > 9.99 && value < 17.5) {
      return 'rgb(78,162,78)';
    } else if (value > 17.49) {
      return 'rgb(34,139,34)';
    }
  };

  // ReactTable doesn't like this so far ... 
  let resultSet = (header, accessor) => {
    return {
      Header: header,
      Accessor: accessor,
      maxWidth: 60,
      Cell: row => (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: findColor(row.value)
        }}>
          <span>
            { row.value }
          </span>
        </div>
      )
    }
  }

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
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L5',
              accessor: 'team_l5',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L10',
              accessor: 'team_l10',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L15',
              accessor: 'team_l15',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            }
          ]
        },
        {
          Header: 'Starters',
          columns: [
            {
              Header: 'Season',
              accessor: 'starters_full',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L5',
              accessor: 'starters_l5',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L10',
              accessor: 'starters_l10',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L15',
              accessor: 'starters_l15',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            }
          ]
        },
        {
          Header: 'Bench',
          columns: [
            {
              Header: 'Season',
              accessor: 'bench_full',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L5',
              accessor: 'bench_l5',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L10',
              accessor: 'bench_l10',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L15',
              accessor: 'bench_l15',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            }
          ]
        },
        {
          Header: 'Bench vs. Starter Delta',
          columns: [
            {
              Header: 'Season',
              accessor: 'bs_delta_full',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L5',
              accessor: 'bs_delta_l5',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L10',
              accessor: 'bs_delta_l10',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            },
            {
              Header: 'L15',
              accessor: 'bs_delta_l15',
              maxWidth: 60,
              Cell: row => (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: findColor(row.value)
                }}>
                  <span>
                    { row.value }
                  </span>
                </div>
              )
            }
          ]
        }
      ]}
    />
  )
}

export default ByRotation;
