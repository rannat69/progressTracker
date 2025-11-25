import { useEffect, useState } from "react";
import { getAllUsers } from "./db/user";
import { getAllTeams } from "./db/teams";

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    setLoading(true);

    const getUsers = async () => {
      try {
        const usersTemp = await getAllUsers();

        console.log("usersTemp", usersTemp);

        if (usersTemp?.data) {
          setUsers(usersTemp.data);
        }

        const teamsRes = await getAllTeams();
        if (teamsRes) {
          setTeams(teamsRes);
        }
      } catch (error) {
        console.error("Error fetching users or teams:", error);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleUpdateUser = async () => {
    // Logic to accept the request (e.g., update the request status in your database)

    setError("");

    if (!selectedUser) {
      return null;
    }
    console.log("Updating user:", selectedUser);

    if (!firstName || !lastName) {
      setError("First name and last name are required.");
      return;
    }

    setSelectedUser(null); // Close the popup
  };

  const Popup = ({
    user,
    onClose,
    onUpdate,
  }: {
    user: any;
    onClose: () => void;
    onUpdate: () => void;
  }) => {
    console.log("user", user);

    setFirstName(user.first_name);
    setLastName(user.last_name);
    setRole(user.role);

    return (
      <div className="fixed inset-0 bg-black/50  bg-opacity-5 flex justify-center items-center">
        <div className="bg-white p-5 rounded-lg shadow-lg">
          <h2>{user.first_name + " " + user.last_name}</h2>
          First name
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          Last name{" "}
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label htmlFor="team" className="w-40">
            Role:
          </label>
          <select
            className="border-1 border-gray-200 p-2 rounded-xl input"
            id="role"
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);
              }}
          >
            <option value="USER">User</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <h3>Teams</h3>
          <div className="ml-2 border border-gray-300 p-2 rounded flex flex-col gap-3"></div>
          <div className="mt-4">
            <button
              onClick={onUpdate}
              className="mr-2 bg-green-500 text-white p-2 rounded cursor-pointer"
            >
              Update
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
      <h1>User Management</h1>
      <div className="flex flex-col gap-2 border-1 border-gray-200 rounded-xl p-3 m-3 background">
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Type</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                  }}
                >
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.instructor_id ? "Instructor" : "Student"}</td>

                  <td>{user.role}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && (
          <div className="flex w-full justify-center mt-10">
            <h1>Loading...</h1>
          </div>
        )}
      </div>

      {selectedUser && (
        <Popup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};
