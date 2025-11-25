"use client";

import { Suspense, useEffect, useState } from "react";
import { getUserFromEmail, login, signup } from "../../components/db/user";
import { get } from "http";
import { useRouter } from "next/navigation";
import { getSessionId } from "@/components/db/sessions";
import { getAllTeams } from "@/components/db/teams";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [team, setTeam] = useState<any>();
  const [role, setRole] = useState<string>("student");
  const router = useRouter();
  useEffect(() => {
    // read from supabase
    const getSessionTemp = async () => {
      const teamsRes = await getAllTeams();

      if (teamsRes) {
        setTeams(teamsRes);

        console.log("teamsRes", teamsRes[0].id);

        setTeam(teamsRes[0].id);

        setRole("student");
      }
    };

    getSessionTemp();
  }, []);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    setError("");
    setIsLoading(true);

    event.preventDefault(); // Empêche le rechargement de la page

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const password2 = formData.get("password2") as string;

    console.log("role", role);

    if (!firstName || firstName === "") {
      setError("First name is required");
      setIsLoading(false);
      return false;
    }

    if (!lastName || lastName === "") {
      setError("Last name is required");
      setIsLoading(false);
      return false;
    }

    if (!email || email === "") {
      setError("Last name is required");
      setIsLoading(false);
      return false;
    }

    if (!password || password === "") {
      setError("Password is required");
      setIsLoading(false);
      return false;
    }

    if (!password2 || password2 === "") {
      setError("Password is required");
      setIsLoading(false);
      return false;
    }

    if (password2 != password) {
      setError("Passwords do not match");
      setIsLoading(false);
      return false;
    }

    // check if email already exists
    const userFromEmail = await getUserFromEmail(email);

    if (userFromEmail) {
      setError("Email already exists");
      setIsLoading(false);
      return false;
    }
    // Assuming loginRes contains the sessionId

    await signup({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      team: team,
      role: role,
    });

    setError("Sign up complete");
    setIsLoading(false);
    router.push(`/`);
  };

  function handleTeam(value: string): void {
    console.log("value", value);

    setTeam(value);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center mt-50">
        <h1 className="p-5">Welcome to Progress Tracker</h1>
        <h1 className="p-5">Sign Up</h1>
        <form onSubmit={handleSignup}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <label htmlFor="firstName " className="w-40">
                First name:
              </label>
              <input
                id="firstName"
                className="input"
                name="firstName"
                required
              />
              <label htmlFor="lastName" className="">
                Last name:
              </label>
              <input id="lastName" className="input" name="lastName" required />
            </div>{" "}
            <div className="flex gap-2">
              <label htmlFor="team" id="team" className="w-40">
                Team:
              </label>
              <select
                className=" border-1 border-gray-200 p-2 rounded-xl input"
                onChange={(e) => handleTeam(e.target.value)}
              >
                {teams.map((team) => (
                  <option value={team.id}>{team.team_name}</option>
                ))}
              </select>{" "}
            </div>
            <div className="flex gap-2">
              <label htmlFor="team" className="w-40">
                Role:
              </label>
              <select
                className=" border-1 border-gray-200 p-2 rounded-xl input"
                id="role"
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>{" "}
            </div>
            <div className="flex gap-2">
              <label htmlFor="email" className="w-40">
                Email:
              </label>
              <input
                id="email"
                className="input"
                name="email"
                type="email"
                required
              />
            </div>{" "}
            <div className="flex gap-2">
              <label htmlFor="password" className="w-40">
                Password:
              </label>
              <input
                id="password"
                className="input"
                name="password"
                type="password"
                required
              />
            </div>
            <div className="flex gap-2">
              <label htmlFor="password2" className="w-40">
                Repeat password:
              </label>
              <input
                id="password2"
                className="input"
                name="password2"
                type="password"
                required
              />
            </div>
            {isLoading ? (
              <>Loading ...</>
            ) : (
              <button type="submit" className="button">
                Sign up
              </button>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </form>
      </div>
    </Suspense>
  );
}
