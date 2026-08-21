import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { fetchImpactStats } from "../api/ngoApi";

export default function ImpactDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImpactStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load impact stats"));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">Impact dashboard</h1>
        <p className="text-sm text-gray-500">
          Includes seeded historical demo data alongside real activity, for demo purposes.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!stats ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total donations" value={stats.totalDonations} />
              <StatCard label="Active donors" value={stats.activeDonors} />
              <StatCard label="Active NGOs" value={stats.activeNGOs} />
              <StatCard label="Delivered" value={stats.delivered} />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Donations over time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
