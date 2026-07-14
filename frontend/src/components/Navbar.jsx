import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/trends", label: "Trends", icon: "📈" },
  { to: "/compare", label: "Compare", icon: "⇄" },
  { to: "/favorites", label: "Favorites", icon: "★" },
  { to: "/admin", label: "Admin", icon: "⚙" },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-hidden="true" />
        <span className="sidebar-title">Global Health Observatory</span>
      </div>

      <ul className="sidebar-links">
        {LINKS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              title={label}
            >
              <span className="sidebar-icon" aria-hidden="true">{icon}</span>
              <span className="sidebar-label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Auth section — sits at the bottom of the sidebar */}
      <div className="sidebar-auth">
        {isAuthenticated ? (
          <>
            <div className="sidebar-user" title={user.email}>
              <span className="sidebar-user-avatar" aria-hidden="true">
                {user.email[0]}
              </span>
              <div className="sidebar-user-info">
                <span className="sidebar-user-email">{user.email}</span>
                {user.role === "admin" && (
                  <span className="sidebar-user-role">Admin</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-link"
              title="Log out"
            >
              <span className="sidebar-icon" aria-hidden="true">←</span>
              <span className="sidebar-label">Log out</span>
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            title="Log in"
          >
            <span className="sidebar-icon" aria-hidden="true">→</span>
            <span className="sidebar-label">Log in</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;