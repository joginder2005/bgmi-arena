import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bgmi-arena-n3mk.vercel.app";

const adminLoginInitialState = {
  emailOrPhone: "",
  password: "",
};

const adminRegisterInitialState = {
  username: "",
  emailOrPhone: "",
  bgmiId: "",
  password: "",
  adminRegistrationKey: "",
};

const createMatchInitialState = {
  title: "",
  type: "classic",
  mode: "squad",
  map: "Erangel",
  entryFee: "50",
  perKillReward: "0",
  prizePool: "5000",
  totalSlots: "100",
  status: "upcoming",
  roomId: "",
  roomPassword: "",
};

const defaultStats = [
  { label: "Total Revenue", value: "Rs0", accent: "orange" },
  { label: "Active Matches", value: "0", accent: "green" },
  { label: "Players Today", value: "0", accent: "orange" },
  { label: "Pending Payouts", value: "0", accent: "red" },
];

function formatCurrency(value) {
  return `Rs${Number(value || 0).toLocaleString("en-IN")}`;
}

function buildStats(data) {
  return [
    { label: "Total Revenue", value: formatCurrency(data?.totalRevenue), accent: "orange" },
    { label: "Active Matches", value: String(data?.activeMatches ?? 0), accent: "green" },
    { label: "Players Today", value: String(data?.totalUsers ?? 0), accent: "orange" },
    { label: "Pending Payouts", value: String(data?.pendingWithdrawals ?? 0), accent: "red" },
  ];
}

function normaliseMatchForForm(match) {
  return {
    id: match._id,
    title: match.title,
    type: match.type,
    mode: match.mode,
    map: match.map,
    entryFee: String(match.entryFee),
    perKillReward: String(match.perKillReward || 0),
    prizePool: String(match.prizePool),
    totalSlots: String(match.totalSlots),
    status: match.status,
    roomId: match.roomId || "",
    roomPassword: match.roomPassword || "",
    joinedCount: match.joinedPlayers?.length || 0,
    payoutProcessed: Boolean(match.payoutProcessed),
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function StatusNotice({ tone = "default", children }) {
  const className =
    tone === "error"
      ? "rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
      : tone === "success"
        ? "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        : "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-arena-muted";

  return <p className={className}>{children}</p>;
}

function AdminPanel({ activeSection }) {
  const { isAuthenticated, login, logout, register, token, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  const [stats, setStats] = useState(defaultStats);
  const [matches, setMatches] = useState([]);
  const [panelStatus, setPanelStatus] = useState({ loading: false, error: "", success: "" });
  const [adminLoginForm, setAdminLoginForm] = useState(adminLoginInitialState);
  const [adminRegisterForm, setAdminRegisterForm] = useState(adminRegisterInitialState);
  const [authStatus, setAuthStatus] = useState({ loginError: "", registerError: "", success: "" });
  const [createMatchForm, setCreateMatchForm] = useState(createMatchInitialState);
  const [createStatus, setCreateStatus] = useState({ loading: false, error: "", success: "" });

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const loadAdminData = async () => {
    if (!isAdmin || !token) {
      return;
    }

    setPanelStatus({ loading: true, error: "", success: "" });

    try {
      const [statsResponse, matchesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/dashboard`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/api/matches`, { headers: authHeaders }),
      ]);

      const statsData = await parseResponse(statsResponse);
      const matchesData = await parseResponse(matchesResponse);

      setStats(buildStats(statsData));
      setMatches((matchesData.matches || []).map(normaliseMatchForForm));
      setPanelStatus({ loading: false, error: "", success: "" });
    } catch (error) {
      setPanelStatus({ loading: false, error: error.message, success: "" });
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin, token]);

  const handleAdminLoginChange = (event) => {
    const { name, value } = event.target;
    setAdminLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleAdminRegisterChange = (event) => {
    const { name, value } = event.target;
    setAdminRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateMatchChange = (event) => {
    const { name, value } = event.target;
    setCreateMatchForm((current) => ({ ...current, [name]: value }));
  };

  const handleMatchFieldChange = (matchId, field, value) => {
    setMatches((current) =>
      current.map((match) => (match.id === matchId ? { ...match, [field]: value } : match))
    );
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAuthStatus({ loginError: "", registerError: "", success: "" });

    try {
      const result = await login(adminLoginForm);
      if (result.user.role !== "admin") {
        logout();
        throw new Error("This account is not an admin account");
      }
      setAdminLoginForm(adminLoginInitialState);
      setAuthStatus({ loginError: "", registerError: "", success: "Admin login successful." });
    } catch (error) {
      setAuthStatus({ loginError: error.message, registerError: "", success: "" });
    }
  };

  const handleAdminRegister = async (event) => {
    event.preventDefault();
    setAuthStatus({ loginError: "", registerError: "", success: "" });

    try {
      await register({
        ...adminRegisterForm,
        role: "admin",
      });
      setAdminRegisterForm(adminRegisterInitialState);
      setAuthStatus({ loginError: "", registerError: "", success: "Admin account created and signed in." });
    } catch (error) {
      setAuthStatus({ loginError: "", registerError: error.message, success: "" });
    }
  };

  const handleCreateMatch = async (event) => {
    event.preventDefault();
    setCreateStatus({ loading: true, error: "", success: "" });

    try {
      const payload = {
        title: createMatchForm.title,
        type: createMatchForm.type,
        mode: createMatchForm.mode,
        map: createMatchForm.map,
        entryFee: Number(createMatchForm.entryFee),
        perKillReward: Number(createMatchForm.perKillReward || 0),
        prizePool: Number(createMatchForm.prizePool),
        totalSlots: Number(createMatchForm.totalSlots),
        status: createMatchForm.status,
        ...(createMatchForm.roomId ? { roomId: createMatchForm.roomId } : {}),
        ...(createMatchForm.roomPassword ? { roomPassword: createMatchForm.roomPassword } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/api/matches`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      await parseResponse(response);
      setCreateMatchForm(createMatchInitialState);
      setCreateStatus({ loading: false, error: "", success: "Match created successfully." });
      loadAdminData();
    } catch (error) {
      setCreateStatus({ loading: false, error: error.message, success: "" });
    }
  };

  const handleSaveMatch = async (match) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${match.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          title: match.title,
          type: match.type,
          mode: match.mode,
          map: match.map,
          entryFee: Number(match.entryFee),
          perKillReward: Number(match.perKillReward || 0),
          prizePool: Number(match.prizePool),
          totalSlots: Number(match.totalSlots),
          status: match.status,
        }),
      });

      await parseResponse(response);
      setPanelStatus({ loading: false, error: "", success: `${match.title} updated.` });
      loadAdminData();
    } catch (error) {
      setPanelStatus({ loading: false, error: error.message, success: "" });
    }
  };

  const handleDeleteMatch = async (matchId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      await parseResponse(response);
      setPanelStatus({ loading: false, error: "", success: "Match deleted." });
      loadAdminData();
    } catch (error) {
      setPanelStatus({ loading: false, error: error.message, success: "" });
    }
  };

  const showSection = (sectionKey) => activeSection === sectionKey;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="space-y-6">
        <section id="admin-access" className="arena-card p-8">
          <h2 className="text-3xl font-bold text-white">Admin Access</h2>
          <p className="mt-2 text-lg text-arena-muted">
            Sign in with an admin account or create one using the admin registration key from your backend `.env`.
          </p>
          {authStatus.success ? <div className="mt-5"><StatusNotice tone="success">{authStatus.success}</StatusNotice></div> : null}
        </section>

        {showSection("admin-access") ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="arena-card p-8">
              <h3 className="text-2xl font-bold text-white">Admin Login</h3>
              <form className="mt-6 space-y-5" onSubmit={handleAdminLogin}>
                <label className="auth-field">
                  <span>Email or Phone</span>
                  <input
                    name="emailOrPhone"
                    value={adminLoginForm.emailOrPhone}
                    onChange={handleAdminLoginChange}
                    placeholder="admin@example.com"
                    required
                  />
                </label>
                <label className="auth-field">
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    value={adminLoginForm.password}
                    onChange={handleAdminLoginChange}
                    placeholder="Enter admin password"
                    required
                  />
                </label>
                {authStatus.loginError ? <StatusNotice tone="error">{authStatus.loginError}</StatusNotice> : null}
                <button type="submit" className="btn-primary w-full">Login as Admin</button>
              </form>
            </section>

            <section className="arena-card p-8">
              <h3 className="text-2xl font-bold text-white">Create Admin Account</h3>
              <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleAdminRegister}>
                <label className="auth-field sm:col-span-2">
                  <span>Username</span>
                  <input
                    name="username"
                    value={adminRegisterForm.username}
                    onChange={handleAdminRegisterChange}
                    placeholder="AdminBoss"
                    required
                  />
                </label>
                <label className="auth-field sm:col-span-2">
                  <span>Email or Phone</span>
                  <input
                    name="emailOrPhone"
                    value={adminRegisterForm.emailOrPhone}
                    onChange={handleAdminRegisterChange}
                    placeholder="admin@example.com"
                    required
                  />
                </label>
                <label className="auth-field sm:col-span-2">
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    value={adminRegisterForm.password}
                    onChange={handleAdminRegisterChange}
                    placeholder="Minimum 6 characters"
                    minLength="6"
                    required
                  />
                </label>
                <label className="auth-field sm:col-span-2">
                  <span>Admin Registration Key</span>
                  <input
                    name="adminRegistrationKey"
                    type="password"
                    value={adminRegisterForm.adminRegistrationKey}
                    onChange={handleAdminRegisterChange}
                    placeholder="From backend .env"
                    required
                  />
                </label>
                {authStatus.registerError ? <div className="sm:col-span-2"><StatusNotice tone="error">{authStatus.registerError}</StatusNotice></div> : null}
                <button type="submit" className="btn-primary sm:col-span-2">Create Admin Account</button>
              </form>
            </section>
          </div>
        ) : (
          <section className="arena-card p-8">
            <h3 className="text-2xl font-bold text-white">Admin access required</h3>
            <p className="mt-2 text-arena-muted">Open the `Admin Access` tab to sign in or create an admin account first.</p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section id="admin-access" className="arena-card p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Admin Control Center</h2>
            <p className="mt-2 text-lg text-arena-muted">
              Logged in as {user.username}. Create matches, update key values, and manage the live list.
            </p>
          </div>
          <button type="button" onClick={logout} className="btn-secondary">
            Logout Admin
          </button>
        </div>
      </section>

      {panelStatus.error ? <StatusNotice tone="error">{panelStatus.error}</StatusNotice> : null}
      {panelStatus.success ? <StatusNotice tone="success">{panelStatus.success}</StatusNotice> : null}
      {panelStatus.loading ? <StatusNotice>Loading admin data...</StatusNotice> : null}

      {showSection("dashboard-stats") ? (
        <div id="dashboard-stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="arena-card p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-arena-muted">{stat.label}</div>
              <div
                className={`mt-3 text-4xl font-bold ${
                  stat.accent === "green"
                    ? "text-arena-green"
                    : stat.accent === "red"
                      ? "text-arena-red"
                      : "text-arena-orange"
                }`}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showSection("create-match") ? (
        <section id="create-match" className="arena-card p-8">
          <h3 className="text-3xl font-bold text-white">Create Match</h3>
          <p className="mt-2 text-arena-muted">Fill all match details and publish the room with the backend-supported schema.</p>
          <form className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleCreateMatch}>
            <label className="auth-field xl:col-span-3">
              <span>Title</span>
              <input name="title" value={createMatchForm.title} onChange={handleCreateMatchChange} placeholder="Erangel Pro League" required />
            </label>
            <label className="auth-field">
              <span>Type</span>
              <select name="type" value={createMatchForm.type} onChange={handleCreateMatchChange}>
                <option value="classic">Classic</option>
                <option value="tdm">TDM</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Mode</span>
              <select name="mode" value={createMatchForm.mode} onChange={handleCreateMatchChange}>
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
                <option value="4v4">4v4</option>
                <option value="2v2">2v2</option>
                <option value="1v1">1v1</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Status</span>
              <select name="status" value={createMatchForm.status} onChange={handleCreateMatchChange}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="auth-field">
              <span>Map</span>
              <input name="map" value={createMatchForm.map} onChange={handleCreateMatchChange} placeholder="Erangel" required />
            </label>
            <label className="auth-field">
              <span>Entry Fee</span>
              <input name="entryFee" type="number" min="0" value={createMatchForm.entryFee} onChange={handleCreateMatchChange} required />
            </label>
            <label className="auth-field">
              <span>Per Kill Reward</span>
              <input
                name="perKillReward"
                type="number"
                min="0"
                value={createMatchForm.perKillReward}
                onChange={handleCreateMatchChange}
              />
            </label>
            <label className="auth-field">
              <span>Prize Pool</span>
              <input name="prizePool" type="number" min="0" value={createMatchForm.prizePool} onChange={handleCreateMatchChange} required />
            </label>
            <label className="auth-field">
              <span>Total Slots</span>
              <input name="totalSlots" type="number" min="2" value={createMatchForm.totalSlots} onChange={handleCreateMatchChange} required />
            </label>
            <label className="auth-field">
              <span>Room ID</span>
              <input name="roomId" value={createMatchForm.roomId} onChange={handleCreateMatchChange} placeholder="Optional at create time" />
            </label>
            <label className="auth-field">
              <span>Room Password</span>
              <input name="roomPassword" value={createMatchForm.roomPassword} onChange={handleCreateMatchChange} placeholder="Optional at create time" />
            </label>
            {createStatus.error ? <div className="xl:col-span-3"><StatusNotice tone="error">{createStatus.error}</StatusNotice></div> : null}
            {createStatus.success ? <div className="xl:col-span-3"><StatusNotice tone="success">{createStatus.success}</StatusNotice></div> : null}
            <button type="submit" className="btn-primary xl:col-span-3" disabled={createStatus.loading}>
              {createStatus.loading ? "Creating Match..." : "Create Match"}
            </button>
          </form>
        </section>
      ) : null}

      {showSection("manage-matches") ? (
        <section id="manage-matches" className="arena-card overflow-hidden">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="text-3xl font-bold text-white">Manage Matches</h3>
            <p className="mt-1 text-lg text-arena-muted">Edit real backend match data and save each row.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5 text-left text-sm uppercase tracking-[0.24em] text-arena-muted">
                <tr>
                  <th className="px-6 py-4">Match</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Map</th>
                  <th className="px-6 py-4">Entry</th>
                  <th className="px-6 py-4">Per Kill</th>
                  <th className="px-6 py-4">Prize</th>
                  <th className="px-6 py-4">Slots</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-t border-white/10 align-top">
                    <td className="px-6 py-5">
                      <div className="min-w-[220px] space-y-3">
                        <input
                          value={match.title}
                          onChange={(event) => handleMatchFieldChange(match.id, "title", event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500/50"
                        />
                        <div className="text-sm text-arena-muted">{match.joinedCount} joined</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={match.type}
                        onChange={(event) => handleMatchFieldChange(match.id, "type", event.target.value)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      >
                        <option value="classic">Classic</option>
                        <option value="tdm">TDM</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={match.mode}
                        onChange={(event) => handleMatchFieldChange(match.id, "mode", event.target.value)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      >
                        <option value="solo">Solo</option>
                        <option value="duo">Duo</option>
                        <option value="squad">Squad</option>
                        <option value="4v4">4v4</option>
                        <option value="2v2">2v2</option>
                        <option value="1v1">1v1</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <input
                        value={match.map}
                        onChange={(event) => handleMatchFieldChange(match.id, "map", event.target.value)}
                        className="w-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500/50"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="number"
                        min="0"
                        value={match.entryFee}
                        onChange={(event) => handleMatchFieldChange(match.id, "entryFee", event.target.value)}
                        className="w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500/50"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="number"
                        min="0"
                        value={match.perKillReward}
                        onChange={(event) => handleMatchFieldChange(match.id, "perKillReward", event.target.value)}
                        className="w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500/50"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="number"
                        min="0"
                        value={match.prizePool}
                        onChange={(event) => handleMatchFieldChange(match.id, "prizePool", event.target.value)}
                        className="w-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500/50"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="number"
                        min="2"
                        value={match.totalSlots}
                        onChange={(event) => handleMatchFieldChange(match.id, "totalSlots", event.target.value)}
                        className="w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500/50"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={match.status}
                        onChange={(event) => handleMatchFieldChange(match.id, "status", event.target.value)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex min-w-[180px] gap-3">
                        <button type="button" onClick={() => handleSaveMatch(match)} className="btn-primary px-4 py-2">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMatch(match.id)}
                          className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-base font-bold text-arena-red transition hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!matches.length ? (
                <tr>
                    <td colSpan="10" className="px-6 py-10 text-center text-arena-muted">
                      No matches found yet. Create the first one above.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AdminPanel;
