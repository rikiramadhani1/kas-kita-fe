import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth(); // ✅ ambil login dari context
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Redirect otomatis jika sudah login
  useEffect(() => {
    if (isLoggedIn) {
      console.log("[Login] Sudah login, redirect ke /");
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 🔹 Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(phone, pin); // ✅ pakai context login
      navigate("/", { replace: true }); // ✅ redirect setelah sukses
    } catch (err: any) {
      console.error("Login gagal:", err);
      setError(err.message || "Login gagal, cek nomor dan PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Member Login</h2>
        <p>Masukkan nomor HP & PIN Anda</p>

        <form onSubmit={handleLogin}>
          <input
            type="tel"
            placeholder="628xxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}


