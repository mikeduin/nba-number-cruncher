import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from "moment-timezone";
import './styles/gamblecast.css';
import BoxScore from './BoxScore';
import BoxScoreAccordion from './BoxScoreAccordion';
import { Header, Icon } from 'semantic-ui-react';
import { checkActiveGames, fetchActiveBoxScores, fetchDailyBoxScores, fetchPlayerProps, fetchWeek, setActiveDay } from '../actions';

const GambleCast = (props) => {
  const [playerProps, setPlayerProps] = React.useState(props.playerProps);

  useEffect(() => {
    if (!props.match.params.date) {
      let effectiveDay = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
      props.setActiveDay(effectiveDay);
      props.fetchWeek(effectiveDay);
    } else {
      props.setActiveDay(props.match.params.date);
      props.fetchWeek(props.match.params.date);
    }
    props.checkActiveGames();
    props.fetchDailyBoxScores();
    props.fetchActiveBoxScores();
    props.fetchPlayerProps();
    const intervalId = setInterval(() => {
      props.checkActiveGames();
      props.fetchActiveBoxScores();
      props.fetchPlayerProps();
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [props.match.params.date]);

  useEffect(() => {
    if (props.playerProps !== playerProps) {
      setPlayerProps(props.playerProps);
    }
  }, [props.playerProps]);

  const renderBoxScores = () => {
    const { gambleCast, games, playersMetadata } = props;
    if (games[0]) {
      return games.map((game, i) => {
        const hTid = game.h[0].tid;
        const vTid = game.v[0].tid;
        return (
          <div key={game.gid}>
            <BoxScore game={game} />
            <BoxScoreAccordion
              // key={`props-${game.gid}-${i}]`} 
              game={game}
              playersMetadata={playersMetadata.filter(player => player.team_id == hTid || player.team_id == vTid)}
              boxScore={gambleCast[`live_${game.gid}`]}
            />
          </div>
        );
      });
    } else {
      return 'no games today';
    }
  };

  if (!props.activeDay) {
    return <div> Loading ... </div>
  } else {
    return (
      <div style={{paddingBottom: 150}} className='gamblecast-main'>
        <Header size='huge'>
          <div style={{display: 'inline'}}>
            <Link to={`/gamblecast/${moment(props.activeDay).subtract(1, 'days').format('YYYY-MM-DD')}`}>
              <Icon className="column" name='angle left' size='large'/>
            </Link>
            Games of {moment(props.activeDay).format('MM/DD')}
            <Link to={`/gamblecast/${moment(props.activeDay).add(1, 'days').format('YYYY-MM-DD')}`}>
              <Icon className="column" name='angle right' size='large'/>
            </Link>
          </div> 
        </Header>
        {renderBoxScores()}
      </div>
    )
  }

}

const mapStateToProps = state => {
  return {
    games: state.todaysGames,
    gambleCast: state.gambleCast,
    activeDay: state.activeDay,
    activeGames: state.activeGames,
    playerProps: state.playerProps,
    playersMetadata: state.playersMetadata
  }
}

export default connect(mapStateToProps, {
  checkActiveGames,
  fetchActiveBoxScores,
  fetchDailyBoxScores,
  fetchPlayerProps,
  fetchWeek,
  setActiveDay,
})(GambleCast);
