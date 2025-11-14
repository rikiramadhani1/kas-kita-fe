import { useEffect, useState, useRef } from "react";
import QRCard from "../components/QRCard";
import api from "../service/api";
import "./RequestPayment.css";

type Summary = {
  unpaid: number;
  pending: number;
  monthsDue: string[];
  overpayment: number;
};

export default function RequestPayment() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    fetchSummary();
  }, []);

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
          `${meta.message}. Nominal Rp${data.nominal?.toLocaleString()} untuk ${data.months} bulan.`
        );
        setMessageType("success");
        await fetchSummary();
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

  /** === Pesan dinamis === */
  const getStatusMessage = () => {
    if (!summary) return { text: "Memuat status iuran...", type: "loading" };

    const { unpaid, pending, monthsDue, overpayment } = summary;

    let lastPaidMonthMessage = "";
    if (overpayment > 0) {
      const now = new Date();
      const lastPaidMonth = new Date(
        now.getFullYear(),
        now.getMonth() + overpayment,
        1
      );
      const monthName = lastPaidMonth.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      });
      lastPaidMonthMessage = `Iuran sudah lunas sampai bulan ${monthName} 🎉`;
    }

    const bulanList =
      monthsDue?.length > 0 ? monthsDue.join(", ") : "beberapa bulan terakhir";

    if (unpaid === 0 && pending === 0 && overpayment === 0)
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
        text: `Ada ${pending} pembayaran yang masih menunggu persetujuan ⏳`,
        type: "info",
      };

    if (overpayment > 0)
      return { text: lastPaidMonthMessage, type: "success" };

    return { text: "Status iuran tidak diketahui 🤔", type: "neutral" };
  };

  const status = getStatusMessage();

  return (
    <div className="page-container">
      <div className="request">
        {/* === PESAN RAMAH DINAMIS === */}
        {summary && summary.unpaid > 0 && (
          <h2 className="friendly-title">
            Ke pasar membeli ketupat,
            <br />
            Bayar iuran jangan sampai telat! 😄
          </h2>
        )}

        {/* === REKAP PEMBAYARAN === */}
        <div className="summary-card">
          <h3>Rekap Pembayaran</h3>

          {summary ? (
            <p className={`status-text ${status.type}`}>{status.text}</p>
          ) : (
            <p>Memuat data...</p>
          )}
        </div>

        {/* === STEP 1: QRIS saja === */}
        <div className="step-card">
          <h3>Step 1: Scan QRIS Pembayaran</h3>
          <p className="note">Besar iuran: Rp 20.000/bulan</p>

          <div className="qr-area">
            <div className="qr-inner-card">
              <QRCard qrUrl="/qris.png" />
              <p className="hint">QRIS Statis Bendahara</p>
            </div>
          </div>
        </div>

        {/* === STEP 2: Konfirmasi === */}
        <div className="step-card">
          <h3>Step 2: Konfirmasi Pembayaran</h3>
          <label>Upload bukti pembayaran (JPG/PNG)</label>
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
