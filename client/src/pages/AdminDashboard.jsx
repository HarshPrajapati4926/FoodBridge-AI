import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { fetchImpactStats } from "../api/ngoApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImpactStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load stats"));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform-wide overview.</p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total donations" value={stats.totalDonations} />
            <StatCard label="Active donors" value={stats.activeDonors} />
            <StatCard label="Active NGOs" value={stats.activeNGOs} />
            <StatCard label="Delivered" value={stats.delivered} />
          </div>
        )}
      </div>
    </div>
  );
}
