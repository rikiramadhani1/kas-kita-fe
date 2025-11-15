import { useEffect, useRef, useState } from "react";
import api from "../service/api";
import "./Dashboard.css";

interface Transaction {
  id: number;
  type: "in" | "out";
  source: string;
  amount: number;
  description: string;
  created_at: string;
}

interface MonthlyTransactions {
  year: string;
  month: string;
  transactions: Transaction[];
}

export default function Dashboard() {
  const [saldoBulanIni, setSaldoBulanIni] = useState<number>(0);
  const [saldoTotal, setSaldoTotal] = useState<number>(0);
  const [transactions, setTransactions] = useState<MonthlyTransactions[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const years = [2025, 2026];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleBulletClick = (index: number) => {
    setCurrentIndex(index);
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({ left: width * index, behavior: "smooth" });
    }
  };

  // ======= Ambil saldo bulan ini =======
  useEffect(() => {
    const fetchSaldoBulanIni = async () => {
      try {
        const res = await api.get("/cashflow/saldo"); // default bulan berjalan
        setSaldoBulanIni(res.data.data?.saldo || 0);
      } catch (err) {
        console.error("Error saldo bulan ini:", err);
      }
    };
    fetchSaldoBulanIni();
  }, []);

  // ======= Ambil saldo total =======
  useEffect(() => {
    const fetchSaldoTotal = async () => {
      try {
        const res = await api.get("/cashflow/saldo?all=true");
        setSaldoTotal(res.data.data?.saldo || 0);
      } catch (err) {
        console.error("Error saldo total:", err);
      }
    };
    fetchSaldoTotal();
  }, []);

  // ======= Ambil transaksi per tahun =======
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/cashflow?year=${selectedYear}`);
        setTransactions(res.data.data || []);
      } catch (err) {
        console.error("Error transaksi:", err);

        // TAMPILKAN PESAN DI HISTORY KETIKA SERVER OFF
        setTransactions([
          {
            year: String(selectedYear),
            month: "Informasi",
            transactions: [
              {
                id: -1,
                type: "out", // bebas, cuma biar render
                source: "system",
                amount: 0,
                description:
                  `Hai! Servernya lagi offline dulu ya 😊\n
                   Coba lagi di jam operasional:\n
                   Senin-Jumat 09.00–17.00.`,
                created_at: new Date().toISOString()
              }
            ]
          }
        ]);
      }
    };
    fetchTransactions();
  }, [selectedYear]);

  return (
    <div className="page-container">
    <div className="dashboard">
      {/* ==== SALDO ==== */}
      <div className="saldo-container">
        <div className="saldo-carousel" ref={carouselRef}>
          <div className="saldo-card kas">
            <p className="saldo-label">Saldo Total</p>
            <h2 className="saldo-amount">Rp {saldoTotal.toLocaleString("id-ID")}</h2>
          </div>
          <div className="saldo-card user">
            <p className="saldo-label">Saldo Bulan Ini</p>
            <h2 className="saldo-amount">Rp {saldoBulanIni.toLocaleString("id-ID")}</h2>
          </div>
        </div>
      </div>

      {/* Bullet indicator saldo */}
      <div className="carousel-bullets">
        {[0, 1].map((_, i) => (
          <span
            key={i}
            className={i === currentIndex ? "active" : ""}
            onClick={() => handleBulletClick(i)}
          ></span>
        ))}
      </div>

      {/* ==== SLIDE TAHUN ==== */}
      <div className="year-slide-bar">
        {years.map((year) => (
          <div
            key={year}
            className={`year-text ${selectedYear === year ? "active" : ""}`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </div>
        ))}
      </div>

      {/* ==== RIWAYAT TRANSAKSI ==== */}
      <div className="section">
        <h3>Riwayat Transaksi {selectedYear}</h3>
        {transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Belum ada transaksi</p>
        ) : (
          transactions.map((group) => (
            <div key={group.month} className="month-group">
              <h4>{group.month}</h4>
              <table className="table">
                <tbody>
                  {group.transactions.map((tx) => {
                    // ====== RENDER PESAN ERROR ======
                    if (tx.id === -1) {
                      return (
                        <tr key="error-message">
                          <td colSpan={2}>
                            <div className="error-box">
                              <span className="error-icon">⚠️</span>
                              <div>
                                <strong>{tx.description}</strong>
                                <br />
                                <small>{new Date(tx.created_at).toLocaleString("id-ID")}</small>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // ====== RENDER TRANSAKSI NORMAL ======
                    return (
                      <tr key={tx.id}>
                        <td>
                          <div>
                            <strong>{tx.description}</strong>
                            <br />
                            <small>
                              {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </small>
                          </div>
                        </td>
                        <td
                          className={tx.type === "in" ? "plus" : "minus"}
                          style={{ textAlign: "right" }}
                        >
                          {tx.type === "in" ? "+" : "-"} Rp{" "}
                          {tx.amount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}

