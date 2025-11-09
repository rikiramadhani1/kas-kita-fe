import { useEffect, useState } from "react";
import QRCard from "../components/QRCard";
import api from "../service/api";
import "./RequestPayment.css";

type Summary = {
  unpaid: number;
  pending: number;
  monthsDue: string[];
};

export default function RequestPayment() {
  const [activeTab, setActiveTab] = useState<"qris" | "shopeepay">("qris");
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);

  const memberId = 15;
  const currentYear = new Date().getFullYear();

  /** === Fetch summary pembayaran === */
  const fetchSummary = async () => {
    try {
      console.log("[UI] Fetching summary...");
      const res = await api.get(`/payments/count`, {
        params: { member_id: memberId, year: currentYear },
      });

      console.log("[UI] Summary response:", res.data);

      if (res.data.meta?.success || res.data.message) {
        setSummary(res.data.data);
      } else {
        setMessage(res.data.meta?.message || "Gagal memuat data pembayaran");
      }
    } catch (err) {
      console.error("[UI] Failed to load summary", err);
      setMessage("Gagal memuat data pembayaran");
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  /** === Handle submit laporan (create payment) === */
  const handleReport = async () => {
    if (months <= 0) return alert("Jumlah bulan harus minimal 1");

    setLoading(true);
    setMessage("");
    try {
  const res = await api.post("/payments/request", { months });

  const meta = res.data?.meta;
  if (meta?.success) {
    setMessage("Laporan berhasil dikirim ✅");
    await fetchSummary();
  } else {
    setMessage(meta?.message || "Gagal mengirim laporan");
  }
} catch (err: any) {
  console.error("[PAYMENT REQUEST ERROR]", err);
  const message =
    err.response?.data?.meta?.message ||
    err.message ||
    "Terjadi kesalahan saat mengirim laporan";
  setMessage(message);
} finally {
  setLoading(false);
}

  };

  /** === Pesan dinamis === */
  const getStatusMessage = () => {
  if (!summary)
    return { text: "Memuat status iuran...", type: "loading" }; // ✅ bukan string lagi

  const { unpaid, pending, monthsDue } = summary;
  const bulanList =
    monthsDue?.length > 0 ? monthsDue.join(", ") : "beberapa bulan terakhir";

  if (unpaid === 0 && pending === 0)
    return { text: "Semua iuran sudah lunas 🎉", type: "success" };

  if (unpaid > 0 && pending > 0)
    return {
      text: `Masih ada ${unpaid} bulan belum dibayar (${bulanList}) dan ${pending} pembayaran masih menunggu persetujuan ⏳.`,
      type: "warning",
    };

  if (unpaid > 0)
    return {
      text: `Masih ada ${unpaid} bulan belum dibayar (${bulanList}). 💸`,
      type: "warning",
    };

  if (pending > 0)
    return {
      text: `Ada ${pending} pembayaran yang masih menunggu persetujuan ⏳.`,
      type: "info",
    };

  return { text: "Status iuran tidak diketahui 🤔", type: "neutral" };
};


  const status = getStatusMessage();

  return (
    <div className="request">
      <h2 className="friendly-title">Halo Dunsanak, Saatnya bayar iuran</h2>

      {/* === REKAP PEMBAYARAN === */}
      <div className="summary-card">
        <h3>Rekap Pembayaran Tahun {currentYear}</h3>

        {summary ? (
          <>
            <p className={`status-text ${status.type}`}>{status.text}</p>
          </>
        ) : (
          <p>Memuat data...</p>
        )}
      </div>

      {/* === STEP 1: PILIH PEMBAYARAN === */}
      <div className="step-card">
        <h3>Step 1: Pilih Metode Pembayaran</h3>
        <p className="note">Note: Besar iuran per bulan Rp 20.000/bulan</p>

        <div className="tab-header">
          <button
            className={activeTab === "qris" ? "active" : ""}
            onClick={() => setActiveTab("qris")}
          >
            QRIS
          </button>
          <button
            className={activeTab === "shopeepay" ? "active" : ""}
            onClick={() => setActiveTab("shopeepay")}
          >
            ShopeePay
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "qris" && (
            <div className="qr-area">
              <div className="qr-inner-card">
                <QRCard qrUrl="/qris.png" />
                <p className="hint">QRIS Statis Bendahara</p>
              </div>
            </div>
          )}

          {activeTab === "shopeepay" && (
            <div className="shopeepay-area">
              <p className="hint">
                Transfer ke ShopeePay Bendahara: <strong>081234567890</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* === STEP 2: LAPORAN === */}
      <div className="step-card">
        <h3>Step 2: Lakukan Laporan</h3>
        <label>Jumlah bulan yang dibayar</label>
        <input
          type="number"
          min={1}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
        />
        <button
          className="report-btn"
          onClick={handleReport}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim Laporan"}
        </button>

        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
}

