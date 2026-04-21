import { useEffect, useState } from "react";
import { StudentDetail } from "./studentDetail";
import {
  getAllCoursesInstructor,
  getAllInstructors,
  getAllInstructorsWithCourses,
} from "./db/instructors";

export const Instructors = () => {
  // read data from supabase

  const [instructors, setInstructors] = useState<any[]>([]);

  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const getInstructors = async () => {
      const instructorsTemp = await getAllInstructorsWithCourses();

      console.log("instructorsTemp", instructorsTemp);

      if (instructorsTemp) {
        setInstructors(instructorsTemp);
      }
      setLoading(false);
    };

    getInstructors();
  }, []);
  return (
    <div className="p-3">
      {!selectedInstructor && (
        <>
          <h1>Instructors</h1>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Courses</th>
              </tr>
            </thead>
            <tbody>
              {instructors &&
                instructors.map((instructor) => (
                  <tr
                    key={instructor.id}
                    onClick={() => {
                      //setSelectedInstructor(student);
                    }}
                  >
                    <td>{instructor.full_name}</td>
                    <td>{instructor.email}</td>
                    <td>
                      {instructor.instructors_courses
                        .map((insCourse: any) => insCourse.courses.name)
                        .join(", ")}
                    </td>
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

      {/*selectedStudent && <StudentDetail selectedStudent={selectedStudent} />*/}
    </div>
  );
};
