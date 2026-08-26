import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";

const roleHome = {
  donor: "/donor",
  ngo: "/ngo",
  admin: "/admin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <AuthBrandPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <img src="/FoodBridgeAILogo.png" alt="FoodBridge AI" className="h-11 w-auto mb-10 md:hidden" />

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Log in to keep surplus food moving.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="11" width="14" height="9" rx="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 11V7a4 4 0 1 1 8 0v4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 text-white font-display font-semibold text-sm py-2.5 rounded-lg shadow-sm shadow-brand-600/20 transition"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-700 font-semibold hover:text-brand-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
