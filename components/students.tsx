import { getAllStudents } from "@/components/db/students";
import { useEffect, useState } from "react";
import { StudentDetail } from "./studentDetail";

export const Students = () => {
  // read data from supabase

  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const getStudents = async () => {
      const studentsTemp = await getAllStudents();

      if (studentsTemp) {
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
          <h1>Students</h1>

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
