import {
  getAllStudentsWeeklyEntries,
  getStudentTeam,
} from "@/components/db/students";
import { useEffect, useState } from "react";
import { StudentDetail } from "./studentDetail";
import { getAllTeams } from "./db/teams";

export const Students = () => {
  // read data from supabase

  const [students, setStudents] = useState<any[]>([]);
  const [studentsUnfiltered, setStudentsUnfiltered] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [teams, setTeams] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [nameFilter, setNameFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  // check monday of current week
  const today = new Date();
  let currentWeekMonday = null;

  if (today.getDay() === 1) {
    // is monday
    currentWeekMonday = today;
  } else {
    currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - today.getDay() + 1);
  }

  useEffect(() => {
    setLoading(true);

    const getStudents = async () => {
      const studentsTemp = await getAllStudentsWeeklyEntries();

      if (studentsTemp) {
        for (const student of studentsTemp) {
          student.weekly_entries = student.weekly_entries.filter(
            (entry: any) => {
              const entryDate = new Date(entry.week_start_date);

              const entryDateOnly = new Date(
                entryDate.getFullYear(),
                entryDate.getMonth(),
                entryDate.getDate()
              );
              const currentWeekMondayOnly = new Date(
                currentWeekMonday.getFullYear(),
                currentWeekMonday.getMonth(),
                currentWeekMonday.getDate()
              );

              return (
                entryDateOnly.getTime() === currentWeekMondayOnly.getTime()
              );
            }
          );

          student.team = "";
        }

        const teamsRes = await getAllTeams();

        if (teamsRes) {
          setTeams(teamsRes);
        }

        setStudents(studentsTemp);
        setStudentsUnfiltered(studentsTemp);
        setLoading(false);
      }
    };

    getStudents();
  }, []);

  function handleFilterName(value: string): void {


    setNameFilter(value);
    let filtered = studentsUnfiltered;


    if (teamFilter != "") {
      filtered = filtered.filter((student) => {
        return (
          student.team_memberships &&
          student.team_memberships.some(
            (membership: { team_id: string }) =>
              membership.team_id === teamFilter
          )
        );
      });
    }

    if (value === "") {
      setNameFilter("");
      setStudents(filtered);
      return;
    }

    filtered = filtered.filter((student) => {
      return student.full_name.toLowerCase().includes(value.toLowerCase());
    });

    setStudents(filtered);
  }

  function handleFilterTeam(value: string): void {
    setTeamFilter(value);
    let filtered = studentsUnfiltered;


    if (nameFilter != "") {
      filtered = filtered.filter((student) => {
        return student.full_name
          .toLowerCase()
          .includes(nameFilter.toLowerCase());
      });
    }

    if (value === "") {
      setTeamFilter("");
      setStudents(filtered);
      return;
    }

    filtered = filtered.filter((student) => {
      return (
        student.team_memberships &&
        student.team_memberships.some(
          (membership: { team_id: string }) => membership.team_id === value
        )
      );
    });

    setStudents(filtered);
  }

  return (
    <div className="p-3">
      {selectedStudent && (
        <div
          className="font-bold cursor-pointer"
          onClick={() => {
            setSelectedStudent(null);
          }}
        >
          Back{" "}
        </div>
      )}

      {!selectedStudent && (
        <>
          <h1>Students</h1>
          <div className=" flex gap-2">
            <input
              type="text"
              placeholder="Filter by name"
              className="my-4 border-1 border-gray-200 p-2 rounded-xl input"
              onChange={(e) => handleFilterName(e.target.value)}
            />

            <select
              className="my-4 border-1 border-gray-200 p-2 rounded-xl input"
              onChange={(e) => handleFilterTeam(e.target.value)}
            >
              <option value={""}>All teams</option>

              {teams.map((team) => (
                <option value={team.id}>{team.team_name}</option>
              ))}
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Research Area</th>
                <th>Current Week Status</th>
                <th>Goals Achieved (#)</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {students &&
                students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                    }}
                  >
                    <td>
                      {student.full_name} {student.team.id}
                    </td>
                    <td>{student.research_area}</td>

                    <td>
                      <div
                        className={`
    ${
      student.weekly_entries && student.weekly_entries[0]
        ? student.weekly_entries[0].overall_status === "not_achieved"
          ? "bg-red-500 text-white"
          : student.weekly_entries[0].overall_status === "partial"
          ? "bg-orange-500 text-white"
          : student.weekly_entries[0].overall_status === "achieved"
          ? "bg-green-500 text-white"
          : ""
        : ""
    } rounded-xl p-1 w-1/2`}
                      >
                        {student.weekly_entries && student.weekly_entries[0]
                          ? student.weekly_entries[0].overall_status ===
                            "not_achieved"
                            ? "Not achieved"
                            : student.weekly_entries[0].overall_status ===
                              "partial"
                            ? "Partial"
                            : "Achieved"
                          : "--"}
                      </div>
                    </td>

                    <td>
                      {student.weekly_entries && student.weekly_entries[0]
                        ? (() => {
                            const statuses = JSON.parse(
                              student.weekly_entries[0].per_goal_status_json
                            );
                            const achievedCount = statuses.filter(
                              (status: string) => status === "achieved"
                            ).length;
                            const totalCount = statuses.length;

                            return `${achievedCount} / ${totalCount}`;
                          })()
                        : "--"}
                    </td>
                    <td>{student.updated_at}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="flex w-full justify-center mt-10">
              <h1>Loading...</h1>
            </div>
          )}
        </>
      )}

      {selectedStudent && <StudentDetail selectedStudent={selectedStudent} />}
    </div>
  );
};
