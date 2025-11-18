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

export async function getTeamById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching team:", error);
    return null; // Handle the error as needed
  }

  if (data) {
    return data;
  } else {
    return null;
  }
}

export async function updateTeam(id: number, team: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .update(team)
    .eq("id", id)
    .select()
    .then(({ data, error }) => {
      if (error) {
        console.error("Error updating team:", error);
        return error; // Handle the error as needed
      }

      if (data && data.length > 0) {
        return data;
      } else {
        return null;
      }
    });
}
