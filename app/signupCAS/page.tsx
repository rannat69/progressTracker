"use client";

import { Suspense, useEffect, useState } from "react";
import { getUserFromEmail, login, signup } from "../../components/db/user";
import { get } from "http";
import { useRouter } from "next/navigation";
import { getSessionId } from "@/components/db/sessions";
import { getAllTeams } from "@/components/db/teams";
import { getAllCourses } from "@/components/db/courses";

export default function SignupCAS({ email }: { email: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [team, setTeam] = useState<any>();
  const [role, setRole] = useState<string>("student");

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const router = useRouter();
  useEffect(() => {
    // read from supabase
    const getSessionTemp = async () => {
      const teamsRes = await getAllTeams();

      if (teamsRes) {
        setTeams(teamsRes);

        setTeam(teamsRes[0].id);

        setRole("student");
      }

      const coursesRes = await getAllCourses();

      if (coursesRes) {
        setCourses(coursesRes);
      }
    };

    getSessionTemp();
  }, []);

  const handleSignup = async () => {
    setError("");
    setIsLoading(true);

    if (!firstName) {
      setError("First name is required");
      setIsLoading(false);
      return false;
    }

    if (!lastName) {
      setError("Last name is required");
      setIsLoading(false);
      return false;
    }

    // Assuming loginRes contains the sessionId

    await signup({
      email: email,
      password: "",
      firstName: firstName,
      lastName: lastName,
      team: team,
      courses: selectedCourses,
      role: role,
    });

    setError("Sign up complete");
    setIsLoading(false);
    router.push(`/`);
  };

  function handleTeam(value: string): void {
    setTeam(value);
  }

  function addToselectedCourses(id: string): void {
    // Check if the ID is already there
    const exists = selectedCourses.includes(id);

    if (exists) {
      // Remove it: Filter out the ID
      setSelectedCourses(selectedCourses.filter((courseId) => courseId !== id));
    } else {
      // Add it: Spread the existing IDs and add the new one
      setSelectedCourses([...selectedCourses, id]);
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center mt-50">
        <h1 className="p-5">Welcome to Progress Tracker</h1>
        <h1 className="p-5">Sign Up</h1>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <label htmlFor="firstName " className="w-40">
              First name:
            </label>
            <input
              id="firstName"
              className="input"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label htmlFor="lastName" className="">
              Last name:
            </label>
            <input
              id="lastName"
              className="input"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
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
            <label htmlFor="team" id="team" className="w-40">
              Courses:
            </label>

            {courses.map((course) => (
              <div
                className={`cursor-pointer rounded-xl p-2 transition-colors ${
                  selectedCourses.includes(course.id)
                    ? "bg-[#5555FF] text-white" // Colour when selected
                    : "bg-[#DDDDFF] text-black" // Colour when not selected
                }`}
                key={course.id}
                onClick={() => addToselectedCourses(course.id)}
              >
                {course.name}
              </div>
            ))}
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
            {email}
          </div>{" "}
          {isLoading ? (
            <>Loading ...</>
          ) : (
            <button className="button" onClick={() => handleSignup()}>
              Sign up
            </button>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </Suspense>
  );
}
