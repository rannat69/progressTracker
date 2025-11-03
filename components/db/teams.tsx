"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllTeams() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("teams").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function getAllTeamsInfo() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("teams").select(`
    *,
    team_memberships (
      *,
      students (*)
    ),
    team_expenses (*),
    team_weekly_entries (*)
  `);

  if (error) {
    console.error("Error fetching teams:", error);
    return null; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
