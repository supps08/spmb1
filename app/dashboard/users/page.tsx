// ============================================================
// PATH : app/dashboard/users/page.tsx
// ISI  : Halaman Manajemen Pendaftar
//        - Data dari tabel siswa (non-draft)
//        - Filter jurusan, status, sort, search
//        - Kartu pendaftar + tombol Detail / Verifikasi
// ============================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { avatarColor } from "@/lib/avatar";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface JurusanInfo {
  id: string;
  kode: string;
  nama: string;
}

interface ProfileInfo {
  email: string | null;
  avatar_url: string | null;
}

interface Pendaftar {
  id: string;
  nama_lengkap: string | null;
  nisn: string | null;
  asal_sekolah: string | null;
  status: string;
  submitted_at: string | null;
  verified_at: string | null;
  catatan_verifikasi: string | null;
  jurusan: JurusanInfo | JurusanInfo[] | null;
  profiles: ProfileInfo | ProfileInfo[] | null;
}

type JurusanFilter = "all" | string;
type StatusFilter = "all" | "menunggu" | "diterima" | "ditolak";
type SortOption = "newest" | "oldest" | "az" | "unverified";

const JURUSAN_KODES = ["PPLG", "TKJ", "MPLB", "DKV", "MPC", "PH"] as const;
const PAGE_SIZE = 20;
const SKELETON_COUNT = 6;

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveJurusan(jurusan: Pendaftar["jurusan"]): JurusanInfo | null {
  if (!jurusan) return null;
  if (Array.isArray(jurusan)) return jurusan[0] ?? null;
  return jurusan;
}

function resolveProfile(profiles: Pendaftar["profiles"]): ProfileInfo | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
}

function formatTanggalDaftar(submittedAt: string | null): string {
  if (!submittedAt) return "—";
  return new Date(submittedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string): { label: string; variant: "menunggu" | "diterima" | "ditolak" } {
  switch (status) {
    case "diterima":
      return { label: "Diterima", variant: "diterima" };
    case "ditolak":
      return { label: "Ditolak", variant: "ditolak" };
    case "menunggu":
      return { label: "Menunggu", variant: "menunggu" };
    case "submitted":
      return { label: "Dikirim", variant: "menunggu" };
    default:
      return { label: status, variant: "menunggu" };
  }
}

function matchesStatusFilter(status: string, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "menunggu") return status === "menunggu" || status === "submitted";
  return status === filter;
}

export default function UsersPage() {
  useScrollAnimation();

  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jurusanFilter, setJurusanFilter] = useState<JurusanFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const fetchPendaftar = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("siswa")
      .select(
        `
        id, nama_lengkap, nisn, asal_sekolah, status,
        submitted_at, verified_at, catatan_verifikasi,
        jurusan (id, kode, nama),
        profiles (email, avatar_url)
      `
      )
      .neq("status", "draft")
      .order("submitted_at", { ascending: false });

    if (!error && data) {
      setPendaftar(data as Pendaftar[]);
    } else {
      setPendaftar([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPendaftar();
  }, [fetchPendaftar]);

  useEffect(() => {
    setPage(1);
  }, [search, jurusanFilter, statusFilter, sortBy]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pendaftar.filter((p) => {
      const jurusan = resolveJurusan(p.jurusan);
      if (jurusanFilter !== "all" && jurusan?.kode !== jurusanFilter) return false;
      if (!matchesStatusFilter(p.status, statusFilter)) return false;
      if (!q) return true;
      const nama = (p.nama_lengkap ?? "").toLowerCase();
      const nisn = (p.nisn ?? "").toLowerCase();
      return nama.includes(q) || nisn.includes(q);
    });
  }, [pendaftar, search, jurusanFilter, statusFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.submitted_at ?? 0).getTime() -
          new Date(a.submitted_at ?? 0).getTime()
      );
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.submitted_at ?? 0).getTime() -
          new Date(b.submitted_at ?? 0).getTime()
      );
    } else if (sortBy === "az") {
      list.sort((a, b) =>
        (a.nama_lengkap ?? "").localeCompare(b.nama_lengkap ?? "", "id")
      );
    } else {
      list.sort((a, b) => {
        const aUnverified = a.verified_at ? 0 : 1;
        const bUnverified = b.verified_at ? 0 : 1;
        if (bUnverified !== aUnverified) return bUnverified - aUnverified;
        return (
          new Date(b.submitted_at ?? 0).getTime() -
          new Date(a.submitted_at ?? 0).getTime()
        );
      });
    }
    return list;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
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

  const hasActiveFilter =
    search.trim() !== "" ||
    jurusanFilter !== "all" ||
    statusFilter !== "all";

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

        .page-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-bar svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #6B7280;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: #0C0C0C;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input:focus {
          border-color: #1C5C38;
          box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
        }

        .search-input::placeholder {
          color: #9CA3AF;
        }

        .toolbar {
          display: flex;
          flex-direction: column;
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

        .filter-tab:hover {
          border-color: #1C5C38;
          color: #1C5C38;
        }

        .filter-tab.active {
          background: #1C5C38;
          color: #fff;
          border-color: #1C5C38;
        }

        .toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-label {
          font-size: 13px;
          color: #6B7280;
          font-weight: 500;
          white-space: nowrap;
        }

        .control-select {
          padding: 8px 32px 8px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #0C0C0C;
          background: #fff;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        .control-select:focus {
          border-color: #1C5C38;
        }

        .pendaftar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .pendaftar-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .pendaftar-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(28, 92, 56, 0.1);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .card-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-info { min-width: 0; flex: 1; }

        .card-name {
          font-size: 15px;
          font-weight: 600;
          color: #0C0C0C;
          line-height: 1.3;
        }

        .card-email {
          font-size: 13px;
          font-weight: 400;
          color: #6B7280;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .jurusan-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: #EBF4EE;
          color: #1C5C38;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-pill.menunggu {
          background: #FEF3C7;
          color: #92400E;
        }

        .status-pill.diterima {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-pill.ditolak {
          background: #FEE2E2;
          color: #991B1B;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-nisn {
          font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
          font-size: 12px;
          color: #374151;
          letter-spacing: 0.02em;
        }

        .meta-date {
          font-size: 12px;
          color: #6B7280;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px solid #F3F4F6;
        }

        .btn-detail,
        .btn-verify {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }

        .btn-detail {
          background: #fff;
          color: #374151;
          border: 1px solid #E5E7EB;
        }

        .btn-detail:hover {
          background: #F2F8F4;
          border-color: #EBF4EE;
          color: #1C5C38;
        }

        .btn-verify {
          background: #1C5C38;
          color: #fff;
          border: 1px solid #1C5C38;
        }

        .btn-verify:hover {
          background: #2A7A4E;
          border-color: #2A7A4E;
        }

        .skeleton-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .skeleton-line {
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

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .skeleton-row {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 8px;
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

        .empty-state {
          text-align: center;
          padding: 48px 20px;
          color: #6B7280;
          font-size: 14px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
        }

        @media (max-width: 640px) {
          .toolbar-row { flex-direction: column; align-items: stretch; }
          .filter-controls { flex-direction: column; align-items: stretch; }
          .control-group { justify-content: space-between; }
        }
      `}</style>

      <div className="page">
        <header className="page-header" data-animate data-delay="0">
          <h1 className="page-title">Manajemen Pendaftar</h1>
        </header>

        <div className="search-bar" data-animate data-delay="50">
          <Search size={18} />
          <input
            className="search-input"
            type="text"
            placeholder="Cari nama atau NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar" data-animate data-delay="100">
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-tab${jurusanFilter === "all" ? " active" : ""}`}
              onClick={() => setJurusanFilter("all")}
            >
              Semua
            </button>
            {JURUSAN_KODES.map((kode) => (
              <button
                key={kode}
                type="button"
                className={`filter-tab${jurusanFilter === kode ? " active" : ""}`}
                onClick={() => setJurusanFilter(kode)}
              >
                {kode}
              </button>
            ))}
          </div>

          <div className="toolbar-row">
            <div className="filter-controls">
              <div className="control-group">
                <span className="control-label">Status</span>
                <select
                  className="control-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">Semua</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="diterima">Diterima</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">Urutkan</span>
              <select
                className="control-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="az">A-Z</option>
                <option value="unverified">Belum Diverifikasi</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="pendaftar-grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton-row">
                  <div className="skeleton-line skeleton-avatar" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton-line" style={{ height: 14, width: "70%" }} />
                    <div className="skeleton-line" style={{ height: 12, width: "90%" }} />
                  </div>
                </div>
                <div className="skeleton-line" style={{ height: 24, width: "50%" }} />
                <div className="skeleton-line" style={{ height: 36, width: "100%" }} />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state" data-animate data-delay="0">
            {hasActiveFilter
              ? "Tidak ada pendaftar yang cocok dengan filter."
              : "Belum ada pendaftar."}
          </div>
        ) : (
          <>
            <div className="pendaftar-grid" data-animate data-delay="150">
              {paginated.map((item, idx) => {
                const jurusan = resolveJurusan(item.jurusan);
                const profile = resolveProfile(item.profiles);
                const email = profile?.email ?? "—";
                const badge = statusBadge(item.status);
                const colors = avatarColor(item.nama_lengkap ?? "");

                return (
                  <article
                    key={item.id}
                    className="pendaftar-card"
                    data-animate
                    data-delay={String(200 + idx * 50)}
                  >
                    <div className="card-top">
                      <div
                        className="card-avatar"
                        style={{ background: colors.bg, color: colors.color }}
                      >
                        {getInitials(item.nama_lengkap)}
                      </div>
                      <div className="card-info">
                        <div className="card-name">{item.nama_lengkap || "—"}</div>
                        <div className="card-email">{email}</div>
                      </div>
                    </div>

                    <div className="card-badges">
                      {jurusan?.kode && (
                        <span className="jurusan-pill">{jurusan.kode}</span>
                      )}
                      <span className={`status-pill ${badge.variant}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="card-meta">
                      <div className="meta-nisn">NISN: {item.nisn || "—"}</div>
                      <div className="meta-date">
                        Daftar: {formatTanggalDaftar(item.submitted_at)}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button type="button" className="btn-detail">
                        <Eye size={15} />
                        Detail
                      </button>
                      <button type="button" className="btn-verify">
                        <ClipboardCheck size={15} />
                        Verifikasi
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {sorted.length > PAGE_SIZE && (
              <nav className="pagination" data-animate data-delay="100">
                <span className="page-info">
                  {sorted.length} pendaftar · halaman {safePage}/{totalPages}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Halaman berikutnya"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}
