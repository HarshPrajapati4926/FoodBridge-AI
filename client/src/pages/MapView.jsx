import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { fetchDonationsForMap, fetchAllNGOsForMap } from "../api/ngoApi";

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const donorIcon = makeIcon("#f97316");
const ngoIcon = makeIcon("#059669");

const DEFAULT_CENTER = [19.076, 72.8777];

export default function MapView() {
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [donationsRes, ngosRes] = await Promise.all([
          fetchDonationsForMap(),
          fetchAllNGOsForMap(),
        ]);
        setDonations(donationsRes.data.donations);
        setNgos(ngosRes.data.ngos);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load map data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-gray-800 md:hidden">Map view</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span> Donors
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-brand-600"></span> NGOs
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading map...</p>
      ) : (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[420px] sm:h-[520px] md:h-[600px]">
          <MapContainer center={DEFAULT_CENTER} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {donations.map((d) => (
              <Marker key={d._id} position={[d.location.lat, d.location.lng]} icon={donorIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{d.foodType}</p>
                    <p>
                      {d.quantity} {d.unit} &middot; urgency: {d.urgency}
                    </p>
                    <p>status: {d.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {ngos.map((n) => (
              <Marker key={n._id} position={[n.location.lat, n.location.lng]} icon={ngoIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium">{n.organizationName}</p>
                    {n.address && <p>{n.address}</p>}
                    {n.capacity && <p>Capacity: {n.capacity}</p>}
                    {n.needs && <p>Needs: {n.needs}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
