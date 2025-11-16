import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./routes/AdminProtectedRoute"; // admin only
import Login from "./pages/Login";
import Layout from './components/Layout';
import Dashboard from "./pages/Dashboard";
import RequestPayment from "./pages/RequestPayment";
import Profile from "./pages/Profile";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import AdminLogin from "./pages/admin/Login";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/login/admin" element={<AdminLogin />} /> {/* Admin */}

        {/* Shared routes untuk member & admin */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Member-only routes */}
            <Route path="/request" element={<RequestPayment />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<DashboardAdmin />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
