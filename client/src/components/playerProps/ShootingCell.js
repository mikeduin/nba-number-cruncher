import React from 'react';
import { Table } from 'semantic-ui-react';

// Reusable Cell Component
const ShootingCell = ({ value, percentage, color, fontSize = 16, percentageFontSize = 12 }) => (
  <Table.Cell style={{ position: 'relative' }}>
    {percentage !== undefined && (
      <div style={{
        fontSize: percentageFontSize,
        position: 'absolute',
        top: 2,
        right: 2,
        color: color,
        fontWeight: 800,
      }}>
        {percentage}%
      </div>
    )}
    <div style={{ fontSize: fontSize }}>{value}</div>
  </Table.Cell>
);

export default ShootingCell;