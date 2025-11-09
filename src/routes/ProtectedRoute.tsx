import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <Outlet />;
}
