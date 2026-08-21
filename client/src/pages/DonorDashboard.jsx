import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DonationCard from "../components/DonationCard";
import { createDonation, fetchMyDonations, fetchDonationMatches } from "../api/donationApi";

const URGENCY_OPTIONS = ["<1hr", "1-3hrs", "3-6hrs", "6-24hrs", ">24hrs"];

const initialForm = {
  foodType: "",
  quantity: "",
  unit: "",
  lat: "",
  lng: "",
  pickupAddress: "",
  urgency: "1-3hrs",
  description: "",
};

export default function DonorDashboard() {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => {
    loadDonations();
    autoLocate();
  }, []);

  function autoLocate() {
    if (!navigator.geolocation) return;
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

  async function loadDonations() {
    setLoadingDonations(true);
    try {
      const res = await fetchMyDonations();
      setDonations(res.data.donations);
    } catch (err) {
      // non-fatal; list just stays empty
    } finally {
      setLoadingDonations(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (photo) data.append("photo", photo);

      await createDonation(data);
      setSuccess("Donation submitted successfully.");
      setForm((f) => ({ ...initialForm, lat: f.lat, lng: f.lng }));
      setPhoto(null);
      loadDonations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit donation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Log a food donation</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Food type</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Cooked rice"
                  value={form.foodType}
                  onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  required
                  placeholder="kg, plates, packets..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup location</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Latitude"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
                <input
                  required
                  placeholder="Longitude"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={autoLocate}
                className="text-sm text-emerald-700 hover:underline mt-2"
              >
                {locating ? "Locating..." : "Use my current location"}
              </button>
              <input
                placeholder="Pickup address (optional)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency window</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              >
                {URGENCY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional — parsed by AI)
              </label>
              <textarea
                placeholder="e.g. Leftover catering from a wedding, about 30 plates of rice and curry, still warm"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-md"
            >
              {submitting ? "Submitting..." : "Submit donation"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your donations</h2>
          {loadingDonations ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : donations.length === 0 ? (
            <p className="text-gray-500 text-sm">No donations logged yet.</p>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <DonationCard key={d._id} donation={d}>
                  {d.status !== "pending" && <MatchList donationId={d._id} />}
                </DonationCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchList({ donationId }) {
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!open && matches === null) {
      setLoading(true);
      try {
        const res = await fetchDonationMatches(donationId);
        setMatches(res.data.matches);
      } catch (err) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button onClick={toggle} className="text-sm text-emerald-700 hover:underline">
        {open ? "Hide matched NGOs" : "View matched NGOs"}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {loading && <p className="text-sm text-gray-500">Loading matches...</p>}
          {!loading && matches?.length === 0 && (
            <p className="text-sm text-gray-500">No NGO matches found nearby.</p>
          )}
          {!loading &&
            matches?.map((m) => (
              <div key={m._id} className="bg-gray-50 rounded-md p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    #{m.rank} {m.ngo?.organizationName}
                  </span>
                  <span className="text-emerald-700 font-semibold">{m.score}/100</span>
                </div>
                <p className="text-gray-600 mt-1">{m.reasoning}</p>
                <p className="text-gray-400 text-xs mt-1">{m.distanceKm} km away</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
