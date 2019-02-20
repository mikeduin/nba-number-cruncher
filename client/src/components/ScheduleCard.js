import React from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Button, Dimmer, Header, Image, Card } from 'semantic-ui-react'

class ScheduleCard extends React.Component {
  state = {}

  handleShow = () => this.setState({ active: true })
  handleHide = () => this.setState({ active: false })

  render() {
    const { active } = this.state
    const content = (
      <div>
        <Header as='h2' inverted>
          Title
        </Header>

        <Button primary>Add</Button>
        <Button>View</Button>
      </div>
    )

    const game = this.props.game;

    return (
      <Card>
        <Dimmer.Dimmable as={Image}
          src={`/images/logos/${game.h[0].ta}.svg`}
          dimmed={ active }
          dimmer={{ active, content }}
          onMouseEnter={this.handleShow}
          onMouseLeave={this.handleHide}
        />
        <Card.Content>
          <Link className="header" to={`/gamesheet/${game.gid}`}>
            {game.v[0].tc} {game.v[0].tn} @ {game.h[0].tc} {game.h[0].tn}
          </Link>
          <Card.Meta>
            <span className="date">
              {" "}
              {moment(game.etm).format("h:mm A")} EST{" "}
            </span>
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div>
            <i className="users icon" />
            More data here
          </div>
        </Card.Content>
      </Card>
    )
  }
}

export default ScheduleCard;
