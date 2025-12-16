"use client";

import { useEffect, useState } from "react";

import { getAllTeams, getAllTeamsInfo } from "./db/teams";
import router from "next/router";
import { getSessionId } from "./db/sessions";
import { getAvailableTeams, getUserFromEmail } from "./db/user";

export const Teams = () => {
  // read data from supabase

  const [teams, setTeams] = useState<any[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const getLastThreeMondays = () => {
    const mondays = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const lastMonday = new Date(today);

    // Calculer la date du dernier lundi
    lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    // Ajouter les trois derniers lundis à la liste
    for (let i = 0; i < 3; i++) {
      mondays.push(new Date(lastMonday));
      lastMonday.setDate(lastMonday.getDate() - 7); // Retirer 7 jours pour le lundi précédent
    }

    return mondays;
  };

  const mondays = getLastThreeMondays();

  useEffect(() => {
    setLoading(true);

    const getTeams = async () => {
      let teamsTemp = await getAllTeamsInfo();

      if (teamsTemp) {
        const sessionId = sessionStorage.getItem("sessionId");

        const dataSession = await getSessionId(sessionId);
        let role = "";
        let email = "";
        if (!dataSession) {
          router.push("/");
        } else {
          role = dataSession[0].role;
          email = dataSession[0].user_email;
        }

        const dataUser = await getUserFromEmail(email);
        if (
          !dataUser ||
          !dataUser.data ||
          !Array.isArray(dataUser.data) ||
          dataUser.data.length === 0
        ) {
          router.push("/");
          return;
        }

        if (role != "ADMIN") {
          const availableTeamsRes = await getAvailableTeams(dataUser.data[0]);

          if (availableTeamsRes) {
            let teamsTempAvailable = [];

            for (const avTeam of availableTeamsRes) {
              teamsTempAvailable.push(avTeam.teams);
            }

            //  Filter teamsTemp to only put teams in teamsTempAvailable
            teamsTemp = teamsTemp.filter((team) => {
              return teamsTempAvailable.some(
                (teamTemp) => teamTemp.id === team.id
              );
            });

            setTeams(teamsTemp);
          }
          setLoading(false);
        } else {
          setTeams(teamsTemp);
        }
      }
      setLoading(false);
    };

    getTeams();
  }, []);
  return (
    <div className="p-3">
      {selectedTeam && (
        <div
          className="font-bold cursor-pointer"
          onClick={() => {
            setSelectedTeam(null);
          }}
        >
          Back{" "}
        </div>
      )}

      <div>
        <h1>Teams</h1>

        <div className="flex flex-col md:flex-row">
          {teams &&
            teams.map((team) => (
              <div
                key={team.team_name}
                className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 background"
              >
                <h1>{team.team_name}</h1>
                <p>{team.description}</p>

                {team.team_memberships.length > 0 && (
                  <div>
                    <h2>Members</h2>
                    <div className="flex text-gray-500 text-sm gap-2">
                      {team.team_memberships.map(
                        (member: any, index: number) => (
                          <h3>{member.students.full_name}</h3>
                        )
                      )}
                    </div>
                  </div>
                )}

                <p className="text-gray-500 text-sm">
                  Budget : {team.budget} HKD
                </p>

                {team.team_expenses.length > 0 && (
                  <div>
                    <h2>Expenses</h2>
                    <ul className="flex flex-col gap-3 p-3 border-1 border-gray-200 rounded-xl">
                      {team.team_expenses.map((expense: any, index: number) => (
                        <li key={index}>
                          <h3>{expense.title}</h3>
                          <p className="text-gray-500 text-sm">
                            {expense.description}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {expense.value} HKD
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h2>Last 3 Mondays</h2>
                  <div className="flex flex-col gap-4">
                    {mondays.map((monday, index) => (
                      <div className="p-2" key={index}>
                        <h2>{monday.toLocaleDateString()}</h2>
                        {/* Affichage des entrées hebdomadaires associées */}
                        {team.team_weekly_entries
                          .filter(
                            (entry: any) =>
                              entry.week_start_date ===
                              monday.toISOString().split("T")[0]
                          ) // Comparer les dates
                          .map((entry: any, entryIndex: number) => (
                            <div
                              className="border-1 border-gray-200 flex flex-col gap-2"
                              key={entryIndex}
                            >
                              <h3>Team goals</h3>

                              {JSON.parse(entry.team_goals_set_json).map(
                                (teamGoal: string, entryIndex: number) => (
                                  <div
                                    key={entryIndex}
                                    className="text-gray-500 text-sm"
                                  >
                                    {teamGoal}
                                  </div>
                                )
                              )}

                              <h3>Progress notes</h3>
                              <div className="text-gray-500 text-sm">
                                {entry.team_progress_notes}
                              </div>
                              <h3>Next week goals</h3>
                              {JSON.parse(entry.next_week_team_goals_json).map(
                                (teamGoalNext: string, entryIndex: number) => (
                                  <div
                                    key={entryIndex}
                                    className="text-gray-500 text-sm"
                                  >
                                    {teamGoalNext}
                                  </div>
                                )
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {loading && (
          <div className="flex w-full justify-center mt-10">
            <h1>Loading...</h1>
          </div>
        )}
      </div>
    </div>
  );
};
