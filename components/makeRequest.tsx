import { useEffect, useState } from "react";
import { getAllTeams } from "./db/teams";
import { getSessionId } from "./db/sessions";
import { useRouter } from "next/navigation";
import { getUserFromEmail } from "./db/user";
import { createRequest, createRequestItems } from "./db/requests";

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
  const [teams, setTeams] = useState<any[]>([]);
  const [team, setTeam] = useState("");

  const [items, setItems] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsRes = await getAllTeams();
      if (teamsRes) {
        setTeams(teamsRes);

        setTeam(teamsRes[0].id);
      }
    };

    fetchTeams();

    // set items with 3 records
    const itemsTemp = [];
    for (let i = 0; i < 1; i++) {
      itemsTemp.push({
        id: i,
        title: "",
        desc: "",
        cost: 0,
        link: "",
      });
    }

    setItems(itemsTemp);
  }, []);

  function handleAddItem() {
    const itemsTemp = [...items];
    itemsTemp.push({
      id: items.length,
      title: "",
      desc: "",
      cost: 0,
      link: "",
    });
    setItems(itemsTemp);
  }

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

    // check items, if no title or no description or price <0, error
    for (const item of items) {
      if (item.title === "") {
        showToast("Item title cannot be empty.", "error");
        return;
      }
      if (item.desc === "") {
        showToast("Item description cannot be empty.", "error");
        return;
      }
      if (isNaN(item.cost) || item.cost <= 0) {
        showToast("Item cost must be a positive number.", "error");
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
    if (
      !dataUser ||
      !dataUser.data ||
      !Array.isArray(dataUser.data) ||
      dataUser.data.length === 0
    ) {
      router.push("/");
      return;
    }
    // make an insert into table requests in supabase
    const createRequestRes = await createRequest(
      cost,
      date,
      team,
      title,
      desc,
      role,
      (dataUser.data as any[])[0].id
    );

    if (!createRequestRes) {
      showToast("Error creating request.", "error");
      return;
    } else {
      await createRequestItems((createRequestRes as any[])[0].id, items);
    }

    showToast("Request created successfully.", "success");
    setCost(0);
    setItems([]);
    setTitle("");
    setDesc("");
  }

  function handleRemoveItem(id: any): void {
    //remove record from items

    let itemsTemp = [...items];

    itemsTemp = itemsTemp.filter((item) => item.id !== id);

    setItems(itemsTemp);
  }

  function handleCost() {}

  return (
    <div className="p-3">
      <div id="toastContainer"></div>
      <h1>Make Request</h1>

      <div className="flex flex-col background border-1 border-gray-200 p-2 rounded-xl  gap-2">
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

        <h3>Items</h3>
        <div className="m-5 flex flex-col gap-10">
          {items.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-2">
              <h4>Title</h4>
              <input
                type="text"
                placeholder="Item title"
                className="border-1 border-gray-200 p-2 rounded-xl w-1/4"
                value={item.title}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[item.id].title = e.target.value;
                  setItems(newItems);
                }}
              />
              <h4>Description</h4>
              <input
                type="text"
                placeholder="Item description"
                className="border-1 border-gray-200 p-2 rounded-xl w-1/4"
                value={item.desc}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[item.id].desc = e.target.value;
                  setItems(newItems);
                }}
              />
              <h4>Cost</h4>
              <input
                type="number"
                placeholder="Item cost"
                className="border-1 border-gray-200 p-2 rounded-xl w-1/4"
                value={item.cost}
                onChange={(e) => {
                  const newCost = Number(e.target.value);

                  // Check if cost is numeric and > 0
                  if (isNaN(newCost) || newCost <= 0) {
                    showToast("Cost must be a positive number.", "error");
                    return;
                  }

                  const newItems = [...items];
                  newItems[index].cost = newCost; // Use index here
                  setItems(newItems);

                  // Recalculate total cost
                  const totalCost = newItems.reduce((sum, currItem) => {
                    return sum + (currItem.cost || 0);
                  }, 0);
                  setCost(totalCost);
                }}
              />
              <h4>Link</h4>
              <input
                type="text"
                placeholder="Item link"
                className="border-1 border-gray-200 p-2 rounded-xl w-1/4"
                value={item.link}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[item.id].link = e.target.value;
                  setItems(newItems);
                }}
              />

              <button
                className="button w-1/6"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove item
              </button>
            </div>
          ))}
        </div>
        <button className="button w-1/4" onClick={() => handleAddItem()}>
          Add item
        </button>

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
