import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Trends from "./pages/Trends";
import Compare from "./pages/Compare";

const VIEWS = {
  dashboard: <Dashboard />,
  trends: <Trends />,
  compare: <Compare />,
};

function App() {
  const [view, setView] = useState("dashboard");

  return (
    <div className="app-shell">
      <Navbar view={view} onNavigate={setView} />
      <main className="main-content">{VIEWS[view]}</main>
    </div>
  );
}

export default App;