import React from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Dimmer, Image, Card } from 'semantic-ui-react';
import logos from '../modules/logos';

class ScheduleCard extends React.Component {
  state = {}

  handleShow = () => this.setState({ active: true })
  handleHide = () => this.setState({ active: false })

  render() {
    const game = this.props.game;
    const { active } = this.state
    const content = (
      <div>
        Go to {game.v[0].ta} @ {game.h[0].ta} Gamesheet
      </div>
    )

    return (
      <Card>
        <Link className="header" to={`/gamesheet/${game.gid}`}>
          <Dimmer.Dimmable
            dimmed={ active }
            dimmer={{ active, content }}
            onMouseEnter={this.handleShow}
            onMouseLeave={this.handleHide}
            style={{display: 'inline-flex'}}
          >
            <Image src={logos[game.v[0].ta]} style={{maxWidth: 120}} />
            <Image src={logos[game.h[0].ta]} style={{maxWidth: 120}} />
          </Dimmer.Dimmable>
         </Link>
        <Card.Content>
          <Link className="header" to={`/gamesheet/${game.gid}`}>
            {game.v[0].tc} {game.v[0].tn} @ {game.h[0].tc} {game.h[0].tn}
          </Link>
          <Card.Meta>
            <div className="date"> {moment(game.etm).format("M/D/YY")} </div>
            <div className="date"> {moment(game.etm).format("h:mm A")} </div>
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Link className="header" to={`/gamesheet/${game.gid}`}>
            <div>
              <i className="chart bar outline icon" />
              {game.v[0].ta} @ {game.h[0].ta} Gamesheet
            </div>
          </Link>

        </Card.Content>
      </Card>
    )
  }
}

export default ScheduleCard;
