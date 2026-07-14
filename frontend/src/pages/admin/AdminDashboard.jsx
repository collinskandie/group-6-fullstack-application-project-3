import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminCountries from "./AdminCountries";
import AdminIndicators from "./AdminIndicators";
import AdminDataPoints from "./AdminDataPoints";
import AdminUsers from "./AdminUsers";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { key: "countries", label: "Countries" },
  { key: "indicators", label: "Indicators" },
  { key: "data", label: "Data" },
  { key: "users", label: "Users" },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("countries");
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="main-content">
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="placeholder-text" style={{ margin: "0.5rem 0 0 0" }}>
            Signed in as: <strong>{user?.email}</strong>
          </p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Log Out
        </button>
      </header>

      <div className="controls-group">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`select ${tab === key ? "active-tab" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "countries" && <AdminCountries />}
      {tab === "indicators" && <AdminIndicators />}
      {tab === "data" && <AdminDataPoints />}
      {tab === "users" && <AdminUsers />}
    </main>
  );
}

export default AdminDashboard;