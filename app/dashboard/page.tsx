"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User { id: string; name: string; email: string; role: string; }
interface LogEntry {
  id: string;
  name: string;
  email: string;
  status: "success" | "failed";
  ip: string;
  timestamp: string;
  reason?: string;
}

const MENU = [
  { key: "dashboard", icon: "🏠", label: "Dashboard" },
  { key: "berkas",    icon: "📂", label: "Berkas" },
  { key: "ujian",     icon: "📝", label: "Ujian" },
  { key: "pengumuman",icon: "📣", label: "Pengumuman" },
  { key: "riwayat",   icon: "🕐", label: "Riwayat Login" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState("dashboard");
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [sideOpen, setSideOpen] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => {
      if (!r.ok) { router.push("/login"); return; }
      return r.json();
    }).then(d => d && setUser(d.user));
  }, [router]);

  useEffect(() => {
    if (active === "riwayat") {
      fetch("/api/auth/history").then(r => r.json()).then(d => setHistory(d.history || []));
    }
  }, [active]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!user) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#FDF6EE", fontFamily:"DM Sans, sans-serif", color:"#8B6B52" }}>
      Memuat...
    </div>
  );

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Selamat Pagi" : now.getHours() < 17 ? "Selamat Siang" : "Selamat Malam";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --cream:       #FDF6EE;
          --cream-dark:  #F5EAD8;
          --blush:       #F2C4C4;
          --blush-light: #FAE8E8;
          --sage:        #C8DDD1;
          --lavender:    #DDD2EE;
          --peach:       #F9D8C0;
          --warm-brown:  #8B6B52;
          --text-dark:   #3D2B1F;
          --text-mid:    #7A5C48;
          --text-light:  #B89A86;
          --white:       #FFFFFF;
          --shadow:      rgba(139,107,82,0.12);
        }
        body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--text-dark); }

        /* ── Layout ── */
        .layout { display:flex; height:100vh; overflow:hidden; }

        /* ── Sidebar ── */
        .sidebar {
          width: ${sideOpen ? "240px" : "72px"};
          background: var(--white);
          border-right: 1px solid var(--cream-dark);
          display:flex; flex-direction:column;
          transition: width .3s cubic-bezier(.22,1,.36,1);
          overflow:hidden;
          flex-shrink:0;
          box-shadow: 2px 0 16px var(--shadow);
          position:relative; z-index:10;
        }

        .sidebar-header {
          padding: 24px 18px 16px;
          border-bottom: 1px solid var(--cream-dark);
          display:flex; align-items:center; gap:12px;
          white-space:nowrap;
        }
        .sidebar-logo {
          width:36px; height:36px; flex-shrink:0;
          background:linear-gradient(135deg, var(--blush-light), var(--cream-dark));
          border-radius:10px; display:flex; align-items:center; justify-content:center;
          font-size:18px; border:1px solid var(--blush);
        }
        .sidebar-title {
          font-family:'Playfair Display',serif;
          font-size:15px; font-weight:600;
          color:var(--text-dark);
        }

        nav { flex:1; padding:16px 10px; display:flex; flex-direction:column; gap:4px; }
        .nav-item {
          display:flex; align-items:center; gap:12px;
          padding:11px 12px; border-radius:12px;
          cursor:pointer; white-space:nowrap;
          transition: background .15s, color .15s;
          color:var(--text-mid); font-size:14px; font-weight:400;
          border:none; background:transparent; width:100%; text-align:left;
        }
        .nav-item:hover { background:var(--cream); color:var(--text-dark); }
        .nav-item.active {
          background:linear-gradient(135deg, var(--blush-light), var(--lavender));
          color:var(--warm-brown); font-weight:500;
        }
        .nav-icon { font-size:18px; flex-shrink:0; }

        .sidebar-footer {
          padding:14px 10px;
          border-top:1px solid var(--cream-dark);
          white-space:nowrap;
        }
        .user-card {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:12px;
          background:var(--cream);
        }
        .user-avatar {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg, var(--blush), var(--lavender));
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:600; color:var(--warm-brown);
        }
        .user-info { overflow:hidden; }
        .user-name { font-size:13px; font-weight:500; color:var(--text-dark); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .user-role { font-size:11px; color:var(--text-light); }

        /* ── Main ── */
        .main { flex:1; overflow-y:auto; display:flex; flex-direction:column; }

        /* ── Topbar ── */
        .topbar {
          position:sticky; top:0; z-index:5;
          background:rgba(253,246,238,0.9);
          backdrop-filter:blur(12px);
          border-bottom:1px solid var(--cream-dark);
          padding:0 28px;
          height:64px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .topbar-left { display:flex; align-items:center; gap:14px; }
        .toggle-btn {
          background:none; border:none; cursor:pointer;
          padding:8px; border-radius:8px; color:var(--text-mid);
          font-size:20px; transition:background .15s;
          display:flex; align-items:center;
        }
        .toggle-btn:hover { background:var(--cream-dark); }
        .page-title { font-family:'Playfair Display',serif; font-size:18px; color:var(--text-dark); }

        .topbar-right { display:flex; align-items:center; gap:12px; }
        .badge {
          background:var(--blush-light);
          color:var(--warm-brown);
          padding:4px 12px; border-radius:20px;
          font-size:12px; font-weight:500;
          border:1px solid var(--blush);
        }
        .logout-btn {
          background:none; border:1.5px solid var(--cream-dark);
          border-radius:10px; padding:7px 14px;
          font-family:'DM Sans',sans-serif; font-size:13px;
          color:var(--text-mid); cursor:pointer;
          transition:all .15s;
        }
        .logout-btn:hover { border-color:var(--blush); color:var(--warm-brown); background:var(--blush-light); }

        /* ── Content ── */
        .content { padding:28px; flex:1; }

        /* ── Greeting ── */
        .greeting { margin-bottom:28px; }
        .greeting h2 { font-family:'Playfair Display',serif; font-size:26px; color:var(--text-dark); margin-bottom:4px; }
        .greeting p { font-size:14px; color:var(--text-light); }

        /* ── Stats Grid ── */
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:28px; }
        .stat-card {
          background:var(--white);
          border-radius:18px;
          padding:22px 20px;
          box-shadow:0 2px 12px var(--shadow);
          border:1px solid var(--cream-dark);
          display:flex; flex-direction:column; gap:12px;
          transition:transform .2s, box-shadow .2s;
        }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 24px var(--shadow); }
        .stat-icon { font-size:28px; }
        .stat-num { font-family:'Playfair Display',serif; font-size:32px; color:var(--text-dark); line-height:1; }
        .stat-label { font-size:12.5px; color:var(--text-light); font-weight:500; }
        .stat-card:nth-child(1) .stat-icon { background:var(--blush-light); width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center; }
        .stat-card:nth-child(2) .stat-icon { background:var(--sage); width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center; }
        .stat-card:nth-child(3) .stat-icon { background:var(--lavender); width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center; }
        .stat-card:nth-child(4) .stat-icon { background:var(--peach); width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center; }

        /* ── Panel ── */
        .panel {
          background:var(--white);
          border-radius:18px;
          border:1px solid var(--cream-dark);
          box-shadow:0 2px 12px var(--shadow);
          overflow:hidden;
        }
        .panel-header {
          padding:18px 22px;
          border-bottom:1px solid var(--cream-dark);
          display:flex; align-items:center; justify-content:space-between;
        }
        .panel-title { font-size:14px; font-weight:600; color:var(--text-dark); }

        /* ── Table ── */
        table { width:100%; border-collapse:collapse; }
        th { padding:12px 20px; font-size:11.5px; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-light); font-weight:500; text-align:left; background:var(--cream); }
        td { padding:13px 20px; font-size:13.5px; color:var(--text-mid); border-top:1px solid var(--cream-dark); }
        tr:hover td { background:rgba(253,246,238,0.6); }

        .status-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 10px; border-radius:20px;
          font-size:11.5px; font-weight:500;
        }
        .status-success { background:#E8F5E9; color:#2E7D32; }
        .status-failed  { background:#FFEBEE; color:#C62828; }

        /* ── Empty state ── */
        .empty { text-align:center; padding:48px 20px; color:var(--text-light); font-size:14px; }
        .empty span { font-size:36px; display:block; margin-bottom:12px; }

        /* ── Coming Soon ── */
        .coming-soon {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          height:300px; gap:12px; color:var(--text-light);
        }
        .coming-soon span { font-size:48px; }
        .coming-soon h3 { font-family:'Playfair Display',serif; font-size:20px; color:var(--text-mid); }
        .coming-soon p { font-size:13px; }

        /* ── Flowchart placeholder ── */
        .flow-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:0; }

        @media(max-width:640px) {
          .stats-grid { grid-template-columns:1fr 1fr; }
          .flow-grid  { grid-template-columns:1fr; }
          .topbar { padding:0 16px; }
          .content { padding:16px; }
        }
      `}</style>

      <div className="layout">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">🎓</div>
            {sideOpen && <span className="sidebar-title">SPMB System</span>}
          </div>
          <nav>
            {MENU.map(m => (
              <button key={m.key} className={`nav-item ${active === m.key ? "active" : ""}`} onClick={() => setActive(m.key)}>
                <span className="nav-icon">{m.icon}</span>
                {sideOpen && m.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{user.name[0]}</div>
              {sideOpen && (
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button className="toggle-btn" onClick={() => setSideOpen(!sideOpen)}>☰</button>
              <span className="page-title">{MENU.find(m => m.key === active)?.label}</span>
            </div>
            <div className="topbar-right">
              <span className="badge">🟢 Online</span>
              <button className="logout-btn" onClick={handleLogout}>Keluar →</button>
            </div>
          </header>

          {/* Content */}
          <div className="content">

            {/* ── DASHBOARD ── */}
            {active === "dashboard" && (
              <>
                <div className="greeting">
                  <h2>{greeting}, {user.name.split(" ")[0]}! 👋</h2>
                  <p>Selamat datang kembali di SPMB Dashboard. Berikut ringkasan hari ini.</p>
                </div>

                <div className="stats-grid">
                  {[
                    { icon:"👥", num:"1,284", label:"Total Pendaftar" },
                    { icon:"✅", num:"896",   label:"Berkas Lengkap" },
                    { icon:"📝", num:"432",   label:"Peserta Ujian" },
                    { icon:"🏆", num:"128",   label:"Diterima" },
                  ].map((s,i) => (
                    <div className="stat-card" key={i}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-num">{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">📋 Aktivitas Terakhir</span>
                    <span style={{fontSize:"12px",color:"var(--text-light)"}}>Hari ini</span>
                  </div>
                  <table>
                    <thead>
                      <tr><th>Waktu</th><th>Aktivitas</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {[
                        ["09:12","Pendaftar baru masuk","✅ Sukses"],
                        ["09:05","Berkas Andi Pratama diverifikasi","✅ Sukses"],
                        ["08:47","Pengumuman ujian diterbitkan","✅ Sukses"],
                        ["08:30","Backup database otomatis","✅ Sukses"],
                      ].map(([t,a,s],i) => (
                        <tr key={i}>
                          <td style={{color:"var(--text-light)",fontSize:"12.5px"}}>{t}</td>
                          <td>{a}</td>
                          <td>{s}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── RIWAYAT LOGIN ── */}
            {active === "riwayat" && (
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">🕐 Riwayat Login (20 Terbaru)</span>
                </div>
                {history.length === 0 ? (
                  <div className="empty"><span>📭</span>Belum ada riwayat login.</div>
                ) : (
                  <div style={{overflowX:"auto"}}>
                    <table>
                      <thead>
                        <tr><th>Waktu</th><th>Nama</th><th>Email</th><th>Status</th><th>IP</th></tr>
                      </thead>
                      <tbody>
                        {history.map(h => (
                          <tr key={h.id}>
                            <td style={{fontSize:"12px",color:"var(--text-light)"}}>
                              {new Date(h.timestamp).toLocaleString("id-ID")}
                            </td>
                            <td>{h.name === "-" ? <span style={{color:"var(--text-light)"}}>—</span> : h.name}</td>
                            <td style={{fontSize:"12.5px"}}>{h.email}</td>
                            <td>
                              <span className={`status-badge ${h.status === "success" ? "status-success" : "status-failed"}`}>
                                {h.status === "success" ? "✓ Berhasil" : `✗ Gagal${h.reason ? ` · ${h.reason}` : ""}`}
                              </span>
                            </td>
                            <td style={{fontFamily:"monospace",fontSize:"12px"}}>{h.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Coming Soon pages ── */}
            {["berkas","ujian","pengumuman"].includes(active) && (
              <div className="coming-soon">
                <span>{MENU.find(m=>m.key===active)?.icon}</span>
                <h3>Menu {MENU.find(m=>m.key===active)?.label}</h3>
                <p>Fitur ini sedang dalam pengembangan 🚧</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}