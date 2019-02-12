const knex = require("../db/knex");

module.exports = {
  mapFullPlayerData: function() {
    knex("players_full")
      .select("player_id", "player_name", "team_id", "team_abbreviation", "gp", "min", "off_rating", "def_rating", "net_rating", "pace")
      .then(players => {
        players.forEach(player => {
          knex("player_data").where({player_id: player.player_id}).then(res => {
            if (!res[0]) {
              knex("player_data").insert({
                player_id: player.player_id,
                player_name: player.player_name,
                team_id: player.team_id,
                team_abbreviation: player.team_abbreviation,
                gp_full: player.gp,
                min_full: player.min,
                net_rtg_full: player.net_rating,
                off_rtg_full: player.off_rating,
                def_rtg_full: player.def_rating,
                pace_full: player.pace,
                updated_at: new Date()
              }, '*').then(updated => {
                console.log(updated[0].player_name, ' added to player data');
              })
            } else {
              knex("player_data").where({player_id: player.player_id}).update({
                team_id: player.team_id,
                team_abbreviation: player.team_abbreviation,
                gp_full: player.gp,
                min_full: player.min,
                net_rtg_full: player.net_rating,
                off_rtg_full: player.off_rating,
                def_rtg_full: player.def_rating,
                pace_full: player.pace,
                updated_at: new Date()
              }, '*').then(updated => {
                console.log(updated[0].player_name, ' updated for FS in player data');
              })
            }
          })
        })
      });
  },
  mapSegmentedPlayerData: function () {
    knex("players_l5")
      .select("player_id", "gp", "min", "off_rating", "def_rating", "net_rating", "pace")
      .then(players => {
        players.forEach(player => {
          knex("player_data").where({player_id: player.player_id}).update({
            gp_l5: player.gp,
            min_l5: player.min,
            net_rtg_l5: player.net_rating,
            off_rtg_l5: player.off_rating,
            def_rtg_l5: player.def_rating,
            pace_l5: player.pace,
            updated_at: new Date()
          }, '*').then(updated => {
            console.log(updated[0].player_name, ' updated for l5 in player data');
          })
        })
      });

    knex("players_l10")
      .select("player_id", "gp", "min", "off_rating", "def_rating", "net_rating", "pace")
      .then(players => {
        players.forEach(player => {
          knex("player_data").where({player_id: player.player_id}).update({
            gp_l10: player.gp,
            min_l10: player.min,
            net_rtg_l10: player.net_rating,
            off_rtg_l10: player.off_rating,
            def_rtg_l10: player.def_rating,
            pace_l10: player.pace,
            updated_at: new Date()
          }, '*').then(updated => {
            console.log(updated[0].player_name, ' updated for l10 in player data');
          })
        })
      });

      knex("players_l15")
        .select("player_id", "gp", "min", "off_rating", "def_rating", "net_rating", "pace")
        .then(players => {
          players.forEach(player => {
            knex("player_data").where({player_id: player.player_id}).update({
              gp_l15: player.gp,
              min_l15: player.min,
              net_rtg_l15: player.net_rating,
              off_rtg_l15: player.off_rating,
              def_rtg_l15: player.def_rating,
              pace_l15: player.pace,
              updated_at: new Date()
            }, '*').then(updated => {
              console.log(updated[0].player_name, ' updated for l15 in player data');
            })
          })
        });
  },
  mapTeamNetRatings: function() {
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

    knex("teams_q1")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_full": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 1q");
            });
        });
      });

    knex("teams_q1_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_l5": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 1q l5");
            });
        });
      });

    knex("teams_q1_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_l10": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 1q l10");
            });
        });
      });

    knex("teams_q1_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_l15": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 1q l15");
            });
        });
      });

    knex("teams_q2")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_full": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 2q");
            });
        });
      });

    knex("teams_q2_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_l5": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 2q l5");
            });
        });
      });

    knex("teams_q2_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_l10": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 2q l10");
            });
        });
      });

    knex("teams_q2_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_l15": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 2q l15");
            });
        });
      });

    knex("teams_q3")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_full": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 3q");
            });
        });
      });

    knex("teams_q3_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_l5": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 3q l5");
            });
        });
      });

    knex("teams_q3_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_l10": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 3q l10");
            });
        });
      });

    knex("teams_q3_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_l15": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 3q l15");
            });
        });
      });

    knex("teams_q4")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_full": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 4q");
            });
        });
      });

    knex("teams_q4_l5")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_l5": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 4q l5");
            });
        });
      });

    knex("teams_q4_l10")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_l10": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 4q l10");
            });
        });
      });

    knex("teams_q4_l15")
      .select("team_id", "net_rating")
      .then(teams => {
        teams.forEach(team => {
          knex("team_net_ratings")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_l15": team.net_rating,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " net rtg updated for 4q l15");
            });
        });
      });
  },
  mapTeamPace: function() {
    knex("teams_full")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                team_full: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for FS");
            });
        });
      });

    knex("teams_full_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l5: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for l5");
            });
        });
      });

    knex("teams_full_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l10: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for l10");
            });
        });
      });

    knex("teams_full_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l15: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for l15");
            });
        });
      });

    knex("teams_full_l20")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                team_l20: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for l20");
            });
        });
      });

    knex("teams_bench")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_full: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for bench FS");
            });
        });
      });

    knex("teams_bench_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l5: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for bench l5");
            });
        });
      });

    knex("teams_bench_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l10: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for bench l10");
            });
        });
      });

    knex("teams_bench_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l15: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for bench l15");
            });
        });
      });

    knex("teams_bench_l20")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                bench_l20: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for bench l20");
            });
        });
      });

    knex("teams_starters")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_full: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for starters FS");
            });
        });
      });

    knex("teams_starters_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l5: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for starters l5");
            });
        });
      });

    knex("teams_starters_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l10: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(
                res[0].team_name,
                " pace updated for starters l10"
              );
            });
        });
      });

    knex("teams_starters_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l15: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(
                res[0].team_name,
                " pace updated for starters l15"
              );
            });
        });
      });

    knex("teams_starters_l20")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                starters_l20: team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(
                res[0].team_name,
                " pace updated for starters l20"
              );
            });
        });
      });

    knex("teams_starters")
      .select("team_id", "pace")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench")
            .where({
              team_id: starters.team_id
            })
            .select("pace")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].pace - starters.pace;
              knex("team_pace")
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
      .select("team_id", "pace")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l5")
            .where({
              team_id: starters.team_id
            })
            .select("pace")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].pace - starters.pace;
              knex("team_pace")
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
      .select("team_id", "pace")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l10")
            .where({
              team_id: starters.team_id
            })
            .select("pace")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].pace - starters.pace;
              knex("team_pace")
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
      .select("team_id", "pace")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l15")
            .where({
              team_id: starters.team_id
            })
            .select("pace")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].pace - starters.pace;
              knex("team_pace")
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
      .select("team_id", "pace")
      .then(teamStarters => {
        teamStarters.forEach(starters => {
          knex("teams_bench_l20")
            .where({
              team_id: starters.team_id
            })
            .select("pace")
            .then(benchRtg => {
              let bsDelta = benchRtg[0].pace - starters.pace;
              knex("team_pace")
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

    knex("teams_q1")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_full": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 1q");
            });
        });
      });

    knex("teams_q1_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_l5": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 1q l5");
            });
        });
      });

    knex("teams_q1_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_l10": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 1q l10");
            });
        });
      });

    knex("teams_q1_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "1q_l15": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 1q l15");
            });
        });
      });

    knex("teams_q2")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_full": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 2q");
            });
        });
      });

    knex("teams_q2_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_l5": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 2q l5");
            });
        });
      });

    knex("teams_q2_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_l10": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 2q l10");
            });
        });
      });

    knex("teams_q2_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "2q_l15": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 2q l15");
            });
        });
      });

    knex("teams_q3")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_full": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 3q");
            });
        });
      });

    knex("teams_q3_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_l5": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 3q l5");
            });
        });
      });

    knex("teams_q3_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_l10": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 3q l10");
            });
        });
      });

    knex("teams_q3_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "3q_l15": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 3q l15");
            });
        });
      });

    knex("teams_q4")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_full": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 4q");
            });
        });
      });

    knex("teams_q4_l5")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_l5": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 4q l5");
            });
        });
      });

    knex("teams_q4_l10")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_l10": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 4q l10");
            });
        });
      });

    knex("teams_q4_l15")
      .select("team_id", "pace")
      .then(teams => {
        teams.forEach(team => {
          knex("team_pace")
            .where({ team_id: team.team_id })
            .update(
              {
                "4q_l15": team.pace,
                updated_at: new Date()
              },
              "*"
            )
            .then(res => {
              console.log(res[0].team_name, " pace updated for 4q l15");
            });
        });
      });
  }
};
