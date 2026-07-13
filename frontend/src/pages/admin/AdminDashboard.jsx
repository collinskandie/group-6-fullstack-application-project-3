import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AdminCountries from "./AdminCountries";
import AdminIndicators from "./AdminIndicators";
import AdminDataPoints from "./AdminDataPoints";
import AdminUsers from "./AdminUsers";
import { AuthContext } from "../context/AuthContext"; // Integrated with Rhoda's context

const TABS = [
  { key: "countries", label: "Countries" },
  { key: "indicators", label: "Indicators" },
  { key: "data", label: "Data" },
  { key: "users", label: "Users" },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("countries");
  
  // Consume Rhoda's auth state and unified logout process
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout(); // Let Rhoda's context handle clearing tokens cleanly
    navigate("/login"); // Redirect to the unified single login flow
  };

  // Guard clause: Secure layout check in case a normal user navigates here manually
  if (user?.role !== "admin") {
    return (
      <main className="main-content">
        <div className="error-banner">
          Access Denied: Administrative privileges required.
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="placeholder-text" style={{ margin: "0.5rem 0 0 0" }}>
            Signed in as: <strong>{user?.email || user?.username}</strong>
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