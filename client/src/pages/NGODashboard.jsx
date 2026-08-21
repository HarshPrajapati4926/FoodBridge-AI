import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DonationCard from "../components/DonationCard";
import {
  fetchNgoMatches,
  acceptMatch,
  rejectMatch,
  fetchNgoDonations,
  advanceDonationStatus,
} from "../api/ngoApi";

const NEXT_ACTION_LABEL = {
  accepted: "Mark picked up",
  picked_up: "Mark delivered",
};

export default function NGODashboard() {
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadMatches();
    loadDonations();
  }, []);

  async function loadMatches() {
    setLoadingMatches(true);
    try {
      const res = await fetchNgoMatches();
      setMatches(res.data.matches);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to load matches");
    } finally {
      setLoadingMatches(false);
    }
  }

  async function loadDonations() {
    setLoadingDonations(true);
    try {
      const res = await fetchNgoDonations();
      setDonations(res.data.donations);
    } catch (err) {
      // non-fatal
    } finally {
      setLoadingDonations(false);
    }
  }

  async function handleAccept(matchId) {
    setBusyId(matchId);
    setActionError("");
    try {
      await acceptMatch(matchId);
      await Promise.all([loadMatches(), loadDonations()]);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept match");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(matchId) {
    setBusyId(matchId);
    setActionError("");
    try {
      await rejectMatch(matchId);
      await loadMatches();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject match");
    } finally {
      setBusyId(null);
    }
  }

  async function handleAdvance(donationId) {
    setBusyId(donationId);
    setActionError("");
    try {
      await advanceDonationStatus(donationId);
      await loadDonations();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {actionError && <p className="text-sm text-red-600">{actionError}</p>}

        <div>
          <h1 className="text-lg font-semibold text-gray-800 mb-3">Incoming matched donations</h1>
          {loadingMatches ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : matches.length === 0 ? (
            <p className="text-gray-500 text-sm">No matched donations right now.</p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <DonationCard key={m._id} donation={m.donation}>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="bg-emerald-50 rounded-md p-3 text-sm mb-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-emerald-800">AI match score</span>
                        <span className="text-emerald-700 font-semibold">{m.score}/100</span>
                      </div>
                      <p className="text-emerald-700 mt-1">{m.reasoning}</p>
                      <p className="text-gray-500 text-xs mt-1">{m.distanceKm} km away</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === m._id}
                        onClick={() => handleAccept(m._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-md"
                      >
                        Accept
                      </button>
                      <button
                        disabled={busyId === m._id}
                        onClick={() => handleReject(m._id)}
                        className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-md"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </DonationCard>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your accepted donations</h2>
          {loadingDonations ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : donations.length === 0 ? (
            <p className="text-gray-500 text-sm">No accepted donations yet.</p>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <DonationCard key={d._id} donation={d}>
                  {NEXT_ACTION_LABEL[d.status] && (
                    <button
                      disabled={busyId === d._id}
                      onClick={() => handleAdvance(d._id)}
                      className="mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-md"
                    >
                      {NEXT_ACTION_LABEL[d.status]}
                    </button>
                  )}
                </DonationCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
