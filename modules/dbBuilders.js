const knex = require('../db/knex');

module.exports = {
  buildTeamDb: function (db, arrayData) {
    arrayData.forEach(team => {
      knex(db).insert({
        team_id: team[0],
        team_name: team[1],
        gp: team[2],
        w: team[3],
        l: team[4],
        w_pct: team[5],
        min: team[6],
        e_off_rating: team[7],
        off_rating: team[8],
        e_def_rating: team[9],
        def_rating: team[10],
        e_net_rating: team[11],
        net_rating: team[12],
        ast_pct: team[13],
        ast_to: team[14],
        ast_ratio: team[15],
        oreb_pct: team[16],
        dreb_pct: team[17],
        reb_pct: team[18],
        tm_tov_pct: team[19],
        efg_pct: team[20],
        ts_pct: team[21],
        e_pace: team[22],
        pace: team[23],
        pie: team[24],
        gp_rank: team[25],
        w_rank: team[26],
        l_rank: team[27],
        w_pct_rank: team[28],
        min_rank: team[29],
        off_rating_rank: team[30],
        def_rating_rank: team[31],
        net_rating_rank: team[32],
        ast_pct_rank: team[33],
        ast_to_rank: team[34],
        ast_ratio_rank: team[35],
        oreb_pct_rank: team[36],
        dreb_pct_rank: team[37],
        reb_pct_rank: team[38],
        tm_tov_pct_rank: team[39],
        efg_pct_rank: team[40],
        ts_pct_rank: team[41],
        pace_rank: team[42],
        pie_rank: team[43],
        cfid: team[44],
        cfparams: team[45],
        updated_at: new Date()
      }, '*').then(team =>{
        console.log(team[0].team_name, ' has been added to db');
      });
    })
  },
  updateTeamDb: function (db, arrayData) {
    arrayData.forEach(team => {
      knex(db)
        .where({team_id: team[0]})
        .update({
          gp: team[2],
          w: team[3],
          l: team[4],
          w_pct: team[5],
          min: team[6],
          e_off_rating: team[7],
          off_rating: team[8],
          e_def_rating: team[9],
          def_rating: team[10],
          e_net_rating: team[11],
          net_rating: team[12],
          ast_pct: team[13],
          ast_to: team[14],
          ast_ratio: team[15],
          oreb_pct: team[16],
          dreb_pct: team[17],
          reb_pct: team[18],
          tm_tov_pct: team[19],
          efg_pct: team[20],
          ts_pct: team[21],
          e_pace: team[22],
          pace: team[23],
          pie: team[24],
          gp_rank: team[25],
          w_rank: team[26],
          l_rank: team[27],
          w_pct_rank: team[28],
          min_rank: team[29],
          off_rating_rank: team[30],
          def_rating_rank: team[31],
          net_rating_rank: team[32],
          ast_pct_rank: team[33],
          ast_to_rank: team[34],
          ast_ratio_rank: team[35],
          oreb_pct_rank: team[36],
          dreb_pct_rank: team[37],
          reb_pct_rank: team[38],
          tm_tov_pct_rank: team[39],
          efg_pct_rank: team[40],
          ts_pct_rank: team[41],
          pace_rank: team[42],
          pie_rank: team[43],
          cfid: team[44],
          cfparams: team[45],
          updated_at: new Date()
        }, '*')
        .then(team => {
          console.log(team[0], ' has been updated in the ', db, ' db');
        })
    })
  }
}
