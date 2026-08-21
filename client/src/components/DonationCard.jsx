import { SERVER_ORIGIN } from "../api/axiosInstance";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  matched: "bg-blue-100 text-blue-800",
  accepted: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function DonationCard({ donation, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-medium text-gray-800">{donation.foodType}</h3>
          <p className="text-sm text-gray-500">
            {donation.quantity} {donation.unit} · urgency: {donation.urgency}
          </p>
          {donation.description && (
            <p className="text-sm text-gray-600 mt-1">{donation.description}</p>
          )}
          {donation.aiParsed?.food_type && (
            <p className="text-xs text-emerald-700 mt-1">
              AI parsed: {donation.aiParsed.food_type} · {donation.aiParsed.estimated_quantity} · perishability: {donation.aiParsed.perishability}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
            statusColors[donation.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {donation.status}
        </span>
      </div>
      {donation.photoUrl && (
        <img
          src={`${SERVER_ORIGIN}${donation.photoUrl}`}
          alt="donation"
          className="mt-3 rounded-md max-h-40 object-cover"
        />
      )}
      {children}
    </div>
  );
}
