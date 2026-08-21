import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MapView from "./pages/MapView";
import ImpactDashboard from "./pages/ImpactDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

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

export default function App() {
  return (
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
    </Routes>
  );
}
