import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? "active" : undefined)}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/request"
        className={({ isActive }) => (isActive ? "active" : undefined)}
      >
        Bayar Iuran
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => (isActive ? "active" : undefined)}
      >
        Profile
      </NavLink>
    </nav>
  );
}
