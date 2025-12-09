import { useEffect, useState } from "react";
import { getAllRequests, updateRequestStatus } from "./db/requests";
import { getTeamById, updateTeam } from "./db/teams";
import { createTeamExpense } from "./db/teamExpenses";
import { getSessionId } from "./db/sessions";
import { getAvailableTeams, getUserFromEmail } from "./db/user";
import { useRouter } from "next/navigation";

export const CheckRequest = () => {
  // read data from supabase

  const [requests, setRequests] = useState<any[]>([]);

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    const getRequests = async () => {
      const requestsTemp = await getAllRequests();

      if (requestsTemp) {
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

        if (role != "ADMIN") {
          const availableTeamsRes = await getAvailableTeams(dataUser.data[0]);

          if (availableTeamsRes) {
            let teamsTemp = [];

            for (const avTeam of availableTeamsRes) {
              teamsTemp.push(avTeam.teams);
            }

            if (requestsTemp) {
              const filteredRequests = requestsTemp.filter((request) => {
                return teamsTemp.some((team) => team.id === request.teams.id);
              });

              setRequests(filteredRequests);
            }
          } else {
            setRequests([]);
          }
        } else {
          setRequests(requestsTemp);
        }
      }

      setLoading(false);
    };

    getRequests();
  }, []);

  const handleAccept = async () => {
    // Logic to accept the request (e.g., update the request status in your database)

    setError("");

    if (!selectedRequest) {
      return null;
    }
    console.log("Request accepted:", selectedRequest);
    // set request to "Accepted"
    selectedRequest.status = "Accepted";
    // update team budget
    const teamRes = await getTeamById(selectedRequest.teams.id);

    // check if enough budget
    if (teamRes.budget < selectedRequest.cost) {
      console.log("Not enough budget");
      setError("Not enough budget");
      return;
    } else {
      updateTeam(teamRes.id, {
        ...teamRes,
        budget: teamRes.budget - selectedRequest.cost,
      });
    }

    // get email of current user from session
    const sessionId = sessionStorage.getItem("sessionId");
    const session = await getSessionId(sessionId);
    if (session) {
      const user = await getUserFromEmail(session[0].user_email);

      if (user) {
        updateRequestStatus(selectedRequest.id, user.data[0].id, "Accepted");
      }
    }

    // create team_expense

    createTeamExpense({
      team_id: selectedRequest.teams.id,
      title: selectedRequest.title,
      description: selectedRequest.description,
      value: selectedRequest.cost,
    });

    setSelectedRequest(null); // Close the popup
  };

  const handleDecline = async () => {
    // Logic to decline the request
    console.log("Request declined:", selectedRequest);

    // set request to "Declined"
    selectedRequest.status = "Declined";

    const sessionId = sessionStorage.getItem("sessionId");
    const session = await getSessionId(sessionId);
    if (session) {
      const user = await getUserFromEmail(session[0].user_email);

      if (user) {
        updateRequestStatus(selectedRequest.id, user.data[0].id, "Declined");
      }
    }
    setSelectedRequest(null); // Close the popup
  };

  const Popup = ({
    request,
    onClose,
    onAccept,
    onDecline,
  }: {
    request: any;
    onClose: () => void;
    onAccept: () => void;
    onDecline: () => void;
  }) => {
    return (
      <div className="fixed inset-0 bg-black/50  bg-opacity-5 flex justify-center items-center">
        <div className="bg-white p-5 rounded-lg shadow-lg">
          <h2>{request.title}</h2>
          <p>{request.teams.team_name}</p>
          <p>{request.description}</p>
          <p>Request Date: {request.date}</p>
          <p>Total cost: {request.cost}</p>
          <p>Status: {request.status}</p>

          <h3>Items</h3>
          <div className="ml-2 border border-gray-300 p-2 rounded flex flex-col gap-3">
            {request.requests_items.map((item: any) => (
              <div key={item.id}>
                <p>{item.item_name}</p>
                <p>{item.item_description}</p>
                <p>{item.link}</p>
                <p>{item.cost} HKD</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={onAccept}
              className="mr-2 bg-green-500 text-white p-2 rounded cursor-pointer"
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="bg-red-500 text-white p-2 rounded cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={onClose}
              className="ml-2 border border-gray-300 p-2 rounded cursor-pointer"
            >
              Close
            </button>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3">
      <h1>Check Request</h1>

      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Name</th>
            <th>Description</th>
            <th>Start date</th> <th>Cost</th>
            <th>Requested by</th>
            <th>Status</th>
            <th>Addressed by</th>
          </tr>
        </thead>
        <tbody>
          {requests &&
            requests.map((request) => (
              <tr
                key={request.id}
                onClick={() => {
                  if (request.status === "Pending") {
                    setSelectedRequest(request);
                  }
                }}
              >
                <td>{request.teams.team_name}</td>

                <td>{request.title}</td>
                <td>{request.description}</td>
                <td>{request.date}</td>
                <td>{request.cost}</td>
                <td>
                  {request.author.first_name + " " + request.author.last_name}
                </td>
                <td>
                  <div
                    className={
                      request.status === "Accepted"
                        ? "w-1/2 p-2 rounded-xl text-white bg-green-600"
                        : request.status === "Declined"
                        ? "w-1/2 p-2 rounded-xl text-white bg-red-500 "
                        : ""
                    }
                  >
                    {request.status}
                  </div>
                </td>
                <td>
                  {request.validator
                    ? request.validator.first_name +
                      " " +
                      request.validator.last_name
                    : ""}
                </td>
       
              </tr>
            ))}
        </tbody>
      </table>

      {loading && (
        <div className="flex w-full justify-center mt-10">
          <h1>Loading...</h1>
        </div>
      )}

      {selectedRequest && (
        <Popup
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
};
