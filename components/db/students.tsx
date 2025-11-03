"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllStudents() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("students").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function getStudentWeeklyEntries(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_entries")
    .select("*")
    .eq("student_id", studentId);
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

// enter new student weekly entry
export async function enterStudentWeeklyEntry(
  studentId: string,
  goals: string,
  date: string,
  goal_status: string,
  overall_status: string,
  progress_notes: string,
  next_week_goals_json: string
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("weekly_entries")
      .insert([
        {
          student_id: studentId,
          week_start_date: date,
          goals_set_json: goals,
          per_goal_status_json: goal_status,
          overall_status: overall_status,
          progress_notes: progress_notes,
          next_week_goals_json: next_week_goals_json,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message); // Throw error if Supabase returns an error
    }

    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.error("Error entering weekly entry:", err);
    return null; // Return null or handle error as needed
  }
}
