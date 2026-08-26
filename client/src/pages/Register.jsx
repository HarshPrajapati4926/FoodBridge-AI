import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";

const roleHome = {
  donor: "/donor",
  ngo: "/ngo",
  admin: "/admin",
};

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    organizationName: "",
    address: "",
    lat: "",
    lng: "",
    capacity: "",
    needs: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "ngo") {
        payload.ngoDetails = {
          organizationName: form.organizationName,
          address: form.address,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          capacity: form.capacity,
          needs: form.needs,
        };
      }
      const user = await register(payload);
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <AuthBrandPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <img src="/FoodBridgeAILogo.png" alt="FoodBridge AI" className="h-11 w-auto mb-8 md:hidden" />

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-gray-500 text-sm mb-7">Join as a donor or an NGO partner.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                required
                autoFocus
                placeholder="Your name"
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I'm registering as</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "donor", label: "Donor", hint: "I have surplus food to give" },
                  { value: "ngo", label: "NGO", hint: "We receive & distribute food" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`text-left rounded-lg border px-3.5 py-2.5 transition ${
                      form.role === opt.value
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.role === "ngo" && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700">NGO details</p>
                <input
                  placeholder="Organization name"
                  required
                  className={inputClass}
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                />
                <input
                  placeholder="Address"
                  className={inputClass}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Latitude"
                    required
                    className={inputClass}
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  />
                  <input
                    placeholder="Longitude"
                    required
                    className={inputClass}
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="text-sm text-brand-700 font-medium hover:text-brand-800 hover:underline"
                >
                  {locating ? "Locating..." : "Use my current location"}
                </button>
                <input
                  placeholder="Capacity (e.g. 100 meals/day)"
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
                <textarea
                  placeholder="Stated needs (used by AI matching)"
                  className={inputClass}
                  value={form.needs}
                  onChange={(e) => setForm({ ...form, needs: e.target.value })}
                />
              </div>
            )}

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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-7 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-700 font-semibold hover:text-brand-800">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
