import { useEffect, useState } from "react";
import { getAllUsers, updateUser } from "./db/user";
import { getAllTeams } from "./db/teams";

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    const getUsers = async () => {
      try {
        const usersTemp = await getAllUsers();


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

  const Popup = ({ user, onClose }: { user: any; onClose: () => void }) => {
    const [firstName, setFirstName] = useState(user.first_name);
    const [lastName, setLastName] = useState(user.last_name);
    const [role, setRole] = useState(user.role);

    useEffect(() => {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setRole(user.role);
    }, [user]);

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

      user.first_name = firstName;
      user.last_name = lastName;

      if (user.role != "ADMIN") {
        user.role = role;
      }

      // update table User

      await updateUser(user.id, {
        firstName,
        lastName,
        role: user.role !== "ADMIN" ? role : user.role,
      });

      setSelectedUser(null); // Close the popup
    };

    return (
      <div className="fixed inset-0 bg-black/50  bg-opacity-5 flex justify-center items-center">
        <div className="bg-white p-5 rounded-lg shadow-lg">
          <div>
            <div>{user.first_name + " " + user.last_name}</div>
            First name{" "}
            <input
              value={firstName}
              className="border-1 rounded-xl p-1"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            Last name{" "}
            <input
              value={lastName}
              className="border-1 rounded-xl p-1"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
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
            disabled={user.role === "ADMIN"} // Disable if the user role is ADMIN
          >
            <option value="USER">User</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <h3>Teams</h3>
          <div className="ml-2 border border-gray-300 p-2 rounded flex flex-col gap-3"></div>
          <div className="mt-4">
            <button
              onClick={() => handleUpdateUser()}
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
        <Popup user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};
