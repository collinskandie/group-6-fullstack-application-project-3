import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import RequireAdmin from './components/RequireAdmin';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Compare from './pages/Compare';
import Favorites from './pages/Favorites';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import WatchlistSidebar from "./components/WatchlistSidebar";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
      </Routes>
    </div>
  );
}
