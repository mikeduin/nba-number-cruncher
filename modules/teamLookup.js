module.exports = {
  findTeam: (name) => {
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
      },
    };
    return teams[name];
  }
}
