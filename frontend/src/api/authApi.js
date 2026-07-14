import api from "./axios";

/**
 * Register a new user.
 * POST /auth/register
 * Body:     { email, password }
 * Response: { token, user: { id, email, role } }
 */
export function register({ email, password }) {
  return api.post("/auth/register", { email, password });
}

/**
 * Log in an existing user.
 * POST /auth/login
 * Body:     { email, password }
 * Response: { token, user: { id, email, role } }
 */
export function login({ email, password }) {
  return api.post("/auth/login", { email, password });
}

/**
 * Log out.
 * POST /auth/logout  (optional for stateless JWT)
 * We mainly wipe the token client-side in AuthContext;
 * this call is a courtesy in case the backend keeps a blocklist.
 */
export function logout() {
  return api.post("/auth/logout");
}

/**
 * Get the currently logged-in user.
 * Used by AuthContext on page load to check if the stored token is still valid.
 * GET /auth/me
 * Response: { id, email, role }
 */
export function getMe() {
  return api.get("/auth/me");
}