import { useEffect, useState } from "react";

import { getStudentsInCourse } from "./db/courses";

export const CourseDetail = (selectedCourse: any) => {
  selectedCourse = selectedCourse.selectedCourse;
  // read data from supabase

  const [students, setStudents] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const getStudentsList = async () => {
      const studentsTemp = await getStudentsInCourse(selectedCourse.id);


      if (studentsTemp) {
        setStudents(studentsTemp);
      }
      setLoading(false);
    };

    getStudentsList();
  }, []);
  return (
    <div className="p-3">
      <>
        <h1>Students in course {selectedCourse.name}</h1>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Research Area</th>

            </tr>
          </thead>
          <tbody>
            {students &&
              students.map((student) => (
                <tr key={student.students.id}>
                  <td>{student.students.full_name}</td>
                  <td>{student.students.research_area}</td>
          
            
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
    </div>
  );
};
