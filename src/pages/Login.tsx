import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function LoginMember() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [shake, setShake] = useState(false);

  const phoneRef = useRef<HTMLInputElement>(null);

  const isFormValid = phone.trim() !== "" && pin.trim() !== "";

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  // Autofocus
  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  // Banner auto show
  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isOperationalHour = hour >= 9 && hour < 17;

    setShowBanner(!(isWeekday && isOperationalHour));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      await login(phone, pin, false);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login gagal.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page fade-route">

      {/* Floating Shapes */}
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>

      {showBanner && (
        <div className="server-banner">
          <div className="marquee">
            Layanan saat ini tidak tersedia.
            Jam operasional: Senin–Jumat | 09.00–17.00 WIB.
          </div>
        </div>
      )}

      <div className={`login-card fade-in ${shake ? "shake" : ""}`}>
        <div className="login-header">
          <h2>Member Login</h2>
          <p>Masukkan nomor HP & PIN Anda</p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            ref={phoneRef}
            type="tel"
            placeholder="08xxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="pin-wrapper">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="•   •   •   •   •   •"
              value={pin}
              onChange={(e) => {
                const onlyNumber = e.target.value.replace(/\D/g, "");
                setPin(onlyNumber);
              }}
              autoComplete="one-time-code"
            />
        </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={isFormValid ? "active" : ""}
          >
            {loading ? <div className="spinner"></div> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}