import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Route-level code splitting: each page (and its dependencies - Leaflet on
// MapView, Recharts on ImpactDashboard) loads only when its route is visited,
// instead of all being bundled into one large initial chunk.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DonorDashboard = lazy(() => import("./pages/DonorDashboard"));
const NGODashboard = lazy(() => import("./pages/NGODashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MapView = lazy(() => import("./pages/MapView"));
const ImpactDashboard = lazy(() => import("./pages/ImpactDashboard"));
const Support = lazy(() => import("./pages/Support"));

const roleHome = {
  donor: "/donor",
  ngo: "/ngo",
  admin: "/admin",
};

function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to={roleHome[user.role]} replace />;
  return <Navigate to="/login" replace />;
}

function RouteFallback() {
  return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo"
          element={
            <ProtectedRoute allowedRoles={["ngo"]}>
              <NGODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <ImpactDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
