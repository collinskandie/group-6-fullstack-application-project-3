import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi";
import { TOKEN_KEY } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `loading` starts true so consumers don't briefly render "logged out"
  // UI while we're still checking whether a stored token is valid.
  const [loading, setLoading] = useState(true);

  // On mount, if there's a token in localStorage, ask the backend
  // "who am I?" — the axios interceptor attaches the token automatically.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        // 401s are already handled by the response interceptor in axios.js
        // (it wipes the bad token), so we just fall through to logged-out.
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  }

  async function register(email, password) {
    const res = await authApi.register({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  }

  async function logout() {
    // Best-effort backend call; the local wipe is what actually logs out.
    try {
      await authApi.logout();
    } catch {
      // Backend might be down or the endpoint might not exist yet — ignore.
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook so components don't have to import useContext + AuthContext separately.
// Throws if used outside the provider — surfaces wiring bugs immediately.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}