"use client";

import { useEffect, useState } from "react";
import { login, signup, getSession } from "./actions";
import { get } from "http";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    // read from supabase
    const getSessionTemp = async () => {
      const sessionId = sessionStorage.getItem("sessionId");
      if (sessionId && sessionId !="0") {
        const sessionRes = await getSession(Number(sessionId));

        console.log("sessionRes", sessionRes);

        if (sessionRes) {
          router.push(`/main`);
        }
      }
    };
    getSessionTemp();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const email = event.target.email.value; // Utilise l'événement pour accéder aux valeurs
    const password = event.target.password.value;

    if (email && password) {
      const loginRes = await login(email, password);

      console.log("loginRes", loginRes);

      if (!loginRes) {
        setError("Invalid email or password");
      }
    } else {
      console.log("error");
    }
  };

  return (
    <div className="flex flex-col items-center mt-50">
      <h1 className="p-10">Welcome to Progress Tracker</h1>

      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-5">
          <label htmlFor="email">Email:</label>
          <input id="email" className="input" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <input id="password" className="input" name="password" type="password" required />
          <button type="submit" className="button">Log in</button>
          {error && <p className="error">{error}</p>}
        </div>
      </form>
    </div>
  );
}
