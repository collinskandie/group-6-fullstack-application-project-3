const LINKS = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "trends", label: "Trends", icon: "📈" },
  { key: "compare", label: "Compare", icon: "⇄" },
];

function Navbar({ view, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-hidden="true" />
        <span className="sidebar-title">Global Health Observatory</span>
      </div>
      <ul className="sidebar-links">
        {LINKS.map(({ key, label, icon }) => (
          <li key={key}>
            <button
              className={`sidebar-link${view === key ? " active" : ""}`}
              onClick={() => onNavigate(key)}
              title={label}
            >
              <span className="sidebar-icon" aria-hidden="true">{icon}</span>
              <span className="sidebar-label">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;