"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllInstructors() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("instructors").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

// get all courses for a specific instructor
export async function getAllCoursesInstructor(instructorId: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("instructors_courses")
    .select("course_id")
    .eq("instructor_id", instructorId);
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
