
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { avatarColor } from "@/lib/avatar";

interface LoginEntry {
  id: string;
  userId: string;
  email: string;
  name: string;
  status: "success" | "failed";
  ip: string;
  userAgent: string;
  timestamp: string;
  reason?: string;
}

type StatusFilter = "all" | "success" | "failed";

const PAGE_SIZE = 20;
const SKELETON_ROWS = 8;

function displayName(entry: LoginEntry) {
  return entry.name !== "-" ? entry.name : entry.email;
}

function getBrowser(ua: string) {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Browser";
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function toDateOnly(ts: string) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  useScrollAnimation();

  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [lastUpdatedStr, setLastUpdatedStr] = useState("");

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

  useEffect(() => {
    setLastUpdatedStr(lastUpdated.toLocaleTimeString("id-ID"));
  }, [lastUpdated]);

  useEffect(() => {
    setPage(1);
  }, [filter, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    let list = history;
    if (filter !== "all") {
      list = list.filter((e) => e.status === filter);
    }
    if (dateFrom) {
      list = list.filter((e) => toDateOnly(e.timestamp) >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((e) => toDateOnly(e.timestamp) <= dateTo);
    }
    return list;
  }, [history, filter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  const counts = useMemo(
    () => ({
      all: history.length,
      success: history.filter((e) => e.status === "success").length,
      failed: history.filter((e) => e.status === "failed").length,
    }),
    [history]
  );

  function exportCsv() {
    if (filtered.length === 0) return;

    const header = [
      "Pengguna",
      "Email",
      "Alamat IP",
      "Browser",
      "Waktu",
      "Status",
      "Alasan",
    ];

    const rows = filtered.map((entry) => {
      const name = displayName(entry);
      const status = entry.status === "success" ? "BERHASIL" : "GAGAL";
      return [
        name,
        entry.email,
        entry.ip,
        getBrowser(entry.userAgent),
        formatTime(entry.timestamp),
        status,
        entry.reason ?? "",
      ];
    });

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csv = [header, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-login-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-title-wrap h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .live-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse-dot 2s infinite;
        }

        .btn-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #1C5C38;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          white-space: nowrap;
        }

        .btn-export:hover:not(:disabled) {
          background: #2A7A4E;
          transform: translateY(-1px);
        }

        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #E5E7EB;
          background: #fff;
          color: #6B7280;
          font-family: inherit;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }

        .filter-tab:hover:not(.active) {
          border-color: #1C5C38;
          color: #1C5C38;
        }

        .filter-tab.active-all,
        .filter-tab.active-success {
          background: #1C5C38;
          color: #fff;
          border-color: #1C5C38;
        }

        .filter-tab.active-failed {
          background: #DC2626;
          color: #fff;
          border-color: #DC2626;
        }

        .tab-count {
          opacity: 0.85;
          margin-left: 4px;
        }

        .date-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .date-field {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .date-label {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
        }

        .date-input {
          padding: 8px 10px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          color: #0C0C0C;
          background: #fff;
          outline: none;
        }

        .date-input:focus {
          border-color: #1C5C38;
          box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
        }

        .panel {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }

        .panel-info {
          padding: 12px 20px;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
          font-size: 12px;
          color: #6B7280;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
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

        .history-table tbody tr:last-child td {
          border-bottom: none;
        }

        .history-table tbody tr {
          transition: background 0.15s;
        }

        .history-table tbody tr:hover td {
          background: #F9FAFB;
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

        .time-relative {
          font-weight: 500;
          color: #374151;
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

        .fail-reason {
          font-size: 11px;
          color: #DC2626;
          margin-top: 4px;
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

        
        .skeleton-row td {
          padding: 14px 20px;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            #F3F4F6 25%,
            #E5E7EB 50%,
            #F3F4F6 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .skeleton-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .empty-state {
          text-align: center;
          padding: 48px 20px;
          color: #6B7280;
          font-size: 14px;
        }

        
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 16px 20px;
          border-top: 1px solid #E5E7EB;
        }

        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #fff;
          color: #374151;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #1C5C38;
          color: #1C5C38;
        }

        .page-btn.active {
          background: #1C5C38;
          color: #fff;
          border-color: #1C5C38;
        }

        .page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 13px;
          color: #6B7280;
          margin-right: 8px;
        }

        @media (max-width: 768px) {
          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .date-filters {
            justify-content: flex-start;
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
        <header className="page-header" data-animate data-delay="0">
          <div className="page-title-wrap">
            <h1>Riwayat Login</h1>
            <div className="live-meta">
              <span className="live-dot" aria-hidden="true" />
              LIVE · {lastUpdatedStr}
            </div>
          </div>
          <button
            type="button"
            className="btn-export"
            onClick={exportCsv}
            disabled={loading || filtered.length === 0}
          >
            <Download size={18} />
            Export CSV
          </button>
        </header>

        <div className="toolbar" data-animate data-delay="50">
          <div className="filter-tabs">
            {(
              [
                { key: "all" as StatusFilter, label: "Semua", count: counts.all },
                {
                  key: "success" as StatusFilter,
                  label: "Berhasil",
                  count: counts.success,
                },
                {
                  key: "failed" as StatusFilter,
                  label: "Gagal",
                  count: counts.failed,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`filter-tab${
                  filter === tab.key
                    ? tab.key === "failed"
                      ? " active-failed"
                      : tab.key === "all"
                        ? " active-all"
                        : " active-success"
                    : ""
                }`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className="tab-count">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="date-filters">
            <div className="date-field">
              <label className="date-label" htmlFor="date-from">
                Dari
              </label>
              <input
                id="date-from"
                type="date"
                className="date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="date-field">
              <label className="date-label" htmlFor="date-to">
                Sampai
              </label>
              <input
                id="date-to"
                type="date"
                className="date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <section className="panel" data-animate data-delay="100">
          <div className="panel-info">
            <span>
              Menampilkan {paginated.length} dari {filtered.length} entri
              {filtered.length !== history.length &&
                ` (filter dari ${history.length} total)`}
            </span>
            <span>Refresh otomatis 15 detik</span>
          </div>

          {loading ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Alamat IP</th>
                  <th>Browser</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td>
                      <div className="skeleton-user">
                        <div className="skeleton-line skeleton-avatar" />
                        <div style={{ flex: 1 }}>
                          <div
                            className="skeleton-line"
                            style={{ height: 12, width: "70%", marginBottom: 6 }}
                          />
                          <div
                            className="skeleton-line"
                            style={{ height: 10, width: "90%" }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="skeleton-line" style={{ width: 100 }} />
                    </td>
                    <td>
                      <div className="skeleton-line" style={{ width: 72 }} />
                    </td>
                    <td>
                      <div className="skeleton-line" style={{ width: 88 }} />
                    </td>
                    <td>
                      <div className="skeleton-line" style={{ width: 64 }} />
                    </td>
                    <td>
                      <div
                        className="skeleton-line"
                        style={{ width: 32, height: 32, borderRadius: 6 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className="empty-state">Tidak ada data untuk filter ini.</div>
          ) : (
            <>
              <table className="history-table" data-animate data-delay="150">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Alamat IP</th>
                    <th>Browser</th>
                    <th>Waktu</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((entry, idx) => {
                    const name = displayName(entry);
                    const colors = avatarColor(name);
                    return (
                      <tr
                        key={entry.id}
                        data-animate
                        data-delay={String(200 + idx * 40)}
                      >
                        <td>
                          <div className="user-cell">
                            <div
                              className="row-avatar"
                              style={{
                                background: colors.bg,
                                color: colors.color,
                              }}
                            >
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="user-name">{name}</div>
                              <div className="user-email">{entry.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="ip-cell">{entry.ip}</span>
                        </td>
                        <td>{getBrowser(entry.userAgent)}</td>
                        <td className="time-cell">
                          <div className="time-relative">
                            {timeAgo(entry.timestamp)}
                          </div>
                          <div>{formatTime(entry.timestamp)}</div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${entry.status === "success" ? "success" : "failed"}`}
                          >
                            {entry.status === "success" ? "BERHASIL" : "GAGAL"}
                          </span>
                          {entry.reason && (
                            <div className="fail-reason">{entry.reason}</div>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="aksi-btn"
                            aria-label={`Detail login ${name}`}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length > PAGE_SIZE && (
                <nav className="pagination">
                  <span className="page-info">
                    Halaman {safePage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    className="page-btn"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`page-btn${n === safePage ? " active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="page-btn"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Halaman berikutnya"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}