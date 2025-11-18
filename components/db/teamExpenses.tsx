"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllTeamExpenses() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("team_expenses").select("*");
  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function createTeamExpense(expense: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_expenses")
    .insert(expense)
    .select()
    .then(({ data, error }) => {
      if (error) {
        console.error("Error creating team expense:", error);
        return error; // Handle the error as needed
      }

      if (data && data.length > 0) {
        return data;
      } else {
        return null;
      }
    });
}
