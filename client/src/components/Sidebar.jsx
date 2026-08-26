import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  donor: "/donor",
  ngo: "/ngo",
  admin: "/admin",
};

const ICONS = {
  dashboard: (
    <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  map: (
    <path d="M9 20 4 18V6l5 2m0 12 6-2m-6 2V8m6 10 5 2V8l-5-2m0 14V6m0 0-6 2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  impact: (
    <path d="M4 20V10m6 10V4m6 16v-7m6 7V13" strokeLinecap="round" strokeLinejoin="round" />
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m6.5 6.5 2.8 2.8m6.4 6.4 2.8 2.8m0-12-2.8 2.8m-6.4 6.4-2.8 2.8" strokeLinecap="round" />
    </>
  ),
};

function NavIcon({ name }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {ICONS[name]}
    </svg>
  );
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) return null;

  const navItems = [
    { to: roleHome[user.role] || "/", label: "Dashboard", icon: "dashboard" },
    { to: "/map", label: "Map", icon: "map" },
    { to: "/impact", label: "Impact", icon: "impact" },
    { to: "/support", label: "Support", icon: "support" },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? "bg-brand-50 text-brand-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-5">
        <img src="/FoodBridgeAILogo.png" alt="FoodBridge AI" className="h-12 w-auto" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileOpen(false)} end>
            <NavIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 px-1 mb-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition text-left flex items-center gap-2"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 17.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1.5M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <img src="/FoodBridgeAILogo.png" alt="FoodBridge AI" className="h-9 w-auto" />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-gray-600"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">{SidebarContent}</div>
        </div>
      )}

      {/* Desktop sidebar - pinned to the viewport so it never scrolls with page content */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto border-r border-gray-100 bg-white">
        {SidebarContent}
      </aside>
    </>
  );
}
