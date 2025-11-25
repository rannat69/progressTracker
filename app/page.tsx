"use client";

import { Suspense, useEffect, useState } from "react";
import { login } from "../components/db/user";

import { useRouter } from "next/navigation";
import { getSessionId } from "@/components/db/sessions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    // read from supabase
    const getSessionTemp = async () => {
      const sessionId = sessionStorage.getItem("sessionId");
      if (sessionId && sessionId != "0") {
        const sessionRes = await getSessionId(Number(sessionId));

        console.log(sessionRes);

        if (sessionRes) {
          router.push(`/main?sessionId=${sessionId}`);
        }
      }
    };
    getSessionTemp();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (email && password) {
      const loginRes = await login(email, password);

      console.log("login Res", loginRes);

      if (!loginRes) {
        setError("Invalid email or password");
      } else {
        // Assuming loginRes contains the sessionId

        const sessionId = loginRes.randNumber; // Adjust according to your login response
        sessionStorage.setItem("sessionId", sessionId.toString());
        router.push(`/main`);
      }
    } else {
      console.log("error");
    }
  };

  function handleSignup(): void {
    router.push(`/signup`);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center mt-50">
        <h1 className="p-10">Welcome to Progress Tracker</h1>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-5">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              className="input"
              name="email"
              type="email"
              required
            />
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              className="input"
              name="password"
              type="password"
              required
            />
            <button type="submit" className="button">
              Log in
            </button>
            {error && <p className="error">{error}</p>}

            <div className="button" onClick={() => handleSignup()}>
              Sign up
            </div>
          </div>
        </form>
      </div>
    </Suspense>
  );
}
