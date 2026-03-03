import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Login.css";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { isLoggedIn, login, user } = useAuth();

  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  /* =========================
     AUTO FOCUS EMAIL
  ========================= */
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  /* =========================
     REDIRECT LOGIC (NO DOUBLE NAV)
  ========================= */
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  /* =========================
     LOGIN HANDLER
  ========================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError("");

    try {
      await login(email, password, true);
      // Redirect handled by useEffect
    } catch (err: any) {
      setError(err?.message || "Login admin gagal.");
      setShake(true);

      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page fade-route">
      <div className={`login-card ${shake ? "shake" : ""}`}>
        
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>Masukkan email & password admin</p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="pin-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {error && (
            <p style={{ color: "red", fontSize: "0.85rem" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={isFormValid ? "active" : ""}
          >
            {loading ? <div className="spinner"></div> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}