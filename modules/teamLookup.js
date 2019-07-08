module.exports = {
  findByName: (name) => {
    let teams = {
      'Hawks': {
        id: 1610612737,
        a: 'ATL'
      },
      'Celtics': {
        id: 1610612738,
        a: 'BOS'
      },
      'Nets': {
        id: 1610612751,
        a: 'BKN'
      },
      'Hornets': {
        id: 1610612766,
        a: 'CHA'
      },
      'Bulls': {
        id: 1610612741,
        a: 'CHI'
      },
      'Cavaliers': {
        id: 1610612739,
        a: 'CLE'
      },
      'Mavericks': {
        id: 1610612742,
        a: 'DAL'
      },
      'Nuggets': {
        id: 1610612743,
        a: 'DEN'
      },
      'Pistons': {
        id: 1610612765,
        a: 'DET'
      },
      'Warriors': {
        id: 1610612744,
        a: 'GSW'
      },
      'Rockets': {
        id: 1610612745,
        a: 'HOU'
      },
      'Pacers': {
        id: 1610612754,
        a: 'IND'
      },
      'Clippers': {
        id: 1610612746,
        a: 'LAC'
      },
      'Lakers': {
        id: 1610612747,
        a: 'LAL'
      },
      'Grizzlies': {
        id: 1610612763,
        a: 'MEM'
      },
      'Heat': {
        id: 1610612748,
        a: 'MIA'
      },
      'Bucks': {
        id: 1610612749,
        a: 'MIL'
      },
      'Timberwolves': {
        id: 1610612750,
        a: 'MIN'
      },
      'Pelicans': {
        id: 1610612740,
        a: 'NOP'
      },
      'Knicks': {
        id: 1610612752,
        a: 'NYK'
      },
      'Thunder': {
        id: 1610612760,
        a: 'OKC'
      },
      'Magic': {
        id: 1610612753,
        a: 'ORL'
      },
      '76ers': {
        id: 1610612755,
        a: 'PHI'
      },
      'Suns': {
        id: 1610612756,
        a: 'PHX'
      },
      'Blazers': {
        id: 1610612757,
        a: 'POR'
      },
      'Kings': {
        id: 1610612758,
        a: 'SAC'
      },
      'Spurs': {
        id: 1610612759,
        a: 'SAS'
      },
      'Raptors': {
        id: 1610612761,
        a: 'TOR'
      },
      'Jazz': {
        id: 1610612762,
        a: 'UTA'
      },
      'Wizards': {
        id: 1610612764,
        a: 'WAS'
      }
    };
    return teams[name];
  },
  findById: (id) => {
    let teams = {
      '1610612737': {
        id: 1610612737,
        a: 'ATL',
        c: 'Atlanta',
        name: 'Hawks'
      },
      '1610612738': {
        id: 1610612738,
        a: 'BOS',
        c: 'Boston',
        name: 'Celtics'
      },
      '1610612751': {
        id: 1610612751,
        a: 'BKN',
        c: 'Brooklyn',
        name: 'Nets'
      },
      '1610612766': {
        id: 1610612766,
        a: 'CHA',
        c: 'Charlotte',
        name: 'Hornets'
      },
      '1610612741': {
        id: 1610612741,
        a: 'CHI',
        c: 'Chicago',
        name: 'Bulls'
      },
      '1610612739': {
        id: 1610612739,
        a: 'CLE',
        c: 'Cleveland',
        name: 'Cavaliers'
      },
      '1610612742': {
        id: 1610612742,
        a: 'DAL',
        c: 'Dallas',
        name: 'Mavericks'
      },
      '1610612743': {
        id: 1610612743,
        a: 'DEN',
        c: 'Denver',
        name: 'Nuggets'
      },
      '1610612765': {
        id: 1610612765,
        a: 'DET',
        c: 'Detroit',
        name: 'Pistons'
      },
      '1610612744': {
        id: 1610612744,
        a: 'GSW',
        c: 'Golden State',
        name: 'Warriors'
      },
      '1610612745': {
        id: 1610612745,
        a: 'HOU',
        c: 'Houston',
        name: 'Rockets'
      },
      '1610612754': {
        id: 1610612754,
        a: 'IND',
        c: 'Indiana',
        name: 'Pacers'
      },
      '1610612746': {
        id: 1610612746,
        a: 'LAC',
        c: 'LA',
        name: 'Clippers'
      },
      '1610612747': {
        id: 1610612747,
        a: 'LAL',
        c: 'Los Angeles',
        name: 'Lakers'
      },
      '1610612763': {
        id: 1610612763,
        a: 'MEM',
        c: 'Memphis',
        name: 'Grizzlies'
      },
      '1610612748': {
        id: 1610612748,
        a: 'MIA',
        c: 'Miami',
        name: 'Heat'
      },
      '1610612749': {
        id: 1610612749,
        a: 'MIL',
        c: 'Milwaukee',
        name: 'Bucks'
      },
      '1610612750': {
        id: 1610612750,
        a: 'MIN',
        c: 'Minnesota',
        name: 'Timberwolves'
      },
      '1610612740': {
        id: 1610612740,
        a: 'NOP',
        c: 'New Orleans',
        name: 'Pelicans'
      },
      '1610612752': {
        id: 1610612752,
        a: 'NYK',
        c: 'New York',
        name: 'Knicks'
      },
      '1610612760': {
        id: 1610612760,
        a: 'OKC',
        c: 'Oklahoma City',
        name: 'Thunder'
      },
      '1610612753': {
        id: 1610612753,
        a: 'ORL',
        c: 'Orlando',
        name: 'Magic'
      },
      '1610612755': {
        id: 1610612755,
        a: 'PHI',
        c: 'Philadelphia',
        name: '76ers'
      },
      '1610612756': {
        id: 1610612756,
        a: 'PHX',
        c: 'Phoenix',
        name: 'Suns'
      },
      '1610612757': {
        id: 1610612757,
        a: 'POR',
        c: 'Portland',
        name: 'Blazers'
      },
      '1610612758': {
        id: 1610612758,
        a: 'SAC',
        c: 'Sacramento',
        name: 'Kings'
      },
      '1610612759': {
        id: 1610612759,
        a: 'SAS',
        c: 'San Antonio',
        name: 'Spurs'
      },
      '1610612761': {
        id: 1610612761,
        a: 'TOR',
        c: 'Toronto',
        name: 'Raptors'
      },
      '1610612762': {
        id: 1610612762,
        a: 'UTA',
        c: 'Utah',
        name: 'Jazz'
      },
      '1610612764': {
        id: 1610612764,
        a: 'WAS',
        c: 'Washington',
        name: 'Wizards'
      },
      '70': {
        id: 70,
        a: 'CRO',
        c: 'Croatia',
        name: 'Croatia'
      },
      '45': {
        id: 45,
        a: 'CHI',
        c: 'Croatia',
        name: 'China'
      }
    };
    return teams[id];
  }
}
