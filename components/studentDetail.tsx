import { useEffect, useState } from "react";
import {
  enterStudentWeeklyEntry,
  getStudentWeeklyEntries,
} from "./db/students";
import { getSessionId } from "./db/sessions";
import router from "next/router";
import { getAvailableTeams, getUserFromEmail } from "./db/user";

export const StudentDetail = (selectedStudent: any) => {
  selectedStudent = selectedStudent.selectedStudent;

  // goals
  const [goals, setGoals] = useState([
    {
      id: 1,
      goal: "",
      status: "not_achieved",
    },
    {
      id: 2,
      goal: "",
      status: "not_achieved",
    },
    {
      id: 3,
      goal: "",
      status: "not_achieved",
    },
    {
      id: 4,
      goal: "",
      status: "not_achieved",
    },
  ]);

  // next week goals
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [nextWeekGoals, setNextWeekGoals] = useState([""]);

  const [studentWeeklyEntries, setStudentWeeklyEntries] = useState<any[]>([]);
  const [progressGoal, setProgressGoal] = useState("");

  const [canUpdate, setCanUpdate] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const getStudents = async () => {
      const studentsTemp = await getStudentWeeklyEntries(selectedStudent.id);

      if (studentsTemp) {
        // order by week_start_date
        studentsTemp.sort((a, b) => {
          return (
            new Date(b.week_start_date).getTime() -
            new Date(a.week_start_date).getTime()
          );
        });

        setStudentWeeklyEntries(studentsTemp);
      }
    };

    const getAvailableTeamsForUser = async () => {
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

      if (role === "ADMIN") {
        setCanUpdate(true);
      }

      if (role === "INSTRUCTOR") {
     
        const availableTeamsRes = await getAvailableTeams(dataUser.data[0]);

        if (availableTeamsRes) {
          // compare records of avaliableTeamsRes.team_id with selectedStudent.team_memberships.team_id
          // if match, allow update

          const availableTeamIds = availableTeamsRes.map(
            (team) => team.team_id
          );

          const hasAccess = selectedStudent.team_memberships.some(
            (membership:any) => availableTeamIds.includes(membership.team_id)
          );
          if (hasAccess) {
            setCanUpdate(true);
          }
        }
      }
    };

    getAvailableTeamsForUser();

    getStudents();
  }, []);

  function handleDateChange(selectedDate: string) {
    setDate(selectedDate); // Update the date state
  }

  function handleDuplicateGoals() {
    // get last week's goals
    let i = 0;

    for (const lastWeekGoal of JSON.parse(
      studentWeeklyEntries[0].goals_set_json
    )) {
      goals[i].goal = lastWeekGoal;
      i++;
    }

    setGoals([...goals]);
  }

  function handleAddGoal(): void {
    // get biggest id in goals
    const newId = goals.sort((a, b) => b.id - a.id)[0].id + 1;

    goals.push({
      id: newId,
      goal: "",
      status: "not_achieved",
    });

    setGoals([...goals]);
  }

  function handleGoalChange(id: number, value: string): void {
    // Find record with id in goals, change goal with value
    const goal = goals.find((goal) => goal.id === id);
    if (goal) {
      goal.goal = value;
      setGoals([...goals]);
    }
  }

  function handleStatusChange(id: number, value: string): void {
    // Find record with id in goals, change goal with value
    const goal = goals.find((goal) => goal.id === id);
    if (goal) {
      goal.status = value;
      setGoals([...goals]);
    }
  }

  function handleProgressGoalChange(value: string) {
    setProgressGoal(value);
  }

  function handleAddNextWeekGoal() {
    nextWeekGoals.push("");

    setNextWeekGoals([...nextWeekGoals]);
  }

  function handleNextWeekGoalChange(index: number, value: string) {
    // Create a new array with the updated goal
    const updatedGoals = nextWeekGoals.map(
      (goal, i) => (i === index ? value : goal) // Replace the goal at the specified index
    );

    // Update the state with the new array
    setNextWeekGoals(updatedGoals);
  }

  function handleSaveEntry(): void {
    setError("");

    // check if date ok.

    if (date === "") {
      setError("Date is required");
      return;
    }

    // check if date future
    const today = new Date().toISOString().split("T")[0];
    const selectedDate = new Date(date).toISOString().split("T")[0];
    if (selectedDate < today) {
      setError("Date cannot be in the past");
      return;
    }

    // check if date is monday
    if (new Date(date).getDay() !== 1) {
      setError("Date must be a Monday");
      return;
    }

    // check if date already present in studentWeeklyEntries.week_start_date
    const existingEntry = studentWeeklyEntries.find(
      (entry) => entry.week_start_date === selectedDate
    );

    if (existingEntry) {
      setError("Entry already exists for this date");
      return;
    }

    // Check if at least one goal

    let atLeastOneGoal = false;
    for (const goal of goals) {
      if (goal.goal! + "") {
        atLeastOneGoal = true;
      }
    }

    if (atLeastOneGoal === false) {
      setError("At least one goal is required");
      return;
    }

    // delete records from goals where goal.goal = ""

    let overallStatus = "";

    // read all goal.status, if all achieved, overallStatus = achieved.
    // if none achieved, overallStatus= not_achieved
    // partial in other cases

    let allAchieved = true;
    let noneAchieved = true;
    let onePartial = false;

    for (const goal of goals.filter((g) => g.goal != "")) {
      if (goal.status != "achieved") {
        allAchieved = false;
      } else {
        noneAchieved = false;
      }
      if (goal.status === "partial") {
        onePartial = true;
      }
    }

    if (allAchieved) {
      overallStatus = "achieved";
    } else if (noneAchieved) {
      overallStatus = "not_achieved";
    } else if (onePartial) {
      overallStatus = "partial";
    } else {
      overallStatus = "partial";
    }

    // add a record in studentWeeklyEntries

    /*  goals_set_json: JSON.stringify(
        goals.filter((g) => g.goal != "").map((goal) => goal.goal)
      ),
      per_goal_status_json: JSON.stringify(goals.map((goal) => goal.status)),
*/

    const newEntry = {
      student_id: selectedStudent.id,
      week_start_date: selectedDate,
      goals_set_json: JSON.stringify(
        goals.filter((g) => g.goal != "").map((goal) => goal.goal)
      ),
      per_goal_status_json: JSON.stringify(
        goals.filter((g) => g.goal != "").map((goal) => goal.status)
      ),
      progress_goal: progressGoal,
      next_week_goals_json: JSON.stringify(
        nextWeekGoals.filter((g) => g != "")
      ),
      overall_status: overallStatus,
    };

    // add entry to DB
    enterStudentWeeklyEntry(
      newEntry.student_id,
      newEntry.goals_set_json,
      newEntry.week_start_date,
      newEntry.per_goal_status_json,
      overallStatus,
      newEntry.progress_goal,
      newEntry.next_week_goals_json
    );

    studentWeeklyEntries.push(newEntry);

    studentWeeklyEntries.sort((a, b) => {
      return (
        new Date(b.week_start_date).getTime() -
        new Date(a.week_start_date).getTime()
      );
    });

    setStudentWeeklyEntries([...studentWeeklyEntries]);

    // empty fields
    for (const goal of goals) {
      goal.goal = "";
      goal.status = "not_achieved";
    } // remove goals except 4
    goals.splice(0, goals.length - 4);

    setGoals([...goals]);

    setProgressGoal("");

    for (let goal of nextWeekGoals) {
      goal = "";
    }

    // remove goals except 1
    nextWeekGoals.splice(0, nextWeekGoals.length);
    nextWeekGoals.push("");
    setNextWeekGoals([...nextWeekGoals]);
  }

  return (
    <>
      <div>
        <div className="page-title">
          <h1>{selectedStudent.full_name}</h1>
        </div>
        <div className="text-gray-500 text-sm">
          {selectedStudent.research_area} • Supervisor:{" "}
          {selectedStudent.supervisor} • Status: {selectedStudent.status}
        </div>
        <div></div>
      </div>
      <div className="flex gap-1">
        {canUpdate && (
          <div className="background rounded-lg border border-gray-200 p-2 flex flex-col gap-2 w-1/2">
            <h2>Quick add / edit weekly entry</h2>
            <div className="flex justify-between">
              <div>
                <h3>Week (Monday)</h3>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="border-1 rounded-lg"
                />
              </div>

              <button
                className="border-1 rounded-lg p-2 button "
                onClick={() => {
                  handleDuplicateGoals();
                }}
              >
                <h2> Duplicate last week's goals</h2>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <h2>Goals</h2>
              <div className="flex flex-wrap gap-4">
                {goals.map((goal) => (
                  <div className="flex gap-2 w-[calc(50%-25px)]" key={goal.id}>
                    <input
                      type="text"
                      className="text-xs border-1 border-gray-200 w-full"
                      value={goal.goal}
                      onChange={(e) =>
                        handleGoalChange(goal.id, e.target.value)
                      } // Add appropriate change handler
                    />
                    <select
                      className="border-1 border-gray-200 rounded-lg p-2"
                      value={goal.status} // Assuming `status` is a property of `goal`
                      onChange={(e) =>
                        handleStatusChange(goal.id, e.target.value)
                      } // Add appropriate change handler
                    >
                      <option value="not_achieved">Not achieved</option>
                      <option value="partial">Partial</option>
                      <option value="achieved">Achieved</option>
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <button
                  className="button  border-1 rounded-lg p-2 w-full"
                  onClick={() => handleAddGoal()}
                >
                  <h2>+ Add Goal</h2>
                </button>
              </div>
              <div>
                {" "}
                <h2>Progress Goals</h2>
              </div>
              <textarea
                onChange={(e) => handleProgressGoalChange(e.target.value)}
                value={progressGoal}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message here..."
              ></textarea>
            </div>
            <div className="flex flex-col gap-2">
              <h2>Next week goals</h2>
              {nextWeekGoals.map((goal, index) => (
                <input
                  key={index}
                  type="text"
                  value={goal.toString()}
                  onChange={(e) =>
                    handleNextWeekGoalChange(index, e.target.value)
                  }
                  className="border-1  border-gray-200 w-full"
                />
              ))}
              <button
                className="button border-1 rounded-lg p-2 w-full"
                onClick={() => handleAddNextWeekGoal()}
              >
                <h2>+ Add Next Week Goal</h2>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="buttonRed w-1/4"
                onClick={() => handleSaveEntry()}
              >
                <h2>Save Entry</h2>
              </button>
              <div className="text-gray-500 text-sm">Create new entry</div>
              {error && <p className="error">{error}</p>}
            </div>
          </div>
        )}

        <div className="background rounded-lg border border-gray-200 p-2 flex flex-col gap-2 w-1/2">
          <h2>Weekly entries</h2>
          {studentWeeklyEntries.map((entry, index) => (
            <div
              key={index}
              className="background rounded-lg border border-gray-200 p-2"
            >
              <div className="flex">
                <h2>{entry.week_start_date}</h2>
                &nbsp;
                <div
                  className={`text-white p-1 rounded text-xs w-20 text-center ${
                    entry.overall_status === "achieved"
                      ? "bg-green-400"
                      : entry.overall_status === "partial"
                      ? "bg-orange-300"
                      : "bg-red-400"
                  }`}
                >
                  {entry.overall_status === "achieved"
                    ? "Achieved"
                    : entry.overall_status === "partial"
                    ? "Partial"
                    : "Not achieved"}
                </div>
              </div>
              <ul>
                {JSON.parse(entry.goals_set_json).map(
                  (goal: any, index: number) => {
                    const status = JSON.parse(entry.per_goal_status_json)[
                      index
                    ];
                    let bulletColor;

                    if (status === "achieved") {
                      bulletColor = "text-green-600"; // Couleur verte
                    } else if (status === "partial") {
                      bulletColor = "text-orange-300"; // Couleur orange
                    } else {
                      bulletColor = "text-red-500"; // Couleur rouge
                    }

                    return (
                      <li key={index} className={`flex items-center`}>
                        <span className={`mr-2 ${bulletColor} text-xl`}>•</span>
                        {goal}
                      </li>
                    );
                  }
                )}
              </ul>

              <h2>Next week goals :</h2>

              <ul>
                {JSON.parse(entry.next_week_goals_json).map(
                  (goal: any, index: number) => (
                    <li key={index} className="text-gray-500 text-sm">
                      •{goal}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
