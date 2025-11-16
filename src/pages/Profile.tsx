import { useEffect, useState } from "react";
import "./Profile.css";
import api from "../service/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type UserProfile = {
  name: string;
  phone_number?: string;
  house_number?: string;
  email?: string;
  role?: "admin" | "member";
  created_at?: string;
};

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  /** === Fetch profil === */
  const fetchProfile = async () => {
    try {
      const res = await api.get("/members/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.meta?.success && res.data.data) {
        const profileData = res.data.data;

        const finalProfile: UserProfile = {
          ...profileData,
          role: profileData.role || "member", // fallback jika member
        };

        setUser(finalProfile);
      } else {
        setMessage(res.data.meta?.message || "Gagal memuat profil ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Gagal memuat profil ❌");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /** === Reset PIN (member only) === */
  const handleResetPin = async () => {
    if (pin.length !== 6) {
      return setMessage("PIN harus 6 digit!");
    }

    setLoading(true);
    setMessage("");
    setMessageType("error");

    try {
      const res = await api.post(
        "/auth/pin",
        { pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.meta?.success) {
        setMessage("PIN berhasil diperbarui 🔒");
        setMessageType("success");
        setPin("");
      } else {
        setMessage(res.data.meta?.message || "Gagal memperbarui PIN");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.meta?.message ||
        err.message ||
        "Terjadi kesalahan saat memperbarui PIN";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  /** Default role jika tidak dikirim → member */
  const resolvedRole = user?.role || "member";

  const roleEmoji = {
    admin: "👑",
    member: "🧑‍💻",
  };

  return (
    <div className="page-container">
      <div className="profile">
        <h2 className="friendly-title">
          Profil {resolvedRole === "admin" ? "Admin" : "Anggota"}
        </h2>

        {/* === CARD PROFIL === */}
        <div className="summary-card">
          {user ? (
            <div className="avatar-container">
              <div className="avatar">
                <span className="emoji">{roleEmoji[resolvedRole]}</span>
              </div>

              <p className="username">{user.name}</p>

              {/* member pakai phone, admin pakai email */}
              {resolvedRole === "admin" ? (
                <p className="email">📧 {user.email}</p>
              ) : (
                <>
                  <p className="email">📱 {user.phone_number}</p>
                  <p className="email">🏠 {user.house_number}</p>
                </>
              )}

              {/* ADMIN → tampilkan role */}
              {resolvedRole === "admin" && <p className="role-label">👑 Admin</p>}
            </div>
          ) : (
            <p>Memuat data profil...</p>
          )}
        </div>

        {/* === FORM RESET PIN (member only) === */}
        {resolvedRole === "member" && (
          <div className="reset-section">
            <h2>Reset PIN</h2>

            <div className="pin-wrapper">
              <input
                type={showPin ? "text" : "password"}
                placeholder="Masukkan PIN baru (6 Digit)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pin-input"
                disabled={loading}
              />
              <span className="eye-icon" onClick={() => setShowPin((prev) => !prev)}>
                {showPin ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="reset-btn" onClick={handleResetPin} disabled={loading}>
              {loading ? "Memproses..." : "Simpan PIN"}
            </button>

            {message && (
              <p className={`message ${messageType === "success" ? "success" : "error"}`}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
