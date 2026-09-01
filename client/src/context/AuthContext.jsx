import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, fetchMe } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only worth showing a loading state if there's a token to validate -
  // otherwise there's nothing to wait for.
  const [loading, setLoading] = useState(() => !!localStorage.getItem("fb_token"));

  useEffect(() => {
    const token = localStorage.getItem("fb_token");
    if (!token) return;
    fetchMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("fb_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await loginUser({ email, password });
    localStorage.setItem("fb_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    const res = await registerUser(payload);
    localStorage.setItem("fb_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("fb_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
