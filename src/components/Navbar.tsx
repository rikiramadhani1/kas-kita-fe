// import { NavLink } from "react-router-dom";
// import "./Navbar.css";

// export default function Navbar() {
//   return (
//     <nav className="navbar">
//       <NavLink
//         to="/"
//         className={({ isActive }) => (isActive ? "active" : undefined)}
//       >
//         Dashboard
//       </NavLink>
//       <NavLink
//         to="/request"
//         className={({ isActive }) => (isActive ? "active" : undefined)}
//       >
//         Bayar Iuran
//       </NavLink>
//       <NavLink
//         to="/profile"
//         className={({ isActive }) => (isActive ? "active" : undefined)}
//       >
//         Profile
//       </NavLink>
//     </nav>
//   );
// }








import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // hapus token
    navigate("/login", { replace: true }); // redirect ke login
  };

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

      {/* Logout icon */}
      <button className="logout-icon" onClick={handleLogout}>
        <FaSignOutAlt size={18} />
      </button>
    </nav>
  );
}



// import { NavLink, useNavigate } from "react-router-dom";
// import { FaSignOutAlt } from "react-icons/fa";
// import "./Navbar.css";

// export default function Navbar() {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // 🧹 Hapus semua data autentikasi
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("role");

//     // 🔁 Arahkan ke halaman login
//     navigate("/login", { replace: true });
//   };

//   return (
//     <nav className="navbar">
//       <div className="nav-links">
//         <NavLink
//           to="/"
//           className={({ isActive }) => (isActive ? "active" : undefined)}
//         >
//           Dashboard
//         </NavLink>
//         <NavLink
//           to="/request"
//           className={({ isActive }) => (isActive ? "active" : undefined)}
//         >
//           Bayar Iuran
//         </NavLink>
//         <NavLink
//           to="/profile"
//           className={({ isActive }) => (isActive ? "active" : undefined)}
//         >
//           Profile
//         </NavLink>
//       </div>

//       {/* 🔹 Tombol Logout */}
//       <button className="logout-btn" onClick={handleLogout}>
//         <FaSignOutAlt /> Logout
//       </button>
//     </nav>
//   );
// }
















// import { NavLink, useNavigate } from "react-router-dom";
// import { FaSignOutAlt } from "react-icons/fa";
// import "./Navbar.css";

// export default function Navbar() {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     console.log("🧹 [DEBUG] Logout button clicked");

//     try {
//       // Hapus token dari localStorage
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("role");
//       console.log("✅ [DEBUG] Tokens removed from localStorage");

//       // Cek lagi apakah token masih ada
//       console.log("📦 [DEBUG] Remaining tokens:", {
//         access: localStorage.getItem("accessToken"),
//         refresh: localStorage.getItem("refreshToken"),
//       });

//       // Coba arahkan ke halaman login
//       navigate("/login", { replace: true });
//       console.log("➡️ [DEBUG] navigate('/login') dipanggil");

//       // Tambahkan fallback kalau navigate gak jalan
//       setTimeout(() => {
//         console.log("🔁 [DEBUG] Fallback redirect pakai window.location");
//         window.location.href = "/login";
//       }, 300);
//     } catch (err) {
//       console.error("❌ [DEBUG] Error saat logout:", err);
//     }
//   };

//   return (
//     <nav className="navbar">
//       <div className="nav-links">
//         <NavLink
//           to="/"
//           className={({ isActive }) => (isActive ? "active" : undefined)}
//         >
//           Dashboard
//         </NavLink>
//         <NavLink
//           to="/request"
//           className={({ isActive }) => (isActive ? "active" : undefined)}
//         >
//           Bayar Iuran
//         </NavLink>
//         <NavLink
//           to="/profile"
//           className={({ isActive }) => (isActive ? "active" : undefined)}
//         >
//           Profile
//         </NavLink>
//       </div>

//       <button className="logout-btn" onClick={handleLogout}>
//         <FaSignOutAlt /> Logout
//       </button>
//     </nav>
//   );
// }


