const knex = require("../db/knex");

module.exports = {
  mapNetRatings: function() {
    knex("teams_full")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                team_full: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for full season");
            });
        });
      });

    knex("teams_full_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l5: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for l5");
            });
        });
      });

    knex("teams_full_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l10: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for l10");
            });
        });
      });

    knex("teams_full_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l15: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for l15");
            });
        });
      });

    knex("teams_full_l20")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l20: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for l20");
            });
        });
      });
  }
};
