import { useEffect, useState } from "react";
import "./Profile.css";
import api from "../service/api";

type UserProfile = {
  name: string;
  phone_number: string;
  house_number: string;
  // role: "member" | "admin";
  role: "member";

};

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  /** === Fetch profil user === */
  const fetchProfile = async () => {
    try {
      console.log("[UI] Fetching profile...");
      const res = await api.get("/members/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[UI] Profile response:", res.data);

      if (res.data.meta?.success || res.data.data) {
        setUser(res.data.data || res.data);
      } else {
        setMessage(res.data.meta?.message || "Gagal memuat profil ❌");
      }
    } catch (err) {
      console.error("[UI] Failed to load profile:", err);
      setMessage("Gagal memuat profil ❌");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /** === Handle update PIN === */
  const handleResetPin = async () => {
    if (pin.length < 4) return setMessage("PIN minimal 4 digit!");

    setLoading(true);
    setMessage("");
    try {
      const res = await api.post(
        "/auth/pin",
        { pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("[UI] PIN response:", res.data);

      if (res.data.meta?.success) {
        setMessage("PIN berhasil diperbarui 🔒");
        setPin("");
      } else {
        setMessage(res.data.meta?.message || "Gagal memperbarui PIN");
      }
    } catch (err: any) {
      console.error("[UI] Failed to update PIN:", err);
      const message =
      err.response?.data?.meta?.message ||
      err.message ||
      "Terjadi kesalahan saat memperbarui PIN";
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const roleEmoji: Record<string, string> = {
    member: "🧑‍💻",
    admin: "👑",
  };

  return (
    <div className="profile">
      <h2 className="friendly-title">Profil Anggota</h2>

      {/* === DATA PROFIL === */}
      <div className="summary-card">
        {user ? (
          <>
            <div className="avatar-container">
              <div className="avatar">
                <span className="emoji">{roleEmoji["member"]}</span>
              </div>
              <p className="username">{user.name}</p>
              <p className="email">📱{user.phone_number}</p>
              <p className="email">🏠{user.house_number}</p>
            </div>
          </>
        ) : (
          <p>Memuat data profil...</p>
        )}
      </div>

      {/* === FORM GANTI PIN === */}
     <div className="reset-section">
  <h2>Reset PIN</h2>

  <input
    type="password"
    placeholder="Masukkan PIN baru (min. 4 digit)"
    value={pin}
    onChange={(e) => setPin(e.target.value)}
    className="pin-input"
    disabled={loading}
  />

  <button
    className="reset-btn"
    onClick={handleResetPin}
    disabled={loading}
  >
    {loading ? "Memproses..." : "Simpan PIN"}
  </button>

  {message && <p className="message">{message}</p>}
</div>

    </div>
  );
}


