"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllSessions() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("sessions").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function getSessionId(session_id: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_id", session_id);

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
