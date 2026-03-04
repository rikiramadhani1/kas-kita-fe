import { useEffect, useState, useRef } from "react";
import QRCard from "../components/QRCard";
import api from "../service/api";
import "./RequestPayment.css";
import { jwtDecode } from "jwt-decode";

type MonthlySummary = {
  month: number;
  year: number;
  total_in: number;
  total_out: number;
  saldo: number;
  members: {
    member_id: number;
    name: string;
    total_paid: number;
  }[];
};

export default function RequestPayment() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);

  const MIN_DATE = new Date(2026, 1); // Feb 2026
  const NOW = new Date();
  const [activeDate, setActiveDate] = useState<Date>(NOW);
  const [isAllTime, setIsAllTime] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | "">("");

  const token = localStorage.getItem("accessToken");

  const memberId = token
    ? (jwtDecode<any>(token).id ?? null)
    : null;

  const myData = monthlySummary?.members.find(
    (m) => m.member_id === memberId
  );

  const NO_REKENING = "082272206809";
  const [showToast, setShowToast] = useState(false);

  const handleCopyRek = async () => {
    await navigator.clipboard.writeText(NO_REKENING);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handlePrevMonth = () => {
    if (isAllTime) return;

    const newDate = new Date(activeDate);
    newDate.setMonth(newDate.getMonth() - 1);

    if (newDate < MIN_DATE) return;

    setSlideDirection("left");
    setActiveDate(newDate);
  };

  const handleNextMonth = () => {
    if (isAllTime) return;

    const newDate = new Date(activeDate);
    newDate.setMonth(newDate.getMonth() + 1);

    if (
      newDate.getFullYear() > NOW.getFullYear() ||
      (newDate.getFullYear() === NOW.getFullYear() &&
        newDate.getMonth() > NOW.getMonth())
    ) {
      return;
    }

    setSlideDirection("right");
    setActiveDate(newDate);
  };

  const handleAllTime = () => {
    setIsAllTime(true);
  };

  const handleBackToMonth = () => {
    setIsAllTime(false);
  };

  const isPrevDisabled = activeDate <= MIN_DATE || isAllTime;

  const isNextDisabled =
    activeDate.getFullYear() === NOW.getFullYear() &&
    activeDate.getMonth() === NOW.getMonth();

  const fetchMonthlySummary = async (
    month?: number,
    year?: number
  ) => {
    try {
      const res = await api.get("/cashflow/summary", {
        params:
          month && year
            ? { month, year }
            : {},
      });

      if (res.data.meta?.success) {
        setMonthlySummary(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch monthly summary", err);
    }
  };

  useEffect(() => {
    if (isAllTime) {
      fetchMonthlySummary();
    } else {
      fetchMonthlySummary(
        activeDate.getMonth() + 1,
        activeDate.getFullYear()
      );
    }
  }, [activeDate, isAllTime]);

   /** === Handle konfirmasi pembayaran === */
  const handleConfirm = async () => {
    if (!file) return alert("Silakan upload bukti pembayaran terlebih dahulu");
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image_upload", file);

      const res = await api.post("/payments/confirm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const meta = res.data?.meta;
      const data = res.data?.data;

      if (meta?.success) {
        setMessage(
          `${meta.message}. Rp${data.nominal?.toLocaleString()} dikirimnya.`
        );
        setMessageType("success");
      } else {
        setMessage(meta?.message || "Gagal mengirim konfirmasi");
        setMessageType("error");
      }
    } catch (err: any) {
      console.error("[PAYMENT CONFIRM ERROR]", err);
      const message =
        err.response?.data?.meta?.message ||
        err.message ||
        "Terjadi kesalahan saat mengirim konfirmasi";
      setMessage(message);
      setMessageType("error");
    } finally {
      // reset file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="request">
                {/* === SUMMARY KAS BULANAN === */}
{monthlySummary && (
  <>
    {/* CARD SALDO MEMBER */}
    <div className="saldo-card">
      <h4>
        {isAllTime
          ? "Total Kontribusi Awak"
          : "Kontribusi Awak Bulan Ini"}
      </h4>

      <div className="saldo-amount">
        Rp {(myData?.total_paid ?? 0).toLocaleString("id-ID")}
      </div>

      {!isAllTime && (
        <div className="saldo-meta">
          {activeDate.toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </div>
      )}
    </div>

    {/* LIST MEMBER */}
    <div className="member-list-card">

      {/* ===== FILTER BULAN (VERSI MEMBER CLEAN) ===== */}
      <div className="month-filter-member">
        <button
          className="arrow-btn-member"
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
        >
          ◀
        </button>

        <div
          className="month-display-member"
          onClick={!isAllTime ? handleAllTime : handleBackToMonth}
        >
          <div
            key={activeDate.toISOString() + isAllTime}
            className={`month-text-member slide-${slideDirection}`}
          >
            {isAllTime
              ? "All Time"
              : activeDate.toLocaleString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
          </div>
        </div>

        <button
          className="arrow-btn-member"
          onClick={handleNextMonth}
          disabled={isNextDisabled}
        >
          ▶
        </button>
      </div>

      <h4 style={{ marginTop: "18px" }}>
        Kontribusi Orang-orang Sukses
      </h4>

      {monthlySummary?.members?.map((m) => (
        <div key={m.member_id} className="member-row">
          <span>{m.name}</span>
          <span>
            Rp {m.total_paid.toLocaleString("id-ID")}
          </span>
        </div>
      ))}

      <div className="divider" />

      <div className="member-row total-row">
        <span>Total Kas Masuk</span>
        <span>
          Rp {monthlySummary?.total_in.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  </>
)}
        {/* === STEP 1: QRIS saja === */}
        <div className="step-card">
          <h4>Step 1: Transfer melalui Nomor Dana bendahara</h4>
          <p className="note">Iuran kas suka hati kelen lah 😎💸. Mau gopek, seribu, goceng, cepek, paten kali lah, pokoknya tetep caer aja! Biar rame kayak pajak.</p>
          <div className="qr-area">
              <QRCard qrUrl="/image_byr.png" />
              <button className="hint copy-rek" onClick={handleCopyRek}>
                  <span className="copy-icon" />
                  <span>Salin No. Rekening</span>
              </button>
          </div>
            {showToast}
        </div>

        {/* === STEP 2: Konfirmasi === */}
        <div className="step-card">
          <h4>Step 2: Konfirmasi Pembayaran</h4>
          <label>Cak Kelen taroklah screenshot transfer nya disini</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            className="report-btn"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Kirim Konfirmasi"}
          </button>

          {message && (
            <p
              className={`message ${
                messageType === "success" ? "success" : "error"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
