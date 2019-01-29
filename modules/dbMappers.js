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
              console.log(res[0].team_name, " net rtg updated for FS");
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

    knex("teams_bench")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_full: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for bench FS");
            });
        });
      });

    knex("teams_bench_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l5: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for bench l5");
            });
        });
      });

    knex("teams_bench_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l10: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for bench l10");
            });
        });
      });

    knex("teams_bench_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l15: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for bench l15");
            });
        });
      });

    knex("teams_bench_l20")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l20: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for bench l20");
            });
        });
      });

    knex("teams_starters")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_full: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for starters FS");
            });
        });
      });

    knex("teams_starters_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l5: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for starters l5");
            });
        });
      });

    knex("teams_starters_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l10: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(
                res[0].team_name,
                " net rtg updated for starters l10"
              );
            });
        });
      });

    knex("teams_starters_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l15: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(
                res[0].team_name,
                " net rtg updated for starters l15"
              );
            });
        });
      });

    knex("teams_starters_l20")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l20: team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(
                res[0].team_name,
                " net rtg updated for starters l20"
              );
            });
        });
      });

    knex("teams_starters")
      .select("team_id", "net_rating")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench")
            .where({
              team_id: starters.team_id
            })
            .select("net_rating")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].net_rating - starters.net_rating;
              knex("team_net_ratings")
                .where({
                  team_id: starters.team_id
                })
                .update(
                  {
                    bs_delta_full: bsDelta,
                    updated_at: new Date()
                  },
                  "*"
                )
                .then(res => {
                  console.log(res[0].team_name, " full bsDelta updated");
                });
            });
        });
      });

    knex("teams_starters_l5")
      .select("team_id", "net_rating")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l5")
            .where({
              team_id: starters.team_id
            })
            .select("net_rating")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].net_rating - starters.net_rating;
              knex("team_net_ratings")
                .where({
                  team_id: starters.team_id
                })
                .update(
                  {
                    bs_delta_l5: bsDelta,
                    updated_at: new Date()
                  },
                  "*"
                )
                .then(res => {
                  console.log(res[0].team_name, " l5 bsDelta updated");
                });
            });
        });
      });

    knex("teams_starters_l10")
      .select("team_id", "net_rating")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l10")
            .where({
              team_id: starters.team_id
            })
            .select("net_rating")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].net_rating - starters.net_rating;
              knex("team_net_ratings")
                .where({
                  team_id: starters.team_id
                })
                .update(
                  {
                    bs_delta_l10: bsDelta,
                    updated_at: new Date()
                  },
                  "*"
                )
                .then(res => {
                  console.log(res[0].team_name, " l10 bsDelta updated");
                });
            });
        });
      });

    knex("teams_starters_l15")
      .select("team_id", "net_rating")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l15")
            .where({
              team_id: starters.team_id
            })
            .select("net_rating")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].net_rating - starters.net_rating;
              knex("team_net_ratings")
                .where({
                  team_id: starters.team_id
                })
                .update(
                  {
                    bs_delta_l15: bsDelta,
                    updated_at: new Date()
                  },
                  "*"
                )
                .then(res => {
                  console.log(res[0].team_name, " l15 bsDelta updated");
                });
            });
        });
      });

    knex("teams_starters_l20")
      .select("team_id", "net_rating")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l20")
            .where({
              team_id: starters.team_id
            })
            .select("net_rating")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].net_rating - starters.net_rating;
              knex("team_net_ratings")
                .where({
                  team_id: starters.team_id
                })
                .update(
                  {
                    bs_delta_l20: bsDelta,
                    updated_at: new Date()
                  },
                  "*"
                )
                .then(res => {
                  console.log(res[0].team_name, " l20 bsDelta updated");
                });
            });
        });
      });
  }
};
