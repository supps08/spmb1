// ============================================================
// STATUS : 🆕 BARU
// PATH   : app/dashboard/page.tsx
// ISI    : Halaman beranda dashboard
//          - Welcome banner
//          - 4 stat card: total pendaftar, pendaftar hari ini, success rate, berkas kurang lengkap
//          - Tabel pendaftar baru terkini (15 baris)
//          - Polling real-time setiap 15 detik + animasi pulse saat update
// ============================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  LogIn,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { avatarColor } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PendaftarEntry {
  id: string;
  nama_lengkap: string;
  nisn: string;
  status: string;
  submitted_at: string;
  jurusan: { kode: string; nama: string } | { kode: string; nama: string }[] | null;
}

interface StatsData {
  totalPendaftar: number;
  pendaftarHariIni: number;
  berkasKurang: number;
  successRate: number;
}

export default function DashboardPage() {
  useScrollAnimation();

  const supabase = useMemo(() => createClient(), []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendaftar, setPendaftar] = useState<PendaftarEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [lastUpdatedStr, setLastUpdatedStr] = useState("");
  const [pulse, setPulse] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }

      const { data: siswaData } = await supabase
        .from("siswa")
        .select("id, nama_lengkap, nisn, status, submitted_at, jurusan(kode, nama)")
        .neq("status", "draft")
        .order("submitted_at", { ascending: false })
        .limit(50);

      const list: PendaftarEntry[] = (siswaData ?? []) as PendaftarEntry[];
      setPendaftar(list);

      const todayStr = new Date().toISOString().split("T")[0];
      const totalPendaftar = list.length;
      const pendaftarHariIni = list.filter(
        (s) => s.submitted_at?.startsWith(todayStr)
      ).length;
      const berkasKurang = list.filter((s) => s.status === "menunggu").length;
      const diterima = list.filter((s) => s.status === "diterima").length;
      const successRate =
        totalPendaftar > 0 ? Math.round((diterima / totalPendaftar) * 100) : 0;

      setStats({ totalPendaftar, pendaftarHariIni, berkasKurang, successRate });
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    setLastUpdatedStr(lastUpdated.toLocaleTimeString("id-ID"));
  }, [lastUpdated]);

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return `${m} mnt lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  }

  const roleLabel =
    currentUser?.role === "admin" ? "ADMINISTRATOR" : "PENGGUNA";

  const displayStats = stats ?? {
    totalPendaftar: 0,
    pendaftarHariIni: 0,
    berkasKurang: 0,
    successRate: 0,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Hero */
        .hero-banner {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          padding: 28px 32px;
          background: linear-gradient(135deg, #1C5C38 0%, #2A7A4E 100%);
          color: #fff;
          animation: fadeUp 0.6s ease;
        }

        .hero-deco {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.15);
          padding: 5px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
        }

        .hero-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.35rem, 3vw, 1.75rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .hero-subtitle {
          font-size: 14px;
          opacity: 0.88;
          max-width: 480px;
          line-height: 1.5;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
          border-bottom: 2px solid var(--stat-accent, #1C5C38);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(28, 92, 56, 0.1);
        }

        .stat-card.danger {
          --stat-accent: #DC2626;
        }

        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          background: #EBF4EE;
          color: #1C5C38;
        }

        .stat-card.danger .stat-icon-wrap {
          background: #FEE2E2;
          color: #DC2626;
        }

        .stat-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #0C0C0C;
          line-height: 1;
          transition: transform 0.3s;
        }

        .stat-card.danger .stat-value {
          color: #DC2626;
        }

        .stat-value.pulse {
          animation: statPulse 0.4s ease;
        }

        @keyframes statPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #6B7280;
          margin-top: 6px;
        }

        /* History panel */
        .panel {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }

        .panel-header {
          padding: 18px 22px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .panel-header h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #6B7280;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse-dot 2s infinite;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th {
          text-align: left;
          padding: 12px 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6B7280;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
        }

        .history-table td {
          padding: 14px 20px;
          border-bottom: 1px solid #E5E7EB;
          font-size: 13px;
          color: #374151;
          vertical-align: middle;
        }

        .history-table tr:last-child td {
          border-bottom: none;
        }

        .history-table tbody tr {
          transition: background 0.15s;
        }

        .history-table tbody tr:hover td {
          background: #F9FAFB;
        }

        .history-table tbody tr.new-row td {
          animation: rowHighlight 0.4s ease;
        }

        @keyframes rowHighlight {
          from { background: #EBF4EE; }
          to { background: transparent; }
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .row-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-name {
          font-weight: 600;
          color: #0C0C0C;
          font-size: 13px;
        }

        .user-email {
          font-size: 11px;
          color: #6B7280;
          margin-top: 2px;
        }

        .ip-cell {
          font-family: ui-monospace, monospace;
          font-size: 12px;
          color: #374151;
        }

        .time-cell {
          font-size: 12px;
          color: #6B7280;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .status-badge.success {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-badge.failed {
          background: #FEE2E2;
          color: #991B1B;
        }

        .aksi-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          background: #fff;
          color: #6B7280;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }

        .aksi-btn:hover {
          background: #F2F8F4;
          color: #1C5C38;
          border-color: #EBF4EE;
        }

        .fail-reason {
          font-size: 11px;
          color: #DC2626;
          margin-top: 4px;
        }

        .loading-state {
          text-align: center;
          padding: 48px;
          color: #6B7280;
          font-size: 13px;
        }

        .loading-state .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #E5E7EB;
          border-top-color: #1C5C38;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #6B7280;
          font-size: 13px;
        }

        .updated-label {
          font-size: 11px;
          color: #6B7280;
          text-align: right;
          padding: 10px 20px;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .history-table th:nth-child(3),
          .history-table td:nth-child(3),
          .history-table th:nth-child(4),
          .history-table td:nth-child(4) {
            display: none;
          }
        }
      `}</style>

      <div className="page">
        <section className="hero-banner" data-animate data-delay="0">
          <div className="hero-deco" aria-hidden="true" />
          <div className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            {roleLabel}
          </div>
          <h1 className="hero-title">
            Selamat Datang Kembali, {currentUser?.name ?? "—"}!
          </h1>
          <p className="hero-subtitle">
            Pantau aktivitas sistem SPMB secara real-time dari sini.
          </p>
        </section>

        <div className="stats-grid" data-animate data-delay="50">
          <div className="stat-card" data-animate data-delay="0">
            <div className="stat-icon-wrap">
              <Users size={20} strokeWidth={2} />
            </div>
            <div className={`stat-value${pulse ? " pulse" : ""}`}>
              {displayStats.totalPendaftar}
            </div>
            <div className="stat-label">Total Pendaftar</div>
          </div>

          <div className="stat-card" data-animate data-delay="100">
            <div className="stat-icon-wrap">
              <LogIn size={20} strokeWidth={2} />
            </div>
            <div className={`stat-value${pulse ? " pulse" : ""}`}>
              {displayStats.pendaftarHariIni}
            </div>
            <div className="stat-label">Pendaftar Hari Ini</div>
          </div>

          <div className="stat-card" data-animate data-delay="200">
            <div className="stat-icon-wrap">
              <CheckCircle size={20} strokeWidth={2} />
            </div>
            <div className={`stat-value${pulse ? " pulse" : ""}`}>
              {displayStats.successRate}%
            </div>
            <div className="stat-label">Keberhasilan</div>
          </div>

          <div className="stat-card danger" data-animate data-delay="300">
            <div className="stat-icon-wrap">
              <XCircle size={20} strokeWidth={2} />
            </div>
            <div className={`stat-value${pulse ? " pulse" : ""}`}>
              {displayStats.berkasKurang}
            </div>
            <div className="stat-label">Berkas Kurang Lengkap</div>
          </div>
        </div>

        <section className="panel" data-animate data-delay="100">
          <div className="panel-header">
            <h3>Pendaftar Baru</h3>
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              LIVE · {lastUpdatedStr}
            </span>
          </div>

          {loading ? (
            <div className="loading-state" data-animate data-delay="0">
              <div className="spinner" />
              Memuat data...
            </div>
          ) : pendaftar.length === 0 ? (
            <div className="empty-state" data-animate data-delay="0">
              Belum ada pendaftar.
            </div>
          ) : (
            <>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Pendaftar</th>
                    <th>NISN</th>
                    <th>Jurusan</th>
                    <th>Waktu Daftar</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendaftar.slice(0, 15).map((entry, idx) => {
                    const name = entry.nama_lengkap || "—";
                    const colors = avatarColor(name);
                    const initial = name.charAt(0).toUpperCase();
                    const jurusan = Array.isArray(entry.jurusan)
                      ? entry.jurusan[0]
                      : entry.jurusan;
                    const statusMap: Record<string, { label: string; cls: string }> = {
                      submitted: { label: "Dikirim", cls: "success" },
                      menunggu:  { label: "Menunggu", cls: "failed" },
                      diterima:  { label: "Diterima", cls: "success" },
                      ditolak:   { label: "Ditolak",  cls: "failed" },
                    };
                    const st = statusMap[entry.status] ?? { label: entry.status, cls: "success" };
                    return (
                      <tr
                        key={entry.id}
                        className={idx === 0 && pulse ? "new-row" : ""}
                        data-animate
                        data-delay={String(150 + idx * 50)}
                      >
                        <td>
                          <div className="user-cell">
                            <div
                              className="row-avatar"
                              style={{ background: colors.bg, color: colors.color }}
                            >
                              {initial}
                            </div>
                            <div>
                              <div className="user-name">{name}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="ip-cell">{entry.nisn || "—"}</span></td>
                        <td>{jurusan ? `${jurusan.kode} — ${jurusan.nama}` : "—"}</td>
                        <td className="time-cell">
                          {entry.submitted_at ? timeAgo(entry.submitted_at) : "—"}
                        </td>
                        <td>
                          <span className={`status-badge ${st.cls}`}>
                            {st.label.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="aksi-btn"
                            aria-label={`Detail pendaftar ${name}`}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="updated-label">
                Memperbarui otomatis setiap 15 detik
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}