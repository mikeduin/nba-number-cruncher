// <VictoryChart>
//   <VictoryAxis crossAxis
//     domain={[-20, 20]}
//     orientation={'top'}
//   />
//   <VictoryAxis dependentAxis
//     tickValues={['1Q', '2Q', '3Q', '4Q']}
//     style={{
//       axis: {
//         strokeWidth: 80,
//         stroke: 'white',
//         strokeLinecap: null
//       },
//       tickLabels: {
//         padding: -20
//       }
//     }}
//   />
//   <VictoryGroup horizontal offset={20}>
//     <VictoryBar data={dataSetOne} />
//     <VictoryBar data={dataSetTwo} />
//   </VictoryGroup>
// </VictoryChart>


const dataSetOne = [
  {x: 1, y: 10.6},
  {x: 2, y: 14},
  {x: 3, y: -4},
  {x: 4, y: 7}
];

const dataSetTwo = [
  {x: 1, y: 4},
  {x: 2, y: 8},
  {x: 3, y: -4},
  {x: 4, y: -12}
];
