"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const userRes = await supabase.from("users").select("*").eq("email", email);

  if (!userRes || !userRes.data || userRes.data.length === 0) {
    return false;
  }

  // Initialiser le numéro aléatoire
  let randNumber;

  // Boucle jusqu'à ce qu'un numéro unique soit trouvé
  let sessionData = [];
  do {
    randNumber = Math.floor(Math.random() * 1000000);

    // Vérifiez si le numéro de session existe déjà
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_id", randNumber);

      console.log("error", error);
      console.log("data", data);
      sessionData = data || [];

      if (error) {
        console.error("Error checking session :", error);
        return { randNumber: 0, error: true };
      }
    } catch (error) {
      console.error("Error checking session :", error);
      return { randNumber: 0, error: true };
    }
  } while (sessionData.length > 0);
  // create record in table session
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      { session_id: randNumber, user_email: email, role: userRes.data[0].role },
    ]);

  revalidatePath("/", "layout");
  redirect(`/main?sessionId=${randNumber}`);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function getUserFromEmail(email: string) {
  const supabase = await createClient();

  const userRes = await supabase.from("users").select("*").eq("email", email);

  if (!userRes || !userRes.data || userRes.data.length === 0) {
    return false;
  }

  return userRes;
}
