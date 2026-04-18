import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const css = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--black:#070707;--surface:#0e0e0e;--card:#131313;--card2:#191919;--border:#1f1f1f;--border2:#2a2a2a;--white:#f0ede6;--muted:#666;--muted2:#444;--accent:#c8f065;--accent2:#7b8cde;--red:#ff6b4a;--green:#4ade80;--yellow:#fbbf24;--font-display:'Syne',sans-serif;--font-body:'DM Sans',sans-serif}
html,body{height:100%}
body{background:var(--black);color:var(--white);font-family:var(--font-body);overflow-x:hidden}
.dash{display:flex;min-height:100vh}
.sidebar{width:240px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
@media(max-width:768px){.sidebar{display:none}}
.sidebar-brand{padding:1.5rem 1.4rem;border-bottom:1px solid var(--border)}
.sidebar-logo{font-family:var(--font-display);font-size:1rem;font-weight:800;color:var(--white)}
.sidebar-logo span{color:var(--accent)}
.sidebar-tagline{font-size:.7rem;color:var(--muted);margin-top:.2rem;letter-spacing:.05em;text-transform:uppercase}
.sidebar-nav{padding:1rem 0;flex:1}
.sidebar-section{padding:.4rem 1.4rem;font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);margin-bottom:.3rem;margin-top:.8rem}
.sidebar-link{display:flex;align-items:center;gap:.7rem;padding:.65rem 1.4rem;font-size:.84rem;color:var(--muted);cursor:pointer;transition:all .2s;border-left:2px solid transparent}
.sidebar-link:hover{color:var(--white);background:rgba(255,255,255,.03)}
.sidebar-link.active{color:var(--accent);background:rgba(200,240,101,.05);border-left-color:var(--accent)}
.sidebar-link .sl-icon{font-size:1rem;width:18px;text-align:center}
.sidebar-link .sl-badge{margin-left:auto;background:var(--accent);color:#080808;border-radius:100px;font-size:.62rem;font-weight:700;padding:.1rem .45rem;min-width:18px;text-align:center}
.sidebar-footer{padding:1rem 1.4rem;border-top:1px solid var(--border)}
.sidebar-user{display:flex;align-items:center;gap:.7rem}
.sidebar-avatar{width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:.75rem;font-weight:700;color:#080808;flex-shrink:0}
.sidebar-username{font-size:.82rem;font-weight:500}
.sidebar-role{font-size:.7rem;color:var(--muted)}
.logout-btn{margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;font-size:.8rem;padding:.3rem .5rem;border-radius:6px;transition:all .2s}
.logout-btn:hover{color:var(--red)}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:1rem 1.8rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;position:sticky;top:0;z-index:50}
.topbar-left{display:flex;align-items:center;gap:1rem;min-width:0}
.mob-menu-btn{display:none;background:none;border:none;color:var(--white);font-size:1.2rem;cursor:pointer;padding:.3rem}
@media(max-width:768px){.mob-menu-btn{display:block}}
.topbar-title{font-family:var(--font-display);font-size:1.1rem;font-weight:700;white-space:nowrap}
.topbar-right{display:flex;align-items:center;gap:.8rem;flex-shrink:0}
.topbar-search{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:.55rem .9rem;color:var(--white);font-family:var(--font-body);font-size:.84rem;outline:none;transition:border-color .3s;width:220px}
@media(max-width:600px){.topbar-search{width:140px;font-size:.78rem}}
@media(max-width:400px){.topbar-search{width:110px}}
.topbar-search:focus{border-color:var(--border2)}
.tb-btn{background:var(--card);border:1px solid var(--border);color:var(--muted);padding:.55rem .9rem;border-radius:8px;font-size:.8rem;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:var(--font-body)}
.tb-btn:hover{border-color:var(--border2);color:var(--white)}
.tb-btn.danger:hover{border-color:var(--red);color:var(--red)}
.content{padding:1.5rem 1.8rem;flex:1}
@media(max-width:480px){.content{padding:1rem 1.1rem}}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem}
@media(max-width:1100px){.stats-row{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.stats-row{grid-template-columns:1fr 1fr}}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1.2rem}
.sc-label{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem;display:flex;align-items:center;justify-content:space-between}
.sc-icon{font-size:1rem}
.sc-val{font-family:var(--font-display);font-size:1.9rem;font-weight:800;line-height:1}
.sc-val.accent{color:var(--accent)}
.sc-val.blue{color:var(--accent2)}
.sc-val.green{color:var(--green)}
.sc-val.yellow{color:var(--yellow)}
.sc-sub{font-size:.72rem;color:var(--muted);margin-top:.3rem}
.filter-bar{display:flex;gap:.6rem;margin-bottom:1.2rem;flex-wrap:wrap;align-items:center}
.filter-btn{background:var(--card);border:1px solid var(--border);color:var(--muted);padding:.45rem .9rem;border-radius:8px;font-size:.78rem;cursor:pointer;transition:all .2s;font-family:var(--font-body)}
.filter-btn:hover{color:var(--white)}
.filter-btn.active{background:rgba(200,240,101,.1);border-color:rgba(200,240,101,.4);color:var(--accent)}
.table-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.table-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.3rem;border-bottom:1px solid var(--border);gap:1rem;flex-wrap:wrap}
.table-count{font-size:.8rem;color:var(--muted)}
.table-actions{display:flex;gap:.6rem;flex-shrink:0}
table{width:100%;border-collapse:collapse}
thead th{padding:.8rem 1rem;text-align:left;font-size:.68rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:500;border-bottom:1px solid var(--border);white-space:nowrap}
thead th:first-child{padding-left:1.3rem;width:36px}
thead th:last-child{padding-right:1.3rem}
tbody tr{border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:rgba(255,255,255,.025)}
tbody tr.selected{background:rgba(200,240,101,.04)}
td{padding:.9rem 1rem;font-size:.84rem;vertical-align:middle}
td:first-child{padding-left:1.3rem}
td:last-child{padding-right:1.3rem}
.td-check{width:16px;height:16px;accent-color:var(--accent);cursor:pointer}
.td-name{font-weight:500;color:var(--white);margin-bottom:.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.td-email{font-size:.75rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.td-subject{color:#bbb;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.83rem}
.td-date{font-size:.78rem;color:var(--muted);white-space:nowrap}
.status-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .6rem;border-radius:6px;font-size:.7rem;font-weight:500;letter-spacing:.03em;white-space:nowrap}
.status-badge::before{content:'';width:5px;height:5px;border-radius:50%;flex-shrink:0}
.s-new{background:rgba(200,240,101,.1);color:var(--accent)}.s-new::before{background:var(--accent)}
.s-read{background:rgba(255,255,255,.06);color:#aaa}.s-read::before{background:#aaa}
.s-replied{background:rgba(74,222,128,.1);color:var(--green)}.s-replied::before{background:var(--green)}
.s-archived{background:rgba(255,107,74,.08);color:var(--red)}.s-archived::before{background:var(--red)}
.empty-state{text-align:center;padding:4rem 2rem;color:var(--muted)}
.empty-icon{font-size:3rem;margin-bottom:1rem;opacity:.4}
.empty-text{font-size:.9rem}
.pagination{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.3rem;border-top:1px solid var(--border);gap:1rem;flex-wrap:wrap}
.page-info{font-size:.78rem;color:var(--muted)}
.page-btns{display:flex;gap:.4rem}
.page-btn{background:var(--card2);border:1px solid var(--border);color:var(--muted);width:32px;height:32px;border-radius:7px;font-size:.8rem;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;font-family:var(--font-body)}
.page-btn:hover:not(:disabled){border-color:var(--border2);color:var(--white)}
.page-btn:disabled{opacity:.3;cursor:not-allowed}
.page-btn.active{background:rgba(200,240,101,.1);border-color:rgba(200,240,101,.4);color:var(--accent)}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .3s}
.drawer-overlay.open{opacity:1;pointer-events:all}
.drawer{position:fixed;right:0;top:0;bottom:0;width:min(520px,100vw);background:var(--surface);border-left:1px solid var(--border);z-index:101;transform:translateX(100%);transition:transform .35s cubic-bezier(.23,1,.32,1);display:flex;flex-direction:column;overflow:hidden}
.drawer.open{transform:translateX(0)}
.drawer-header{display:flex;align-items:center;justify-content:space-between;padding:1.3rem 1.5rem;border-bottom:1px solid var(--border);gap:1rem;flex-shrink:0}
.drawer-title{font-family:var(--font-display);font-size:1rem;font-weight:700}
.drawer-close{background:var(--card);border:1px solid var(--border);color:var(--muted);width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
.drawer-close:hover{color:var(--white);border-color:var(--border2)}
.drawer-body{padding:1.5rem;overflow-y:auto;flex:1}
.drawer-section{margin-bottom:1.8rem}
.drawer-label{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem;font-weight:500}
.drawer-val{font-size:.9rem;color:var(--white);line-height:1.7}
.drawer-val a{color:var(--accent);text-decoration:none}
.drawer-val a:hover{text-decoration:underline}
.drawer-message{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:1rem 1.2rem;font-size:.88rem;color:#ccc;line-height:1.8;white-space:pre-wrap;word-break:break-word}
.drawer-status-row{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem}
.ds-btn{padding:.4rem .9rem;border-radius:8px;font-size:.78rem;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:var(--card);color:var(--muted);font-family:var(--font-body)}
.ds-btn:hover{color:var(--white);border-color:var(--border2)}
.ds-btn.active{background:rgba(200,240,101,.1);border-color:rgba(200,240,101,.35);color:var(--accent)}
.drawer-notes{width:100%;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem;color:var(--white);font-family:var(--font-body);font-size:.86rem;outline:none;resize:none;height:100px;transition:border-color .3s}
.drawer-notes:focus{border-color:var(--border2)}
.drawer-footer{padding:1.2rem 1.5rem;border-top:1px solid var(--border);display:flex;gap:.7rem;flex-wrap:wrap;flex-shrink:0}
.df-btn{flex:1;padding:.75rem;border-radius:9px;font-family:var(--font-display);font-size:.84rem;font-weight:700;cursor:pointer;transition:all .2s;border:none;min-width:90px}
.df-btn-primary{background:var(--accent);color:#080808}
.df-btn-primary:hover{background:#d8ff75}
.df-btn-danger{background:rgba(255,107,74,.12);color:var(--red);border:1px solid rgba(255,107,74,.25)}
.df-btn-danger:hover{background:rgba(255,107,74,.2)}

.mob-sidebar{position:fixed;inset:0;z-index:150}
.mob-sidebar-bg{position:absolute;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px)}
.mob-sidebar-panel{position:absolute;left:0;top:0;bottom:0;width:260px;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto}

.loading{display:flex;align-items:center;justify-content:center;padding:4rem;color:var(--muted);font-size:.9rem;gap:.6rem}
.spinner{width:18px;height:18px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:640px){
  .col-subject,.col-status{display:none}
  .td-subject,.td-status{display:none}
}
@media(max-width:440px){
  .col-date,.td-date{display:none}
}
`;

const statusColors = {
  new: "s-new",
  read: "s-read",
  replied: "s-replied",
  archived: "s-archived",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [drawerStatus, setDrawerStatus] = useState("");
  const [mobSidebar, setMobSidebar] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("admin_token");
  const user = JSON.parse(
    localStorage.getItem("admin_user") || '{"username":"admin"}',
  );

  const api = useCallback(
    (config) => {
      return axios({
        ...config,
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [token],
  );

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api({
        method: "GET",
        url: `/api/contacts?status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}&limit=15`,
      });
      setContacts(res.data.contacts);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter, search, page, navigate]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openContact = async (contact) => {
    setActiveContact(contact);
    setDrawerNotes(contact.notes || "");
    setDrawerStatus(contact.status);
  };

  const saveDrawer = async () => {
    if (!activeContact) return;
    setSaving(true);
    try {
      await api({
        method: "PATCH",
        url: `/api/contacts/${activeContact._id}`,
        data: { status: drawerStatus, notes: drawerNotes },
      });
      setActiveContact(null);
      fetchContacts();
    } catch {
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      await api({ method: "DELETE", url: `/api/contacts/${id}` });
      setActiveContact(null);
      fetchContacts();
    } catch {
      alert("Delete failed.");
    }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected message(s)?`))
      return;
    try {
      await api({
        method: "DELETE",
        url: "/api/contacts",
        data: { ids: selected },
      });
      setSelected([]);
      fetchContacts();
    } catch {
      alert("Bulk delete failed.");
    }
  };

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  const toggleAll = () =>
    setSelected((s) =>
      s.length === contacts.length ? [] : contacts.map((c) => c._id),
    );
  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          moiz<span>.</span>shahid
        </div>
        <div className="sidebar-tagline">Admin Panel</div>
      </div>
      <div className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        <div className="sidebar-link active">
          <span className="sl-icon">📨</span> Messages{" "}
          {stats.new > 0 && <span className="sl-badge">{stats.new}</span>}
        </div>
        <div
          className="sidebar-link"
          style={{ opacity: 0.5, cursor: "default" }}
        >
          <span className="sl-icon">📊</span> Analytics
        </div>
        <div
          className="sidebar-link"
          style={{ opacity: 0.5, cursor: "default" }}
        >
          <span className="sl-icon">⚙️</span> Settings
        </div>
        <div className="sidebar-section">Quick</div>
        {["all", "new", "read", "replied", "archived"].map((s) => (
          <div
            key={s}
            className={`sidebar-link${statusFilter === s ? " active" : ""}`}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
              setMobSidebar(false);
            }}
          >
            <span className="sl-icon">
              {s === "all"
                ? "📋"
                : s === "new"
                  ? "🔵"
                  : s === "read"
                    ? "👁️"
                    : s === "replied"
                      ? "✅"
                      : "🗄️"}
            </span>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: ".7rem",
                  color: "var(--muted)",
                }}
              >
                {stats[s] || 0}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">A</div>
          <div>
            <div className="sidebar-username">{user.username}</div>
            <div className="sidebar-role">Administrator</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            ⏻
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="dash">
        <aside className="sidebar">
          <SidebarContent />
        </aside>
        {mobSidebar && (
          <div className="mob-sidebar">
            <div
              className="mob-sidebar-bg"
              onClick={() => setMobSidebar(false)}
            />
            <div className="mob-sidebar-panel">
              <SidebarContent />
            </div>
          </div>
        )}

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button
                className="mob-menu-btn"
                onClick={() => setMobSidebar(true)}
              >
                ☰
              </button>
              <div className="topbar-title">Messages</div>
            </div>
            <div className="topbar-right">
              <input
                className="topbar-search"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {selected.length > 0 && (
                <button className="tb-btn danger" onClick={bulkDelete}>
                  Delete ({selected.length})
                </button>
              )}
              <button className="tb-btn" onClick={fetchContacts}>
                ↻ Refresh
              </button>
            </div>
          </div>

          <div className="content">
            <div className="stats-row">
              <div className="stat-card">
                <div className="sc-label">
                  Total Messages <span className="sc-icon">📨</span>
                </div>
                <div className="sc-val">{stats.total}</div>
                <div className="sc-sub">All time</div>
              </div>
              <div className="stat-card">
                <div className="sc-label">
                  New <span className="sc-icon">🔵</span>
                </div>
                <div className="sc-val accent">{stats.new}</div>
                <div className="sc-sub">Unread</div>
              </div>
              <div className="stat-card">
                <div className="sc-label">
                  Replied <span className="sc-icon">✅</span>
                </div>
                <div className="sc-val green">{stats.replied}</div>
                <div className="sc-sub">Resolved</div>
              </div>
              <div className="stat-card">
                <div className="sc-label">
                  Archived <span className="sc-icon">🗄️</span>
                </div>
                <div className="sc-val" style={{ color: "var(--muted)" }}>
                  {stats.archived}
                </div>
                <div className="sc-sub">Hidden</div>
              </div>
            </div>
            <div className="filter-bar">
              {["all", "new", "read", "replied", "archived"].map((s) => (
                <button
                  key={s}
                  className={`filter-btn${statusFilter === s ? " active" : ""}`}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
                  <span style={{ opacity: 0.6 }}>
                    ({s === "all" ? stats.total : stats[s] || 0})
                  </span>
                </button>
              ))}
            </div>
            <div className="table-wrap">
              <div className="table-header">
                <span className="table-count">
                  {loading
                    ? "Loading..."
                    : `${pagination.total} message${pagination.total !== 1 ? "s" : ""}`}
                  {search && ` matching "${search}"`}
                </span>
                <div className="table-actions">
                  {selected.length > 0 && (
                    <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                      {selected.length} selected
                    </span>
                  )}
                </div>
              </div>

              {error ? (
                <div className="empty-state">
                  <div className="empty-icon">⚠️</div>
                  <div className="empty-text">{error}</div>
                </div>
              ) : loading ? (
                <div className="loading">
                  <div className="spinner" /> Loading messages...
                </div>
              ) : contacts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">
                    {search || statusFilter !== "all"
                      ? "No messages match your filters."
                      : "No messages yet. Submit the contact form to see them here."}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              className="td-check"
                              checked={
                                selected.length === contacts.length &&
                                contacts.length > 0
                              }
                              onChange={toggleAll}
                            />
                          </th>
                          <th>Sender</th>
                          <th className="col-subject">Subject</th>
                          <th className="col-status">Status</th>
                          <th className="col-date">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c) => (
                          <tr
                            key={c._id}
                            className={
                              selected.includes(c._id) ? "selected" : ""
                            }
                            onClick={(e) => {
                              if (e.target.type === "checkbox") return;
                              openContact(c);
                            }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                className="td-check"
                                checked={selected.includes(c._id)}
                                onChange={() => toggleSelect(c._id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td>
                              <div className="td-name">
                                {c.status === "new" && (
                                  <span
                                    style={{
                                      color: "var(--accent)",
                                      marginRight: ".3rem",
                                    }}
                                  >
                                    ●
                                  </span>
                                )}
                                {c.name}
                              </div>
                              <div className="td-email">{c.email}</div>
                            </td>
                            <td className="td-subject">
                              <div className="td-subject">{c.subject}</div>
                            </td>
                            <td className="td-status">
                              <span
                                className={`status-badge ${statusColors[c.status]}`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="td-date">
                              {formatDate(c.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pagination.pages > 1 && (
                    <div className="pagination">
                      <span className="page-info">
                        Page {page} of {pagination.pages} · {pagination.total}{" "}
                        total
                      </span>
                      <div className="page-btns">
                        <button
                          className="page-btn"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          ←
                        </button>
                        {Array.from(
                          { length: Math.min(pagination.pages, 5) },
                          (_, i) => i + 1,
                        ).map((n) => (
                          <button
                            key={n}
                            className={`page-btn${page === n ? " active" : ""}`}
                            onClick={() => setPage(n)}
                          >
                            {n}
                          </button>
                        ))}
                        <button
                          className="page-btn"
                          disabled={page >= pagination.pages}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className={`drawer-overlay${activeContact ? " open" : ""}`}
          onClick={() => setActiveContact(null)}
        />
        <div className={`drawer${activeContact ? " open" : ""}`}>
          {activeContact && (
            <>
              <div className="drawer-header">
                <div className="drawer-title">Message Detail</div>
                <button
                  className="drawer-close"
                  onClick={() => setActiveContact(null)}
                >
                  ✕
                </button>
              </div>
              <div className="drawer-body">
                <div className="drawer-section">
                  <div className="drawer-label">From</div>
                  <div className="drawer-val">
                    <strong>{activeContact.name}</strong>
                  </div>
                  <div className="drawer-val">
                    <a href={`mailto:${activeContact.email}`}>
                      {activeContact.email}
                    </a>
                  </div>
                </div>
                <div className="drawer-section">
                  <div className="drawer-label">Subject</div>
                  <div className="drawer-val">{activeContact.subject}</div>
                </div>
                <div className="drawer-section">
                  <div className="drawer-label">Message</div>
                  <div className="drawer-message">{activeContact.message}</div>
                </div>
                <div className="drawer-section">
                  <div className="drawer-label">Received</div>
                  <div className="drawer-val">
                    {new Date(activeContact.createdAt).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="drawer-section">
                  <div className="drawer-label">Status</div>
                  <div className="drawer-status-row">
                    {["new", "read", "replied", "archived"].map((s) => (
                      <button
                        key={s}
                        className={`ds-btn${drawerStatus === s ? " active" : ""}`}
                        onClick={() => setDrawerStatus(s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="drawer-section">
                  <div className="drawer-label">Private Notes</div>
                  <textarea
                    className="drawer-notes"
                    placeholder="Add private notes about this inquiry..."
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button
                  className="df-btn df-btn-primary"
                  onClick={saveDrawer}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="df-btn df-btn-danger"
                  onClick={() => deleteContact(activeContact._id)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
