import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from "moment-timezone";
import './styles/gamblecast.css';
import BoxScore from './BoxScore';
import BoxScoreAccordion from './BoxScoreAccordion';
import { Header, Icon, Button } from 'semantic-ui-react';
import { toast } from 'react-semantic-toasts';
import { checkActiveGames, fetchActiveBoxScores, fetchDailyBoxScores, fetchPlayerProps, fetchWeek, setActiveDay } from '../actions';

const GambleCast = (props) => {
  const [playerProps, setPlayerProps] = React.useState(props.playerProps);
  const [isAutoPopulating, setIsAutoPopulating] = React.useState(false);
  const [isAutoPopulatingFD, setIsAutoPopulatingFD] = React.useState(false);

  useEffect(() => {
    console.log('props.match.params.date ', props.match.params.date);
    if (!props.match.params.date) {
      let effectiveDay = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
      props.setActiveDay(effectiveDay);
      props.fetchWeek(effectiveDay);
    } else {
      // props.setActiveDay(props.match.params.date);
      props.fetchWeek(props.match.params.date);
    }
    props.checkActiveGames();
    props.fetchDailyBoxScores();
    props.fetchActiveBoxScores();
    props.fetchPlayerProps();
    const intervalId = setInterval(() => {
      console.log('fetching box scores etc');
      props.checkActiveGames(); // this is currently making for three separate calls ...
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

  const autoPopulateDraftKings = async () => {
    setIsAutoPopulating(true);
    try {
      const response = await axios.post('/api/autopopulate-draftkings');
      
      if (response.data.success) {
        const { matched, unmatched, matchedGames, unmatchedGames } = response.data;
        
        // Show success message
        if (matched > 0) {
          toast({
            type: 'success',
            icon: 'check circle',
            color: 'green',
            title: 'DraftKings Auto-Population Complete',
            description: `✅ ${matched} game${matched !== 1 ? 's' : ''} matched${unmatched > 0 ? ` | ⚠️ ${unmatched} unmatched` : ''}`,
            animation: 'slide down',
            time: 5000
          });
        }
        
        // Show warning if some games couldn't be matched
        if (unmatched > 0) {
          const unmatchedList = unmatchedGames.map(g => `${g.awayTeam} @ ${g.homeTeam}`).join(', ');
          toast({
            type: 'warning',
            icon: 'exclamation triangle',
            color: 'orange',
            title: 'Some games not matched',
            description: `Could not match: ${unmatchedList}`,
            animation: 'slide down',
            time: 7000
          });
        }

        // Refresh the week data to show updated event IDs
        props.fetchWeek(props.activeDay);
      } else {
        throw new Error(response.data.message || 'Auto-population failed');
      }
    } catch (error) {
      toast({
        type: 'error',
        icon: 'exclamation',
        color: 'red',
        title: 'Error Auto-Populating DraftKings',
        description: error.response?.data?.error || error.message,
        animation: 'slide down',
        time: 5000
      });
    } finally {
      setIsAutoPopulating(false);
    }
  };

  /**
   * Auto-populate FanDuel event IDs for all games on the current day
   */
  const autoPopulateFanDuel = async () => {
    setIsAutoPopulatingFD(true);
    try {
      const response = await axios.get('/api/autopopulate-fanduel');
      
      if (response.data.success) {
        // Refresh the games data
        props.fetchWeek(props.activeDay);
        
        toast({
          type: 'success',
          icon: 'checkmark',
          title: 'FanDuel Auto-Populate Complete',
          description: `${response.data.message}`,
          animation: 'slide down',
          time: 4000
        });

        // Show warnings if some games weren't matched
        if (response.data.unmatched && response.data.unmatched.length > 0) {
          setTimeout(() => {
            toast({
              type: 'warning',
              icon: 'warning',
              title: `${response.data.unmatched.length} Unmatched Games`,
              description: response.data.unmatched.map(g => `${g.awayTeam} @ ${g.homeTeam}`).join(', '),
              animation: 'slide down',
              time: 6000
            });
          }, 500);
        }
      } else {
        toast({
          type: 'error',
          icon: 'x',
          title: 'FanDuel Auto-Populate Failed',
          description: response.data.message,
          animation: 'slide down',
          time: 5000
        });
      }
    } catch (error) {
      console.error('Error auto-populating FanDuel:', error);
      toast({
        type: 'error',
        icon: 'x',
        color: 'red',
        title: 'Error Auto-Populating FanDuel',
        description: error.response?.data?.message || error.message,
        animation: 'slide down',
        time: 5000
      });
    } finally {
      setIsAutoPopulatingFD(false);
    }
  };

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
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'inline'}}>
              <Link to={`/gamblecast/${moment(props.activeDay).subtract(1, 'days').format('YYYY-MM-DD')}`}>
                <Icon className="column" name='angle left' size='large'/>
              </Link>
              Games of {moment(props.activeDay).format('MM/DD')}
              <Link to={`/gamblecast/${moment(props.activeDay).add(1, 'days').format('YYYY-MM-DD')}`}>
                <Icon className="column" name='angle right' size='large'/>
              </Link>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <Button 
                color='teal' 
                icon='magic' 
                labelPosition='left'
                onClick={autoPopulateDraftKings}
                loading={isAutoPopulating}
                disabled={isAutoPopulatingFD}
                size='small'
              >
                <Icon name='magic' />
                Auto-Populate DraftKings
              </Button>
              <Button 
                color='blue' 
                icon='magic' 
                labelPosition='left'
                onClick={autoPopulateFanDuel}
                loading={isAutoPopulatingFD}
                disabled={isAutoPopulating}
                size='small'
              >
                <Icon name='magic' />
                Auto-Populate FanDuel
              </Button>
            </div>
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
