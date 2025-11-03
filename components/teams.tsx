import { useEffect, useState } from "react";

import { getAllTeams, getAllTeamsInfo } from "./db/teams";

export const Teams = () => {
  // read data from supabase

  const [teams, setTeams] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState(null);

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
      const teamsTemp = await getAllTeamsInfo();

      console.log(teamsTemp);

      if (teamsTemp) {
        setTeams(teamsTemp);
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
              <div className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 bg-white">
                <h1>{team.team_name}</h1>
                <p>{team.description}</p>

                {team.team_memberships.length > 0 && (
                  <div>
                    <h2>Members</h2>
                    <div className="flex text-gray-500 text-sm gap-2">
                      {team.team_memberships.map((member, index) => (
                        <h3>{member.students.full_name}</h3>
                      ))}
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
                      {team.team_expenses.map((expense, index) => (
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
                  <div  className="flex flex-col gap-2">
                    {mondays.map((monday, index) => (
                      <div key={index}>
                        {monday.toLocaleDateString()}{" "}
                        {/* Affichage des entrées hebdomadaires associées */}
                        {team.team_weekly_entries
                          .filter(
                            (entry) =>
                              entry.week_start_date ===
                              monday.toISOString().split("T")[0]
                          ) // Comparer les dates
                          .map((entry, entryIndex) => (
                            <div
                              className="border-1 border-gray-200"
                              key={entryIndex}
                            >
                              <>Team goals</>

                              <>Progress notes</>
                              {entry.team_progress_notes}
                              <>Next week goals</>
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
