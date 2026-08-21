import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  donor: "/donor",
  ngo: "/ngo",
  admin: "/admin",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to={user ? roleHome[user.role] : "/"} className="text-lg font-semibold text-emerald-700">
        FoodBridge AI
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <Link to="/map" className="text-gray-600 hover:text-emerald-700">Map</Link>
            <Link to="/impact" className="text-gray-600 hover:text-emerald-700">Impact</Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-700">{user.name} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
