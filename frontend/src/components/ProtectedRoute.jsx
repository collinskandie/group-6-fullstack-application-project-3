import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any route that requires a logged-in user.
 *
 * Usage (in App.jsx):
 *   <Route path="/favorites" element={
 *     <ProtectedRoute><Favorites /></ProtectedRoute>
 *   } />
 *
 * Optional role guard for future use:
 *   <ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>
 *
 * NOTE: This is UX, not security. The backend enforces real access
 * control. If someone bypasses this guard, Shawn's endpoints will 401.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // While AuthContext is checking a stored token against /auth/me,
  // render nothing rather than flashing a redirect to /login. Otherwise
  // a logged-in user briefly sees "you need to log in" on every refresh.
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    // Remember where they were going so Login.jsx can send them back.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role — bounce them home rather than to /login,
    // because logging out and back in wouldn't fix the problem.
    return <Navigate to="/" replace />;
  }

  return children;
}