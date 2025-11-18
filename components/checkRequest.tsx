import { useEffect, useState } from "react";
import { getAllRequests, updateRequestStatus } from "./db/requests";
import { getTeamById, updateTeam } from "./db/teams";
import { createTeamExpense } from "./db/teamExpenses";

export const CheckRequest = () => {
  // read data from supabase

  const [requests, setRequests] = useState([]);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    const getRequests = async () => {
      const requestsTemp = await getAllRequests();

      if (requestsTemp) {
        console.log(requestsTemp);

        setRequests(requestsTemp);
        setLoading(false);
      }
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

    selectedRequest.status = "Accepted";
    updateRequestStatus(selectedRequest.id, "Accepted");

    // create team_expense

    createTeamExpense({
      team_id: selectedRequest.teams.id,
      title: selectedRequest.title,
      description: selectedRequest.description,
      value: selectedRequest.cost,
    });

    setSelectedRequest(null); // Close the popup
  };

  const handleDecline = () => {
    // Logic to decline the request
    console.log("Request declined:", selectedRequest);

    // set request to "Declined"
    selectedRequest.status = "Declined";

    updateRequestStatus(selectedRequest.id, "Declined");

    setSelectedRequest(null); // Close the popup
  };

  const Popup = ({ request, onClose, onAccept, onDecline }) => {
    return (
      <div className="fixed inset-0 bg-black/50  bg-opacity-5 flex justify-center items-center">
        <div className="bg-white p-5 rounded-lg shadow-lg">
          <h2>{request.title}</h2>
          <p>{request.teams.team_name}</p>
          <p>{request.description}</p>
          <p>Request Date: {request.date}</p>
          <p>Cost: {request.cost}</p>
          <p>Status: {request.status}</p>
          <div className="mt-4">
            <button
              onClick={onAccept}
              className="mr-2 bg-green-500 text-white p-2 rounded"
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="bg-red-500 text-white p-2 rounded"
            >
              Decline
            </button>
            <button
              onClick={onClose}
              className="ml-2 border border-gray-300 p-2 rounded"
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
            <th>Status</th>
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
                <td
                  className={
                    request.status === "Accepted"
                      ? "text-green-600"
                      : request.status === "Declined"
                      ? "text-red-500"
                      : ""
                  }
                >
                  {request.status}
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
