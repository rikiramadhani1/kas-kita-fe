import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
  logout();
  if (user?.role === "admin") {
    navigate("/login/admin", { replace: true });
  } else {
    navigate("/login", { replace: true });
  }
};

  return (
    <nav className="navbar">
      {/* Dashboard shared */}
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        Dashboard
      </NavLink>

      {/* Member-only */}
      {user?.role === "member" && (
        <NavLink
          to="/request"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Bayar Iuran
        </NavLink>
      )}

      {/* Admin-only */}
      {user?.role === "admin" && (
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard Admin
        </NavLink>
      )}

      {/* Profile shared */}
      <NavLink
        to="/profile"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Profile
      </NavLink>

      {/* Logout button */}
      <button className="logout-icon" onClick={handleLogout}>
        <FaSignOutAlt size={18} />
      </button>
    </nav>
  );
}
