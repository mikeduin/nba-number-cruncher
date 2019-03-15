import React from 'react';
import { Table } from 'semantic-ui-react';

const OddsRating = (props) => {
  const hInfo = props.game.hObj.info;
  const vInfo = props.game.vObj.info;
  const hRatings = props.game.hObj.netRatings;
  const vRatings = props.game.vObj.netRatings;
  const odds = props.game.odds;

  const calcs = {
    vRatingFull: (vRatings['team_full']).toFixed(1),
    vRating1h: ((vRatings['1q_full'] + vRatings['2q_full']) / 4).toFixed(1),
    vRating1q: (vRatings['1q_full'] / 4).toFixed(1),
    vRating2q: (vRatings['2q_full'] / 4).toFixed(1),
    vRating2h: ((vRatings['3q_full'] + vRatings['4q_full']) / 4).toFixed(1),
    vRating3q: (vRatings['3q_full'] / 4).toFixed(1),
    vRating4q: (vRatings['4q_full'] / 4).toFixed(1),
    hRatingFull: (hRatings['team_full']).toFixed(1),
    hRating1h: ((hRatings['1q_full'] + hRatings['2q_full']) / 4).toFixed(1),
    hRating1q: (hRatings['1q_full'] / 4).toFixed(1),
    hRating2q: (hRatings['2q_full'] / 4).toFixed(1),
    hRating2h: ((hRatings['3q_full'] + hRatings['4q_full']) / 4).toFixed(1),
    hRating3q: (hRatings['3q_full'] / 4).toFixed(1),
    hRating4q: (hRatings['4q_full'] / 4).toFixed(1),
    hDeltaFull: (hRatings['team_full'] - vRatings['team_full']).toFixed(1),
    hDelta1h: (((hRatings['1q_full'] + hRatings['2q_full']) / 4) -
      ((vRatings['1q_full'] + vRatings['2q_full']) / 4)).toFixed(1),
    hDelta1q: ((hRatings['1q_full'] / 4) - (vRatings['1q_full'] / 4)).toFixed(1),
    hDelta2q: ((hRatings['2q_full'] / 4) - (vRatings['2q_full'] / 4)).toFixed(1),
    hDelta2h: (((hRatings['3q_full'] + hRatings['4q_full']) / 4) -
      ((vRatings['3q_full'] + vRatings['4q_full']) / 4)).toFixed(1),
    hDelta3q: ((hRatings['3q_full'] / 4) - (vRatings['3q_full'] / 4)).toFixed(1),
    hDelta4q: ((hRatings['4q_full'] / 4) - (vRatings['4q_full'] / 4)).toFixed(1),
    hHcaFull: ((hRatings['team_full'] - vRatings['team_full']) + 6).toFixed(1),
    hHca1h: ((((hRatings['1q_full'] + hRatings['2q_full']) / 4) -
      ((vRatings['1q_full'] + vRatings['2q_full']) / 4)) + 3).toFixed(1),
    hHca1q: (((hRatings['1q_full'] / 4) - (vRatings['1q_full'] / 4)) + 1.5).toFixed(1),
    hHca2q: (((hRatings['2q_full'] / 4) - (vRatings['2q_full'] / 4)) + 1.5).toFixed(1),
    hHca2h: ((((hRatings['3q_full'] + hRatings['4q_full']) / 4) -
      ((vRatings['3q_full'] + vRatings['4q_full']) / 4)) + 3).toFixed(1),
    hHca3q: (((hRatings['3q_full'] / 4) - (vRatings['3q_full'] / 4)) + 1.5).toFixed(1),
    hHca4q: (((hRatings['4q_full'] / 4) - (vRatings['4q_full'] / 4)) + 1.5).toFixed(1)
  }

  return (
    <div>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>  </Table.HeaderCell>
            <Table.HeaderCell> Game </Table.HeaderCell>
            <Table.HeaderCell> 1H </Table.HeaderCell>
            <Table.HeaderCell> 1Q </Table.HeaderCell>
            <Table.HeaderCell> 2Q </Table.HeaderCell>
            <Table.HeaderCell> 2H </Table.HeaderCell>
            <Table.HeaderCell> 3Q </Table.HeaderCell>
            <Table.HeaderCell> 4Q </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell> <b>(A)</b> { vInfo.name } Net Ratings </Table.Cell>
            <Table.Cell> { calcs.vRatingFull } </Table.Cell>
            <Table.Cell> { calcs.vRating1h } </Table.Cell>
            <Table.Cell> { calcs.vRating1q }</Table.Cell>
            <Table.Cell> { calcs.vRating2q } </Table.Cell>
            <Table.Cell> { calcs.vRating2h } </Table.Cell>
            <Table.Cell> { calcs.vRating3q } </Table.Cell>
            <Table.Cell> { calcs.vRating4q } </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell> <b>(H)</b> { hInfo.name } Net Ratings </Table.Cell>
            <Table.Cell> { calcs.hRatingFull } </Table.Cell>
            <Table.Cell> { calcs.hRating1h } </Table.Cell>
            <Table.Cell> { calcs.hRating1q } </Table.Cell>
            <Table.Cell> { calcs.hRating2q } </Table.Cell>
            <Table.Cell> { calcs.hRating2h } </Table.Cell>
            <Table.Cell> { calcs.hRating3q } </Table.Cell>
            <Table.Cell> { calcs.hRating4q } </Table.Cell>
          </Table.Row>
          <Table.Row style={{backgroundColor: '#E9E9E9'}}>
            <Table.Cell> <b>(H)</b> Delta </Table.Cell>
            <Table.Cell> { calcs.hDeltaFull } </Table.Cell>
            <Table.Cell> { calcs.hDelta1h } </Table.Cell>
            <Table.Cell> { calcs.hDelta1q } </Table.Cell>
            <Table.Cell> { calcs.hDelta2q } </Table.Cell>
            <Table.Cell> { calcs.hDelta2h } </Table.Cell>
            <Table.Cell> { calcs.hDelta3q } </Table.Cell>
            <Table.Cell> { calcs.hDelta4q } </Table.Cell>
          </Table.Row>
          <Table.Row style={{backgroundColor: '#DBDBDB', fontWeight: 600}}>
            <Table.Cell> <b>(H)</b> HCA Adjusted </Table.Cell>
            <Table.Cell> { calcs.hHcaFull } </Table.Cell>
            <Table.Cell> { calcs.hHca1h } </Table.Cell>
            <Table.Cell> { calcs.hHca1q } </Table.Cell>
            <Table.Cell> { calcs.hHca2q } </Table.Cell>
            <Table.Cell> { calcs.hHca2h } </Table.Cell>
            <Table.Cell> { calcs.hHca3q } </Table.Cell>
            <Table.Cell> { calcs.hHca4q } </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell> <b>(H)</b> Odds </Table.Cell>
            <Table.Cell> { odds.home_spread_full } </Table.Cell>
            <Table.Cell> { odds.home_spread_1h } </Table.Cell>
            <Table.Cell> { odds.home_spread_1q } </Table.Cell>
            <Table.Cell> { odds.home_spread_2q } </Table.Cell>
            <Table.Cell> { odds.home_spread_2h } </Table.Cell>
            <Table.Cell> { odds.home_spread_3q } </Table.Cell>
            <Table.Cell> { odds.home_spread_4q } </Table.Cell>
          </Table.Row>
          <Table.Row style={{ backgroundColor: '#BCBCBC', fontWeight: 800 }}>
            <Table.Cell> <b>(H) Advantage </b> </Table.Cell>
            <Table.Cell>
              { odds.home_spread_full ? (parseFloat(calcs.hHcaFull) + parseFloat(odds.home_spread_full)).toFixed(1) : null}
            </Table.Cell>
            <Table.Cell>
              { odds.home_spread_1h ? (parseFloat(calcs.hHca1h) + parseFloat(odds.home_spread_1h)).toFixed(1) : null}
            </Table.Cell>
            <Table.Cell>
              { odds.home_spread_1q ? (parseFloat(calcs.hHca1q) + parseFloat(odds.home_spread_1q)).toFixed(1) : null}
            </Table.Cell>
            <Table.Cell>
              { odds.home_spread_2q ? (parseFloat(calcs.hHca2q) + parseFloat(odds.home_spread_2q)).toFixed(1) : null}
            </Table.Cell>
            <Table.Cell>
              { odds.home_spread_2h ? (parseFloat(calcs.hHca2h) + parseFloat(odds.home_spread_2h)).toFixed(1) : null}
            </Table.Cell>
            <Table.Cell>
              { odds.home_spread_3q ? (parseFloat(calcs.hHca3q) + parseFloat(odds.home_spread_3q)).toFixed(1) : null}
            </Table.Cell>
            <Table.Cell>
              { odds.home_spread_4q ? (parseFloat(calcs.hHca4q) + parseFloat(odds.home_spread_4q)).toFixed(1) : null}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  )
}

export default OddsRating;
