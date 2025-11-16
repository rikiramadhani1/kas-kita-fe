import { useEffect, useState } from "react";
import api from "../../service/api"; // Import axios instance yang sudah dikonfigurasi
import "./DashboardAdmin.css";

export default function DashboardAdmin() {
  const [members, setMembers] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [wau, setWau] = useState(0); // WAU (Weekly Active Users)
  const [error, setError] = useState<string>("");

  // State untuk Add Kas
  const [kasType, setKasType] = useState<string>("in");
  const [kasSource, setKasSource] = useState<string>("dues");
  const [kasAmount, setKasAmount] = useState<number>(0);
  const [kasDescription, setKasDescription] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [unpaidMembers, setUnpaidMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);


  // Fetch Members
  const fetchMembers = async () => {
    try {
      const response = await api.get("/members");
      setMembers(response.data.data);
    } catch (err) {
      setError("Failed to fetch members");
    }
  };

  // Fetch Actions (Activity)
  const fetchActivities = async () => {
    try {
      const response = await api.get("/analytics/action");
      setActivityData(response.data.data);
    } catch (err) {
      setError("Failed to fetch activity data");
    }
  };

  // Fetch Weekly Active Users (WAU) - Placeholder
  const fetchWau = async () => {
    setWau(43); // Placeholder value, should come from an actual API if available
  };

  // Set PIN for Member
  const setPinForMember = async (memberId: number) => {
    try {
      const response = await api.post(`/auth/members/${memberId}/pin`);
      alert(`${response.data.data} - Set PIN sukses!`);
    } catch (err) {
      alert("Failed to set PIN");
    }
  };

  // Add Admin
  const addAdmin = async (email: string) => {
    try {
      const response = await api.post("/admin/register", { email });
      alert(`${response.data.data.email} - Admin added successfully!`);
      setNewAdminEmail(""); // Clear email input
    } catch (err) {
      alert("Failed to add admin");
    }
  };

  // Add Kas (Cash Flow)
  const addKas = async () => {
    if (kasAmount <= 0 || !kasDescription) {
      alert("Pastikan jumlah dan deskripsi iuran sudah diisi.");
      return;
    }

    const kasData = {
      type: kasType,
      source: kasSource,
      amount: kasAmount,
      description: kasDescription
    };

    try {
      await api.post("/cashflow/", kasData);
      alert("Kas berhasil ditambahkan!");
      setKasAmount(0); // Clear after submission
      setKasDescription(""); // Clear description
    } catch (err) {
      alert("Failed to add Kas");
    }
  };

  // Fetch Unpaid Members
  const fetchUnpaidMembers = async () => {
    try {
      const response = await api.get("/payments/unpaid"); // Panggil endpoint baru
      console.log("responseeeeeee", response)
      setUnpaidMembers(response.data.data); // Ambil data unpaid members
    } catch (err) {
      setError("Failed to fetch unpaid members");
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchActivities();
    fetchWau();
    fetchUnpaidMembers();
  }, []);

  return (
    <div className="admin-container profile">
      <h1>Admin Control Panel</h1>

      {/* List of Unpaid Members */}
      <section className="admin-card">
        <h2>List Member (Bulan Belum Bayar)</h2>
        {error && <div className="error-box">{error}</div>}
        <table className="member-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rumah</th>
              <th>Belum Bayar</th>
            </tr>
          </thead>
          <tbody>
            {unpaidMembers.map((member, index) => (
              <tr key={member.phone} className={index % 2 === 0 ? "even" : "odd"}>
                <td>{member.name}</td>
                <td>{member.hous}</td>
                <td>{member.unpaid} bulan</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Add Kas */}
      <section className="admin-card">
        <h2>Add Kas</h2>
        <div className="kas-fields">
          {/* Dropdown for Type */}
          <label>
            Type:
            <select
              value={kasType}
              onChange={(e) => setKasType(e.target.value)}
              className="pin-input"
            >
              <option value="in">In</option>
              <option value="out">Out</option>
            </select>
          </label>

          {/* Dropdown for Source */}
          <label>
            Source:
            <select
              value={kasSource}
              onChange={(e) => setKasSource(e.target.value)}
              className="pin-input"
            >
              <option value="dues">Dues</option>
              <option value="donation">Donation</option>
              <option value="other">Other</option>
            </select>
          </label>

          {/* Amount Field */}
          <label>
            Amount:
            <input
              type="number"
              placeholder="Jumlah Iuran"
              value={kasAmount}
              onChange={(e) => setKasAmount(Number(e.target.value))}
              className="pin-input"
            />
          </label>

          {/* Description Field */}
          <label>
            Description:
            <input
              type="text"
              placeholder="Deskripsi Iuran"
              value={kasDescription}
              onChange={(e) => setKasDescription(e.target.value)}
              className="pin-input"
            />
          </label>

          {/* Submit Button */}
          <button onClick={addKas} className="reset-btn">
            Tambah Iuran Manual
          </button>
        </div>
      </section>

      {/* Monitoring Activity Member */}
      <section className="admin-card">
        <h2>Monitoring Activity Member</h2>
        {error && <div className="error-box">{error}</div>}
        <table className="activity-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Action</th>
              <th>Features</th>
              <th>Action Count</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((activity, index) => (
              <tr key={activity.id_member} className={index % 2 === 0 ? "even" : "odd"}>
                <td>{activity.nama_member}</td>
                <td>{activity.action}</td>
                <td>{[...new Set(activity.feature)].join(", ")}</td> {/* Hanya tampilkan fitur unik */}
                <td>{activity.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* WAU (Weekly Active Users) */}
      <section className="admin-card">
        <h2>WAU (Weekly Active User)</h2>
        <p>{wau} Users aktif minggu ini</p>
      </section>

      {/* Set PIN Member */}
      <section className="admin-card">
        <h2>Set PIN Member</h2>

        {/* Dropdown pilih member */}
        <label>
          Pilih Member:
          <select
            value={selectedMemberId || ""}
            onChange={(e) => setSelectedMemberId(Number(e.target.value))}
            className="pin-input"
          >
            <option value="">-- Pilih Member --</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.house_number})
              </option>
            ))}
          </select>
        </label>

        {/* Tombol Set PIN */}
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


      {/* Add Admin */}
      <section className="admin-card">
        <h2>Tambah Admin</h2>
        <input
          type="email"
          placeholder="Email Admin Baru"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="pin-input"
        />
        <button onClick={() => addAdmin(newAdminEmail)} className="reset-btn">
          Tambah Admin
        </button>
      </section>
    </div>
  );
}
