import { useEffect, useState } from "react";
import { StudentDetail } from "./studentDetail";
import { getAllCourses } from "./db/courses";
import { CourseDetail } from "./courseDetail";

export const Courses = () => {
  // read data from supabase

  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const getCourses = async () => {
      const coursesTemp = await getAllCourses();

      if (coursesTemp) {
        setCourses(coursesTemp);
        setLoading(false);
      }
    };

    getCourses();
  }, []);
  return (
    <div className="p-3">
      {selectedCourse && (
        <div
          className="font-bold cursor-pointer"
          onClick={() => {
            setSelectedCourse(null);
          }}
        >
          Back{" "}
        </div>
      )}

      {!selectedCourse && (
        <>
          <h1>Courses</h1>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Start date</th>
              </tr>
            </thead>
            <tbody>
              {courses &&
                courses.map((course) => (
                  <tr
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                    }}
                  >
                    <td>{course.name}</td>
                    <td>{course.description}</td>
                    <td>{course.start_date}</td>
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

      {selectedCourse && <CourseDetail selectedCourse={selectedCourse} />}
    </div>
  );
};
