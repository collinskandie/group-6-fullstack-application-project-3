import { useEffect, useState } from "react";
import { getUsers } from "../../services/gho";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.email}</td>
            <td>{u.role === "admin" ? "Admin" : "User"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AdminUsers;
