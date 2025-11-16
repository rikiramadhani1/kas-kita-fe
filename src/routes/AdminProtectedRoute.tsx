import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute() {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!isLoggedIn) return <Navigate to="/login/admin" replace />;  // Redirect ke login admin jika belum login
  if (user?.role !== "admin") return <Navigate to="/" replace />; // Redirect member ke dashboard biasa

  return <Outlet />;
}
