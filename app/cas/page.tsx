"use client";

import { getUserFromEmail, loginNoPassword } from "@/components/db/user";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import SignupCAS from "../signupCAS/page";

export default function Dashboard() {
  const [user, setUser] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mode, setMode] = useState<string>("");

  const [signUp, setSignUp] = useState<boolean>(false);

  const authorisedUsers = ["remia", "atomyuen"];

  const router = useRouter();

  useEffect(() => {
    console.log("useEffect");

    // Check for the ?ticket in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get("ticket"); // Get the value of the ticket parameter

    if (ticket) {
      console.log("Ticket found:", ticket); // Log the ticket if present
      // Optionally, you can perform actions based on the ticket

      fetch("/api/cas/serviceValidate", {
        method: "POST", // Specify the method as POST
        credentials: "include", // Include credentials
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify({ ticket }), // Stringify the body object
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.message);

          // Function to parse the XML and extract needed values
          function extractUserInfo(xml: string) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "application/xml");

            // Extract values using the appropriate tags
            const userElement = xmlDoc.getElementsByTagName("cas:user")[0];
            const nameElement = xmlDoc.getElementsByTagName("cas:name")[0];
            const emailElement = xmlDoc.getElementsByTagName("cas:mail")[0];
            const departmentNumberElement = xmlDoc.getElementsByTagName(
              "cas:departmentNumber",
            )[0];

            // Initialize variables
            let userTemp: string = "";
            let name: string = "";
            let email: string = "";
            let departmentNumber: string = "";

            // Check and assign textContent if elements are found
            if (userElement) {
              userTemp = userElement.textContent;
            } else {
              console.warn("User element not found.");
            }

            if (nameElement) {
              name = nameElement.textContent;
            } else {
              console.warn("Name element not found.");
            }

            if (emailElement) {
              email = emailElement.textContent;
            } else {
              console.warn("Email element not found.");
            }

            if (departmentNumberElement) {
              departmentNumber = departmentNumberElement.textContent;
            } else {
              console.warn("Department number element not found.");
            }

            // Extract all eduPersonAffiliation tags
            const eduPersonAffiliations = Array.from(
              xmlDoc.getElementsByTagName("cas:eduPersonAffiliation"),
            ).map((elem) => elem.textContent);

            return {
              userTemp,
              name,
              email,
              departmentNumber,
              eduPersonAffiliations,
            };
          }

          // Call the function and log the result
          const userInfo = extractUserInfo(data.message);

          if (
            userInfo.userTemp &&
            authorisedUsers.includes(userInfo.userTemp)
          ) {
            setUser(userInfo.userTemp || "Unknown user");

            // Check if user exists in DB, if not, signup

            const findUser = async (email: string) => {
              const userEmail = await getUserFromEmail(userInfo.email);

              console.log("userEmail", userEmail);

              if (userEmail && userEmail.data.length > 0) {
                const loginRes = await loginNoPassword(email);

                if (loginRes) {
                  const sessionId = loginRes.randNumber; // Adjust according to your login response
                  sessionStorage.setItem("sessionId", sessionId.toString());
                  router.push(`/main`);
                }
              } else {
                setEmail(userInfo.email);
                setSignUp(true);
              }
            };

            findUser(userInfo.email);
            // If exists, go to main

            history.replaceState(
              { key: "value" },
              "Title",
              process.env.NEXT_PUBLIC_BASE_URL + "/cas",
            );
          } else {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "/";
            location.href = baseUrl;
          }
        })
        .catch((error) => {
          console.error("Error:", error); // Log any errors
        });
    } else {
      location.href =
        "https://cas.ust.hk/cas/login?service=" +
        process.env.NEXT_PUBLIC_BASE_URL +
        "/cas";
    }
  }, []);

  if (!user) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user}</h1>
      <p>You are authenticated via CAS.</p>

      {signUp && <SignupCAS email={email} />}
    </div>
  );
}
