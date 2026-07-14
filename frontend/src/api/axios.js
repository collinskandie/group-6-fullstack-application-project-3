import axios from "axios";

// One place to change the storage key later if we want.
export const TOKEN_KEY = "gho_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT on every outgoing request (if we have one).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If the backend rejects our token, wipe it so we don't keep sending
// a dead credential. AuthContext will then bounce the user to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;