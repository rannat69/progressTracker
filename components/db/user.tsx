"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import bcrypt from "bcrypt";

export async function getAllUsers() {
  const supabase = await createClient();
  const users = await supabase.from("users").select("*");

  return users;
}

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const userRes = await supabase.from("users").select("*").eq("email", email);

  console.log("userRes ", userRes);
  console.log("userRes data", userRes.data);

  if (!userRes || !userRes.data || userRes.data.length === 0) {
    return false;
  }

  /*console.log("userRes", userRes.data);

  const hash = await bcrypt.hash(userRes.data[0].password, 10);

  console.log("hash", hash);
*/
  function verifyPassword(password: string, userHashedPassword: string) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, userHashedPassword, (err, result) => {
        if (err) {
          return reject(err); // Handle error
        }
        resolve(result); // Return the comparison result
      });
    });
  }

  // Usage with async/await

  try {
    const isValid = await verifyPassword(password, userRes.data[0].password);
    if (isValid) {
      console.log("Password is valid!");
    } else {
      console.log("Invalid password.");
      return false;
    }
  } catch (error) {
    console.error(error); // Handle error
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
  return { randNumber: randNumber, error: false };
  // revalidatePath("/", "layout");
  //redirect(`/main?sessionId=${randNumber}`);
}

export async function signup(formData: any) {
  const supabase = await createClient();
  let newId = null;
  // create student or instructor
  if (formData.role === "student") {
    const { data: student, error } = await supabase
      .from("students")
      .insert([
        {
          full_name: formData.firstName + " " + formData.lastName,
          email: formData.email,
          status: "active",
        },
      ])
      .select();

    if (student) {
      newId = student[0].id;
    }

    if (error) {
      console.error("error", error);

      redirect("/error");
    }
  } else if (formData.role === "instructor") {
    const { data: instructor, error } = await supabase
      .from("instructors")
      .insert([
        {
          full_name: formData.firstName + " " + formData.lastName,
          email: formData.email,
        },
      ])
      .select();

    if (instructor) {
      newId = instructor[0].id;
    }

    if (error) {
      console.error("error", error);

      redirect("/error");
    }
  }

  // create record in user

  if (newId) {
    // if student, create record in team_memberships

    if (formData.role === "student") {
      const { data: team, error } = await supabase
        .from("team_memberships")
        .insert([
          {
            student_id: newId,
            team_id: formData.team,
            role_in_team: "member",
          },
        ])
        .select();

      if (error) {
        console.error("error", error);
        redirect("/error");
      }
    }

    if (formData.role === "instructor") {
      const { data: team, error } = await supabase
        .from("team_instructors")
        .insert([
          {
            instructor_id: newId,
            team_id: formData.team,
          },
        ])
        .select();

      if (error) {
        console.error("error", error);
        redirect("/error");
      }
    }

    const hash = await bcrypt.hash(formData.password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: hash,
          role: "USER",
          instructor_id: formData.role === "instructor" ? newId : null,
          student_id: formData.role === "student" ? newId : null,
        },
      ])
      .select();

    if (error) {
      console.error("error", error);
      redirect("/error");
    }
  }
}

export async function getUserFromEmail(email: string) {
  const supabase = await createClient();

  const userRes = await supabase.from("users").select("*").eq("email", email);

  if (!userRes || !userRes.data || userRes.data.length === 0) {
    return false;
  }

  return userRes;
}

export async function getAvailableTeams(user: any) {
  // get all teams
  const supabase = await createClient();

  if (user.instructor_id) {
    // get records from team_instructors where instructor_id = user.instructor_id
    const { data: teams, error } = await supabase
      .from("team_instructors")
      .select("*, teams (*)")
      .eq("instructor_id", user.instructor_id);

    if (teams) {
      return teams;
    }
  }


  if (user.student_id) {
    // get records from team_instructors where instructor_id = user.instructor_id
    const { data: teams, error } = await supabase
      .from("team_memberships")
      .select("*, teams (*)")
      .eq("student_id", user.student_id);

    if (teams) {
      return teams;
    }
  }
}

export async function updateUser(id: any, formData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role,
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating user:", error);
    return error; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
