import { getAllStudentsWeeklyEntries } from "@/components/db/students";
import { useEffect, useState } from "react";
import { StudentDetail } from "./studentDetail";

export const Dashboard = () => {
  // read data from supabase

  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loading, setLoading] = useState(false);

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
        console.log("studentsTemp", studentsTemp);

        for (const student of studentsTemp) {
          student.weekly_entries = student.weekly_entries.filter((entry) => {
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

            console.log("entryDateOnly", entryDateOnly);
            console.log("currentWeekMondayOnly", currentWeekMondayOnly);

            return entryDateOnly.getTime() === currentWeekMondayOnly.getTime();
          });
        }

        console.log("studentsTempFiltered ", studentsTemp);
        setStudents(studentsTemp);
        setLoading(false);
      }
    };

    getStudents();
  }, []);
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
          <h1>Dashboard</h1>
          <div className="flex ">
            <div className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 bg-white w-1/3">
              <h3>Active students</h3>
              <h1>{students.length}</h1>
            </div>

            <div className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 bg-white w-1/3">
              <h3>% with entry this week</h3>
              <h1>{students.length}</h1>
            </div>
            <div className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 bg-white w-1/3">
              <h3>Completion rate this week</h3>
              <h1>{students.length}</h1>
            </div>
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
                    <td>{student.full_name}</td>
                    <td>{student.research_area}</td>
                    <td>--</td>
                    <td>--</td>
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
