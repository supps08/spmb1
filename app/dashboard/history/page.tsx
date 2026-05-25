// ============================================================
// STATUS : 🆕 BARU
// PATH   : app/dashboard/history/page.tsx
// ISI    : Halaman histori login lengkap (khusus admin)
//          - Filter tab: Semua / Berhasil / Gagal
//          - Live indicator + polling otomatis 15 detik
//          - Tabel: nama, email, status, IP, browser, waktu
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";

interface LoginEntry {
  id: string; userId: string; email: string; name: string;
  status: "success" | "failed"; ip: string; userAgent: string;
  timestamp: string; reason?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/admin/history");
    if (res.ok) {
      const d = await res.json();
      setHistory(d.history ?? []);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const filtered = history.filter((e) => filter === "all" || e.status === filter);

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return `${m} mnt lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  }
  function formatTime(ts: string) {
    return new Date(ts).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  function getBrowser(ua: string) {
    if (ua.includes("Firefox")) return "🦊 Firefox";
    if (ua.includes("Edg")) return "🌐 Edge";
    if (ua.includes("Chrome")) return "🔵 Chrome";
    if (ua.includes("Safari")) return "🍎 Safari";
    return "🌍 Browser";
  }

  return (
    <>
      <style>{`
        :root {
          --cream: #FDF6EE; --cream-dark: #F5EAD8; --blush: #F2C4C4;
          --blush-light: #FAE8E8; --sage: #C8DDD1; --lavender: #DDD2EE;
          --warm-brown: #8B6B52; --text-dark: #3D2B1F; --text-mid: #7A5C48;
          --text-light: #B89A86; --white: #FFFFFF;
        }
        .page { display: flex; flex-direction: column; gap: 20px; }
        .page-header {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .page-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: var(--text-dark); font-weight: 600;
        }
        .live-indicator {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; color: var(--text-light);
        }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #2ECC71; animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        .filter-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .filter-tab {
          padding: 7px 16px; border-radius: 20px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          border: 1.5px solid var(--cream-dark);
          background: var(--white); color: var(--text-mid);
          font-family: 'DM Sans', sans-serif;
          transition: all .15s;
        }
        .filter-tab.active.all { background: var(--warm-brown); color: white; border-color: var(--warm-brown); }
        .filter-tab.active.success { background: #27AE60; color: white; border-color: #27AE60; }
        .filter-tab.active.failed { background: #E74C3C; color: white; border-color: #E74C3C; }
        .filter-tab:not(.active):hover { background: var(--cream); }

        .panel {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--cream-dark); overflow: hidden;
        }
        .panel-info {
          padding: 12px 22px; background: var(--cream);
          border-bottom: 1px solid var(--cream-dark);
          font-size: 12px; color: var(--text-light);
          display: flex; justify-content: space-between;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: left; padding: 11px 22px;
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.5px; color: var(--text-light);
          background: var(--cream); font-weight: 600;
          border-bottom: 1px solid var(--cream-dark);
        }
        td {
          padding: 14px 22px; border-bottom: 1px solid var(--cream-dark);
          font-size: 13.5px; color: var(--text-mid);
          vertical-align: middle;
        }
        tr:last-child td { border-bottom: none; }
        tr { transition: background .15s; }
        tr:hover td { background: var(--cream); }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600;
        }
        .status-badge.success { background: #EDFBF2; color: #27AE60; }
        .status-badge.failed { background: #FFF0F0; color: #E74C3C; }
        .email-cell { font-weight: 500; color: var(--text-dark); }
        .ip-cell {
          font-family: monospace; font-size: 12px;
          background: var(--cream); padding: 2px 7px; border-radius: 5px;
        }
        .reason-tag {
          font-size: 11px; color: #E74C3C;
          background: #FFF0F0; padding: 2px 6px;
          border-radius: 4px; margin-top: 3px; display: inline-block;
        }
        .loading-state { text-align: center; padding: 48px; color: var(--text-light); }
        .spinner {
          width: 28px; height: 28px; border: 3px solid var(--cream-dark);
          border-top-color: var(--warm-brown); border-radius: 50%;
          animation: spin 0.8s linear infinite; margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty { text-align: center; padding: 48px; color: var(--text-light); font-size: 13px; }

        @media (max-width: 640px) {
          th:nth-child(4), td:nth-child(4),
          th:nth-child(5), td:nth-child(5) { display: none; }
        }
      `}</style>

      <div className="page">
        <div className="page-header">
          <div>
            <h2>Histori Login</h2>
            <div className="live-indicator" style={{ marginTop: "4px" }}>
              <div className="live-dot"/>
              Live · {lastUpdated.toLocaleTimeString("id-ID")}
            </div>
          </div>
          <div className="filter-tabs">
            {(["all", "success", "failed"] as const).map((f) => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ` active ${f}` : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "🔍 Semua" : f === "success" ? "✓ Berhasil" : "✗ Gagal"}
                {" "}
                <span style={{ opacity: 0.75 }}>
                  ({f === "all" ? history.length : history.filter((e) => e.status === f).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-info">
            <span>Menampilkan {filtered.length} dari {history.length} entri (maks 50 terbaru)</span>
            <span>Refresh otomatis 15 detik</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"/>
              Memuat histori...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">Tidak ada data untuk filter ini.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Status</th>
                  <th>IP</th>
                  <th>Browser</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="email-cell">{entry.name !== "-" ? entry.name : "—"}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-light)", marginTop: "2px" }}>
                        {entry.email}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${entry.status}`}>
                        {entry.status === "success" ? "✓ Berhasil" : "✗ Gagal"}
                      </span>
                      {entry.reason && <div className="reason-tag">{entry.reason}</div>}
                    </td>
                    <td><span className="ip-cell">{entry.ip}</span></td>
                    <td>{getBrowser(entry.userAgent)}</td>
                    <td>
                      <div style={{ fontSize: "12.5px" }}>{timeAgo(entry.timestamp)}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "2px" }}>
                        {formatTime(entry.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}