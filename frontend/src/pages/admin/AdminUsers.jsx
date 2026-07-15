import { useEffect, useState } from "react";
import { getUsers, addUser, updateUser, deleteUser } from "../../services/gho";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

const EMPTY_FORM = { email: "", password: "", name: "", phone: "", address: "", role: "user" };

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [rowError, setRowError] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.email || !form.password) return;

    addUser(form)
      .then((newUser) => {
        setUsers([...users, newUser]);
        setForm(EMPTY_FORM);
      })
      .catch((err) => setFormError(err.response?.data?.message || "Failed to add user"));
  };

  const startEdit = (u) => {
    setRowError(null);
    setEditingId(u.id);
    setEditForm({ name: u.name || "", email: u.email, phone: u.phone || "", address: u.address || "", role: u.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = (id) => {
    setRowError(null);
    updateUser(id, editForm)
      .then((updated) => {
        setUsers(users.map((u) => (u.id === id ? updated : u)));
        setEditingId(null);
        setEditForm(null);
      })
      .catch((err) => setRowError(err.response?.data?.message || "Failed to update user"));
  };

  const handleDelete = (id) => {
    setRowError(null);
    deleteUser(id)
      .then(() => setUsers(users.filter((u) => u.id !== id)))
      .catch((err) => setRowError(err.response?.data?.message || "Failed to delete user"));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="filter-card" style={{ marginBottom: "1.5rem", maxWidth: "520px" }}>
        <h3 className="filter-label">Add User</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="email"
            aria-label="Email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="filter-select"
          />
          <input
            type="password"
            aria-label="Password"
            placeholder="Initial password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="filter-select"
          />
          <input
            type="text"
            aria-label="Name"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="filter-select"
          />
          <input
            type="tel"
            aria-label="Phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="filter-select"
          />
          <input
            type="text"
            aria-label="Address"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="filter-select"
          />
          <select
            aria-label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="filter-select"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn-primary">
            Add User
          </button>
        </form>
        {formError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{formError}</p>}
      </div>

      {rowError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginBottom: "8px" }}>{rowError}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isEditing = editingId === u.id;
            const isSelf = u.id === currentUser?.id;

            if (isEditing) {
              return (
                <tr key={u.id}>
                  <td>
                    <input
                      className="filter-select"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="filter-select"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="filter-select"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="filter-select"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      className="filter-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button onClick={() => saveEdit(u.id)} className="btn-primary">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn-danger">
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={u.id}>
                <td>{u.name || "—"}</td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>{u.address || "—"}</td>
                <td>{u.role === "admin" ? "Admin" : "User"}</td>
                <td style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button onClick={() => startEdit(u)} className="btn-primary">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="btn-danger"
                    disabled={isSelf}
                    title={isSelf ? "You cannot delete your own account" : undefined}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
