// ============================================================
// STATUS : 🆕 BARU
// PATH   : app/dashboard/page.tsx
// ISI    : Halaman beranda dashboard
//          - Welcome banner (greeting pagi/siang/malam)
//          - 4 stat card: total user, total login, success rate, gagal
//          - Tabel histori login terkini (15 baris)
//          - Polling real-time setiap 15 detik + animasi pulse saat update
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string; name: string; email: string; role: string;
}
interface LoginEntry {
  id: string; userId: string; email: string; name: string;
  status: "success" | "failed"; ip: string; userAgent: string;
  timestamp: string; reason?: string;
}
interface StatsData {
  totalUsers: number;
  totalLogins: number;
  failedLogins: number;
  successRate: number;
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [pulse, setPulse] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [meRes, histRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/history"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (histRes.ok) {
        const d = await histRes.json();
        const h: LoginEntry[] = d.history ?? [];
        setHistory(h);
        const total = h.length;
        const failed = h.filter((e) => e.status === "failed").length;
        const success = total - failed;
        setStats({
          totalUsers: d.totalUsers ?? 1,
          totalLogins: total,
          failedLogins: failed,
          successRate: total > 0 ? Math.round((success / total) * 100) : 100,
        });
        // Pulse animation on update
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000); // real-time every 15s
    return () => clearInterval(interval);
  }, [fetchAll]);

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return `${m} mnt lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  }

  function getBrowser(ua: string) {
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return "Browser";
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  return (
    <>
      <style>{`
        :root {
          --cream: #FDF6EE; --cream-dark: #F5EAD8; --blush: #F2C4C4;
          --blush-light: #FAE8E8; --sage: #C8DDD1; --lavender: #DDD2EE;
          --warm-brown: #8B6B52; --text-dark: #3D2B1F; --text-mid: #7A5C48;
          --text-light: #B89A86; --white: #FFFFFF;
        }
        .page { display: flex; flex-direction: column; gap: 24px; }

        /* Welcome banner */
        .welcome-banner {
          background: linear-gradient(135deg, var(--warm-brown) 0%, #A0785A 50%, #C49A7A 100%);
          border-radius: 20px; padding: 28px 32px;
          color: white; position: relative; overflow: hidden;
        }
        .welcome-banner::before {
          content: '🎓';
          position: absolute; right: 28px; top: 50%;
          transform: translateY(-50%);
          font-size: 72px; opacity: 0.15;
        }
        .welcome-banner h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 600; margin-bottom: 6px;
        }
        .welcome-banner p { font-size: 13.5px; opacity: 0.85; }
        .role-badge {
          display: inline-block; margin-top: 12px;
          background: rgba(255,255,255,0.2); padding: 4px 12px;
          border-radius: 20px; font-size: 12px; font-weight: 500;
          backdrop-filter: blur(4px);
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .stat-card {
          background: var(--white); border-radius: 16px;
          padding: 20px; border: 1px solid var(--cream-dark);
          transition: transform .2s, box-shadow .2s;
          position: relative; overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139,107,82,0.12);
        }
        .stat-card::before {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 3px;
        }
        .stat-card.brown::before { background: linear-gradient(90deg, var(--warm-brown), #C49A7A); }
        .stat-card.blush::before { background: linear-gradient(90deg, var(--blush), #F9A8A8); }
        .stat-card.sage::before { background: linear-gradient(90deg, var(--sage), #A8CCBA); }
        .stat-card.lavender::before { background: linear-gradient(90deg, var(--lavender), #C4B4E4); }
        .stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 12px;
        }
        .stat-icon.brown { background: var(--cream-dark); }
        .stat-icon.blush { background: var(--blush-light); }
        .stat-icon.sage { background: #EAF4EF; }
        .stat-icon.lavender { background: #F0ECFB; }
        .stat-value {
          font-size: 28px; font-weight: 700; color: var(--text-dark);
          font-family: 'Playfair Display', serif;
          transition: all .3s;
        }
        .stat-value.pulse { animation: statPulse .4s ease; }
        @keyframes statPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .stat-label {
          font-size: 12px; color: var(--text-light);
          margin-top: 4px; text-transform: uppercase;
          letter-spacing: 0.4px; font-weight: 500;
        }

        /* History panel */
        .panel {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--cream-dark); overflow: hidden;
        }
        .panel-header {
          padding: 18px 22px; border-bottom: 1px solid var(--cream-dark);
          display: flex; align-items: center; justify-content: space-between;
        }
        .panel-header h3 {
          font-family: 'Playfair Display', serif;
          font-size: 16px; color: var(--text-dark); font-weight: 600;
        }
        .live-indicator {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; color: var(--text-light); font-weight: 500;
        }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #2ECC71; animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* History table */
        .history-table { width: 100%; border-collapse: collapse; }
        .history-table th {
          text-align: left; padding: 10px 22px;
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.5px; color: var(--text-light);
          background: var(--cream); font-weight: 600;
          border-bottom: 1px solid var(--cream-dark);
        }
        .history-table td {
          padding: 13px 22px; border-bottom: 1px solid var(--cream-dark);
          font-size: 13.5px; color: var(--text-mid);
          vertical-align: middle;
        }
        .history-table tr:last-child td { border-bottom: none; }
        .history-table tr { transition: background .15s; }
        .history-table tr:hover td { background: var(--cream); }
        .history-table tr.new-row td {
          animation: rowSlide .4s ease;
        }
        @keyframes rowSlide {
          from { background: #EDFBF2; }
          to { background: transparent; }
        }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600;
        }
        .status-badge.success {
          background: #EDFBF2; color: #27AE60;
        }
        .status-badge.failed {
          background: #FFF0F0; color: #E74C3C;
        }
        .email-cell { font-weight: 500; color: var(--text-dark); }
        .ip-cell {
          font-family: monospace; font-size: 12px;
          background: var(--cream); padding: 2px 7px;
          border-radius: 5px; display: inline-block;
        }
        .time-cell { color: var(--text-light); font-size: 12.5px; }

        .loading-state {
          text-align: center; padding: 48px;
          color: var(--text-light); font-size: 13px;
        }
        .loading-state .spinner {
          width: 28px; height: 28px; border: 3px solid var(--cream-dark);
          border-top-color: var(--warm-brown); border-radius: 50%;
          animation: spin 0.8s linear infinite; margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state {
          text-align: center; padding: 48px;
          color: var(--text-light);
        }
        .empty-state .empty-icon { font-size: 32px; margin-bottom: 10px; }
        .empty-state p { font-size: 13px; }

        .updated-label {
          font-size: 11px; color: var(--text-light);
          text-align: right; padding: 10px 22px;
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .history-table th:nth-child(3),
          .history-table td:nth-child(3),
          .history-table th:nth-child(4),
          .history-table td:nth-child(4) { display: none; }
        }
      `}</style>

      <div className="page">
        {/* Welcome */}
        <div className="welcome-banner">
          <h2>{greeting}, {currentUser?.name ?? "—"} 👋</h2>
          <p>Pantau aktivitas sistem SPMB secara real-time dari sini.</p>
          <span className="role-badge">
            {currentUser?.role === "admin" ? "🛡️ Administrator" : "👤 Pengguna"}
          </span>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card brown">
              <div className="stat-icon brown">👥</div>
              <div className={`stat-value${pulse ? " pulse" : ""}`}>{stats.totalUsers}</div>
              <div className="stat-label">Total Pendaftar</div>
            </div>
            <div className="stat-card blush">
              <div className="stat-icon blush">🔐</div>
              <div className={`stat-value${pulse ? " pulse" : ""}`}>{stats.totalLogins}</div>
              <div className="stat-label">Total Lunas</div>
            </div>
            <div className="stat-card sage">
              <div className="stat-icon sage">✅</div>
              <div className={`stat-value${pulse ? " pulse" : ""}`}>{stats.successRate}%</div>
              <div className="stat-label">Tingkat Kelolosan</div>
            </div>
            <div className="stat-card lavender">
              <div className="stat-icon lavender">⚠️</div>
              <div className={`stat-value${pulse ? " pulse" : ""}`}>{stats.failedLogins}</div>
              <div className="stat-label">Telat Membayar/Tidak lulus</div>
            </div>
          </div>
        )}

        {/* Real-time history */}
        <div className="panel">
          <div className="panel-header">
            <h3>Histori Login Terkini</h3>
            <div className="live-indicator">
              <div className="live-dot"/>
              Live · diperbarui {lastUpdated.toLocaleTimeString("id-ID")}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"/>
              Memuat data...
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Belum ada histori login.</p>
            </div>
          ) : (
            <>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Browser</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 15).map((entry, idx) => (
                    <tr key={entry.id} className={idx === 0 && pulse ? "new-row" : ""}>
                      <td>
                        <div className="email-cell">{entry.name !== "-" ? entry.name : entry.email}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-light)", marginTop: "2px" }}>
                          {entry.email}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${entry.status}`}>
                          {entry.status === "success" ? "✓ Berhasil" : "✗ Gagal"}
                        </span>
                        {entry.reason && (
                          <div style={{ fontSize: "11px", color: "#E74C3C", marginTop: "3px" }}>
                            {entry.reason}
                          </div>
                        )}
                      </td>
                      <td><span className="ip-cell">{entry.ip}</span></td>
                      <td>{getBrowser(entry.userAgent)}</td>
                      <td className="time-cell">{timeAgo(entry.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="updated-label">
                Memperbarui otomatis setiap 15 detik
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}