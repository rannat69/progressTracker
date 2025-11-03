"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Students } from "@/components/students";
import { Instructors } from "@/components/instructors";
import { Courses } from "@/components/courses";
import { Teams } from "@/components/teams";

export default function Main() {
  // get parameter from browser
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<string>("dashboard");

  useEffect(() => {
    const sessionId = searchParams?.get("sessionId") ?? "0";

    console.log("Session ID:", sessionId);

    // only set if not already set
    if (sessionId && sessionId != "0") {
      sessionStorage.setItem("sessionId", sessionId);
    }

    if (
      sessionStorage.getItem("sessionId") &&
      sessionStorage.getItem("sessionId") !== "0"
    ) {
    } else {
      router.push("/");
    }
  }, []);

  const menu = [
    {
      title: "Dashboard",
      id: "dashboard",
    },
    {
      title: "Students",
      id: "students",
    },
    {
      title: "Instructors",
      id: "instructors",
    },
    {
      title: "Courses",
      id: "courses",
    },
    {
      title: "Teams",
      id: "teams",
    },
    {
      title: "Reports",
      id: "reports",
    },
    {
      title: "Settings",
      id: "settings",
    },
    {
      title: "Make a request",
      id: "mkRequest",
    },
    {
      title: "Check outstanding requests",
      id: "chkRequests",
    },
    {
      title: "Log out",
      id: "logout",
    },
  ];

  return (
    <div className="flex ">
      <div className="flex flex-col w-1/6 border-r-1 border-gray-200">
        <div className="p-2 border-b-1 border-gray-200 flex gap-2">
          <div className="p-1 bg-red-600 text-white font-bold rounded-lg">
            TIE
          </div>{" "}
          <h1>HKUST MPhil TIE</h1>
        </div>
        <div className="flex flex-col p-3 gap-1  border-b-1 border-gray-200">
          {menu.map((item) => (
            <h2
              key={item.id}
              className={`p-2 hover:bg-gray-100 cursor-pointer rounded-lg ${
                mode === item.id ? "hover:bg-red-500 bg-red-600 text-white" : ""
              }`}
              onClick={() => setMode(item.id)}
            >
              {item.title}
            </h2>
          ))}
        </div>
      </div>
      <div className="bg-[#f7f7fb] w-full border-b-1 border-gray-200">
        <div>{mode === "dashboard" && <div>Dashboard</div>}</div>
        <div>{mode === "students" && <Students />}</div>
        <div>{mode === "instructors" && <Instructors />}</div>
        <div>{mode === "courses" && <Courses />}</div>
        <div>{mode === "teams" && <Teams />}</div>
      </div>
    </div>
  );
}
