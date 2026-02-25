import { useEffect, useState } from "react";
import api from "../../service/api";
import { jwtDecode } from "jwt-decode";
import "./DashboardAdmin.css";

export default function DashboardAdmin() {
  const [members, setMembers] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [wau, setWau] = useState(0);
  const [error, setError] = useState<string>("");

  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [adminId, setAdminId] = useState<number | null>(null);

  // State Add Kas
  const [kasType, setKasType] = useState<string>("in");
  const [kasSource, setKasSource] = useState<string>("dues");
  const [kasAmount, setKasAmount] = useState<number>(0);
  const [kasDescription, setKasDescription] = useState<string>("");

  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // ================= DECODE TOKEN =================
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setAdminId(decoded.id); // sesuai payload kamu
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);

  // ================= FETCH DATA =================

  const fetchMembers = async () => {
    try {
      const res = await api.get("/members");
      setMembers(res.data.data);
    } catch {
      setError("Failed to fetch members");
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get("/analytics/action");
      setActivityData(res.data.data);
    } catch {
      setError("Failed to fetch activity data");
    }
  };

  const fetchWau = async () => {
    setWau(43);
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
    fetchMembers();
    fetchActivities();
    fetchWau();
    fetchMonthlySummary();
  }, []);

  // ================= TAMBAH CASH MEMBER =================

  const addCashMember = async (memberId: number) => {
    const nominal = prompt("Masukkan nominal kas:");

    if (!nominal || Number(nominal) <= 0) {
      alert("Nominal tidak valid");
      return;
    }

    try {
      await api.post("/payments/request", {
        member_id: memberId,
        total_amount: Number(nominal),
      });

      alert("Kas member berhasil ditambahkan!");
      fetchMonthlySummary();
    } catch {
      alert("Gagal menambahkan kas member");
    }
  };

  // ================= TAMBAH KAS GLOBAL =================

  const addKas = async () => {
    if (kasAmount <= 0 || !kasDescription) {
      alert("Pastikan jumlah dan deskripsi iuran sudah diisi.");
      return;
    }

    try {
      await api.post("/cashflow/", {
        type: kasType,
        source: kasSource,
        total_amount: kasAmount,
        description: kasDescription,
      });

      alert("Kas berhasil ditambahkan!");
      setKasAmount(0);
      setKasDescription("");
      fetchMonthlySummary();
    } catch {
      alert("Failed to add Kas");
    }
  };

  // ================= SET PIN =================

  const setPinForMember = async (memberId: number) => {
    try {
      const res = await api.post(`/auth/members/${memberId}/pin`);
      alert(`${res.data.data} - Set PIN sukses!`);
    } catch {
      alert("Failed to set PIN");
    }
  };

  // ================= TAMBAH ADMIN =================

  const addAdmin = async (email: string) => {
    try {
      const res = await api.post("/admin/register", { email });
      alert(`${res.data.data.email} - Admin added successfully!`);
      setNewAdminEmail("");
    } catch {
      alert("Failed to add admin");
    }
  };

  return (
    <div className="admin-container profile">
      <h1>Admin Control Panel</h1>

      {/* ================= KONTRIBUSI MEMBER ================= */}
      <section className="admin-card">
  <h2>Kontribusi Member</h2>

  {monthlySummary && (
    <div className="member-list-card">

      {/* MEMBER YANG SUDAH BAYAR */}
      {members.map((member: any) => {
        const found = monthlySummary.members.find(
          (m: any) => m.member_id === member.id
        );

        const totalPaid = found ? found.total_paid : 0;

        return (
          <div
            key={member.id}
            className={`member-row ${totalPaid === 0 ? "unpaid" : ""}`}
          >
            <span>{member.name}</span>

            <span>
              Rp {totalPaid.toLocaleString("id-ID")}
            </span>

            <button
              className="reset-btn"
              onClick={() => addCashMember(member.id)}
            >
              Tambah Cash
            </button>
          </div>
        );
      })}

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
  )}
</section>

      {/* ================= TAMBAH KAS ================= */}
      <section className="admin-card">
        <h2>Tambah Kas</h2>

        <select
          value={kasType}
          onChange={(e) => setKasType(e.target.value)}
          className="pin-input"
        >
          <option value="in">Masuk</option>
          <option value="out">Keluar</option>
        </select>

        <select
          value={kasSource}
          onChange={(e) => setKasSource(e.target.value)}
          className="pin-input"
        >
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
          <option value="dues">Iuran</option>
        </select>

        <input
          type="number"
          placeholder="Jumlah"
          value={kasAmount}
          onChange={(e) => setKasAmount(Number(e.target.value))}
          className="pin-input"
        />

        <input
          type="text"
          placeholder="Deskripsi"
          value={kasDescription}
          onChange={(e) => setKasDescription(e.target.value)}
          className="pin-input"
        />

        <button onClick={addKas} className="reset-btn">
          Tambah Kas
        </button>
      </section>

      {/* ================= SUPER ADMIN ONLY ================= */}
      {adminId === 1 && (
        <>
          <section className="admin-card">
            <h2>Monitoring Aktivitas Anggota</h2>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Aksi</th>
                  <th>Fitur</th>
                  <th>Banyaknya</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map((activity, index) => (
                  <tr key={activity.id_member}>
                    <td>{activity.nama_member}</td>
                    <td>{activity.action}</td>
                    <td>{[...new Set(activity.feature)].join(", ")}</td>
                    <td>{activity.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card">
            <h2>WAU</h2>
            <p>{wau} Users aktif minggu ini</p>
          </section>

          <section className="admin-card">
            <h2>Set PIN Anggota</h2>

            <select
              value={selectedMemberId || ""}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
              className="pin-input"
            >
              <option value="">-- Pilih Anggota --</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.house_number})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (!selectedMemberId) {
                  alert("Pilih member terlebih dahulu!");
                  return;
                }
                setPinForMember(selectedMemberId);
              }}
              className="reset-btn"
            >
              Set PIN
            </button>
          </section>

          <section className="admin-card">
            <h2>Tambah Admin</h2>
            <input
              type="email"
              placeholder="Email Admin Baru"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="pin-input"
            />
            <button
              onClick={() => addAdmin(newAdminEmail)}
              className="reset-btn"
            >
              Tambah Admin
            </button>
          </section>
        </>
      )}
    </div>
  );
}