import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // import icon dari react-icons
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false); // 🔹 state untuk toggle PIN

  const isFormValid = phone.trim() !== "" && pin.trim() !== "";

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

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

          <div className="pin-wrapper">
            <input
              type={showPin ? "text" : "password"} // 🔹 toggle type
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPin((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              {showPin ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

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
