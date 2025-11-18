import { useEffect, useState } from "react";
import { getAllTeams } from "./db/teams";
import { getSessionId } from "./db/sessions";
import { useRouter } from "next/navigation";
import { getUserFromEmail } from "./db/user";
import { createRequest } from "./db/requests";

export const MakeRequest = () => {
  const showToast = (message: string, type = "info", timeout = 3000) => {
    const container = document.getElementById("toastContainer");
    const div = document.createElement("div");
    div.className = `absolute bottom-4 right-4 p-4  text-red rounded-lg shadow-lg transition-opacity duration-200 ${type}`;
    div.textContent = message;
    if (container) {
      container.appendChild(div);
      setTimeout(() => {
        div.style.opacity = "0";
        div.style.transform = "translateY(8px)";
        setTimeout(() => div.remove(), 200);
      }, timeout);
    }
  };

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsRes = await getAllTeams();
      if (teamsRes) {
        console.log("teamsRes", teamsRes);

        setTeams(teamsRes);

        setTeam(teamsRes[0].id);
      }
    };

    fetchTeams();
  }, []);

  async function handleSaveRequest(): Promise<void> {
    // check if cost is numeric and > 0
    if (isNaN(cost) || cost <= 0) {
      showToast("Cost must be a positive number.", "error");
      return;
    }

    // check if rqTitle is not empty
    if (title === "") {
      showToast("Request title cannot be empty.", "error");
      return;
    }

    if (desc === "") {
      showToast("Request description cannot be empty.", "error");
      return;
    }

    // check team budget
    const teamInfo = teams.find((t) => t.id === team);

    console.log("team", team);

    if (teamInfo) {
      if (teamInfo.budget < cost) {
        showToast("Team budget is not enough.", "error");
        return;
      }
    }

    const sessionId = sessionStorage.getItem("sessionId");

    const dataSession = await getSessionId(sessionId);
    let role = "";
    let email = "";
    if (!dataSession) {
      router.push("/");
    } else {
      role = dataSession[0].role;
      email = dataSession[0].user_email;
    }

    const dataUser = await getUserFromEmail(email);
    if (!dataUser) {
      router.push("/");
    }
    // make an insert into table requests in supabase
    const createTeamRes = await createRequest(
      cost,
      date,
      team,
      title,
      desc,
      role,
      dataUser.data[0].id
    );

    showToast("Request created successfully.", "success");
    setCost(0);
    setTitle("");
    setDesc("");
  }

  return (
    <div className="p-3">
      <div id="toastContainer"></div>
      <h1>Make Request</h1>

      <div className="flex flex-col bg-white border-1 border-gray-200 p-2 rounded-xl  gap-2">
        <h3>Title</h3>
        <input
          type="text"
          placeholder="Request title"
          className="border-1 border-gray-200 p-2 rounded-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <h3>Description</h3>
        <input
          type="text"
          placeholder="Request description"
          className="border-1 border-gray-200 p-2 rounded-xl"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <h3>Team</h3>
        <select
          id="requestTeam"
          className="border-1 border-gray-200 p-2 rounded-xl"
          onChange={(e) => setTeam(e.target.value)}
        >
          {teams.map((team) => (
            <option value={team.id}>{team.team_name}</option>
          ))}
        </select>

        <h3>Date</h3>
        <input
          type="date"
          placeholder="Request date"
          className="border-1 border-gray-200 p-2 rounded-xl"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <h3>Cost</h3>
        <input
          type="number"
          placeholder="Request cost"
          className="border-1 border-gray-200 p-2 rounded-xl"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
        />

        <button className="buttonRed w-1/4" onClick={() => handleSaveRequest()}>
          Save
        </button>
      </div>
    </div>
  );
};
