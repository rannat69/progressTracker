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
