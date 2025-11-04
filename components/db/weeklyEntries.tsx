"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllWeeklyEntries() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("weekly_entries").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}