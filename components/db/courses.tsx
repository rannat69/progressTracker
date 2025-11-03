"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllCourses() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("courses").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function getStudentsInCourse(courseId: string) {
  const supabase = await createClient();

  // get student info where course_id from students_courses = course_id

  const { data, error } = await supabase
    .from("students_courses")
    .select("*, students(*)")
    .eq("course_id", courseId);

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
