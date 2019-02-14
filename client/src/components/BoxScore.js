import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'semantic-ui-react';

class BoxScore extends React.Component {
  componentDidMount () {
    console.log(this.props);
  }

  render () {
    return (
      <div>
        <Table compact celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell> Teams </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell> away </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell> home </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    placeholder: null
  }
}

export default connect (mapStateToProps, { }) (BoxScore);
