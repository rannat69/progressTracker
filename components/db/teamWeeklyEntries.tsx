"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllTeamWeeklyEntries() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_weekly_entries")
    .select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
