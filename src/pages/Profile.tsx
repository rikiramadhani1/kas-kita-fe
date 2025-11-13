import { useEffect, useState } from "react";
import "./Profile.css";
import api from "../service/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type UserProfile = {
  name: string;
  phone_number: string;
  house_number: string;
  role: "member";
};

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false); // 🔹 toggle PIN
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  /** === Fetch profil user === */
  const fetchProfile = async () => {
    try {
      const res = await api.get("/members/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.meta?.success || res.data.data) {
        setUser(res.data.data || res.data);
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

  /** === Handle update PIN === */
  const handleResetPin = async () => {
    if (pin.length !== 6) return setMessage("PIN harus 6 digit!");

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
        setMessageType("error");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.meta?.message || err.message || "Terjadi kesalahan saat memperbarui PIN";
      setMessage(message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const roleEmoji: Record<string, string> = {
    member: "🧑‍💻",
    admin: "👑",
  };

  return (
<div className="page-container">
    <div className="profile">
      <h2 className="friendly-title">Profil Anggota</h2>

      {/* === DATA PROFIL === */}
      <div className="summary-card">
        {user ? (
          <div className="avatar-container">
            <div className="avatar">
              <span className="emoji">{roleEmoji["member"]}</span>
            </div>
            <p className="username">{user.name}</p>
            <p className="email">📱{user.phone_number}</p>
            <p className="email">🏠{user.house_number}</p>
          </div>
        ) : (
          <p>Memuat data profil...</p>
        )}
      </div>

      {/* === FORM GANTI PIN === */}
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
          <span className="eye-icon" onClick={() => setShowPin(prev => !prev)}>
            {showPin ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          className="reset-btn"
          onClick={handleResetPin}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Simpan PIN"}
        </button>

        {message && (
          <p className={`message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
    </div>
  );
}
