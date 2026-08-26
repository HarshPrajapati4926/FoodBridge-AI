import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TITLES = {
  "/donor": "Donor Dashboard",
  "/ngo": "NGO Dashboard",
  "/admin": "Admin Dashboard",
  "/map": "Map View",
  "/impact": "Impact Dashboard",
  "/support": "Support",
};

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TopBar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  const title = TITLES[pathname] || "FoodBridge AI";

  return (
    <header className="hidden md:flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
      <h1 className="font-display font-semibold text-lg text-gray-800">{title}</h1>
      <div className="flex items-center gap-2.5 text-sm text-gray-600">
        <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-semibold">
          {initials(user.name)}
        </div>
        <span>
          {user.name} <span className="text-gray-400 capitalize">· {user.role}</span>
        </span>
      </div>
    </header>
  );
}
