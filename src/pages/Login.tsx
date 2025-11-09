import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = phone.trim() !== "" && pin.trim() !== "";

  // 🔹 Redirect otomatis jika sudah login
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 🔹 Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; // Jangan submit kalau belum lengkap

    setLoading(true);
    setError("");

    try {
      await login(phone, pin);
      navigate("/", { replace: true });
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

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={isFormValid ? "active" : ""}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
