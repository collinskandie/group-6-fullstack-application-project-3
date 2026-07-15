import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Compare from './pages/Compare';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import WatchlistSidebar from "./components/WatchlistSidebar";

export default function App() {
  const location = useLocation();
  // Login/register are unauthenticated — no user context yet, so there's
  // nothing for the sidebar (nav, avatar, admin link) to reflect.
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  // Redundant with (and visually collides with) the full favorites manager
  // on /favorites, and doesn't belong on the admin surface — only float it
  // over the general-exploration pages.
  const showWatchlist = !location.pathname.startsWith('/favorites') && !location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Open exploration */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/compare" element={<Compare />} />

        {/* Auth (public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User-owned data — requires login */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin — same unified auth, gated by role */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {showWatchlist && <WatchlistSidebar />}
    </div>
  );
}
