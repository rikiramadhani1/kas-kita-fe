import { useEffect, useState, useRef } from "react";
import QRCard from "../components/QRCard";
import api from "../service/api";
import "./RequestPayment.css";
import { jwtDecode } from "jwt-decode";

type Summary = {
  unpaid: number;
  pending: number;
  monthsDue: string[];
  overpayment: number;
};

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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);

const token = localStorage.getItem("accessToken");

const memberId = token
  ? (jwtDecode<any>(token).id ?? null)
  : null;

  console.log("aaaaaaaa", memberId)

  const myData = monthlySummary?.members.find(
  (m) => m.member_id === memberId
);
  const currentYear = new Date().getFullYear();

  const NO_REKENING = "901451286249";
  const [showToast, setShowToast] = useState(false);

  const handleCopyRek = async () => {
    await navigator.clipboard.writeText(NO_REKENING);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  /** === Fetch summary pembayaran === */
  const fetchSummary = async () => {
    try {
      console.log("[UI] Fetching summary...");
      const res = await api.get(`/payments/count`, {
        params: { member_id: memberId, year: currentYear },
      });

      console.log("[UI] Summary response:", res.data);

      if (res.data.meta?.success) {
        setSummary(res.data.data);
        setMessageType("success");
      } else {
        setMessage(res.data.meta?.message || "Gagal memuat data pembayaran");
        setMessageType("error");
      }
    } catch (err) {
      console.error("[UI] Failed to load summary", err);
      setMessage("Gagal memuat data pembayaran");
      setMessageType("error");
    }
  };

  const fetchMonthlySummary = async () => {
  try {
    const now = new Date();
    const res = await api.get("/cashflow/summary", {
      params: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    if (res.data.meta?.success) {
      setMonthlySummary(res.data.data);
    }
  } catch (err) {
    console.error("Failed to fetch monthly summary", err);
  }
};

  useEffect(() => {
    fetchSummary();
    fetchMonthlySummary();
  }, []);

  return (
    <div className="page-container">
      <div className="request">
                {/* === SUMMARY KAS BULANAN === */}
{monthlySummary && (
  <>
    {/* CARD SALDO MEMBER */}
    <div className="saldo-card">
      <h3>Kontribusi Kamu Bulan Ini</h3>
      <div className="saldo-amount">
        Rp {(myData?.total_paid ?? 0).toLocaleString("id-ID")}
      </div>
      <div className="saldo-meta">
        {monthlySummary.month}/{monthlySummary.year}
      </div>
    </div>

    {/* LIST MEMBER */}
    <div className="member-list-card">
      <h3>Kontribusi Member</h3>

      {monthlySummary.members.map((m) => (
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
          Rp {monthlySummary.total_in.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="member-row total-row">
        <span>Saldo</span>
        <span>
          Rp {monthlySummary.saldo.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  </>
)}
        {/* === STEP 1: QRIS saja === */}
        <div className="step-card">
          <h3>Step 1: Transfer melalui Nomor rekening bendahara</h3>
          <p className="note">Besar iuran: Rp 20.000/bulan</p>
          <div className="qr-area">
              <QRCard qrUrl="/image_byr.png" />
              <button className="hint copy-rek" onClick={handleCopyRek}>
                  <span className="copy-icon" />
                  <span>Salin No. Rekening</span>
              </button>
          </div>
            {showToast}
        </div>
      </div>
    </div>
  );
}
