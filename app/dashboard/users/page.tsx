// ============================================================
// PATH : app/dashboard/users/page.tsx
// ISI  : Halaman Manajemen Pendaftar
//        - Data dari tabel siswa (non-draft)
//        - Filter jurusan, status, sort, search
//        - Kartu pendaftar + tombol Detail / Verifikasi
// ============================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, ClipboardCheck, X } from "lucide-react";
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

interface OrtuInfo {
  nama_ayah: string | null;
  nama_ibu: string | null;
  pekerjaan_ayah: string | null;
  pekerjaan_ibu: string | null;
  no_ortu: string | null;
}

interface BerkasInfo {
  foto_url: string | null;
  ijazah_url: string | null;
  rapor_url: string | null;
  kk_url: string | null;
}

interface SiswaDetail {
  id: string;
  nama_lengkap: string | null;
  nisn: string | null;
  nik: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  asal_sekolah: string | null;
  alamat_lengkap: string | null;
  nilai_rata_rata: number | null;
  prestasi: string | null;
  status: string;
  catatan_verifikasi: string | null;
  ortu: OrtuInfo | OrtuInfo[] | null;
  berkas: BerkasInfo | BerkasInfo[] | null;
}

type VerifikasiStatus = "diterima" | "ditolak" | "menunggu";
type ToastState = { type: "success" | "error"; msg: string } | null;

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

function resolveOrtu(ortu: SiswaDetail["ortu"]): OrtuInfo | null {
  if (!ortu) return null;
  if (Array.isArray(ortu)) return ortu[0] ?? null;
  return ortu;
}

function resolveBerkas(berkas: SiswaDetail["berkas"]): BerkasInfo | null {
  if (!berkas) return null;
  if (Array.isArray(berkas)) return berkas[0] ?? null;
  return berkas;
}

function toVerifikasiStatus(status: string): VerifikasiStatus {
  if (status === "diterima" || status === "ditolak") return status;
  return "menunggu";
}

function formatTTL(tempat: string | null, tanggal: string | null): string {
  const t = tempat?.trim();
  const d = tanggal
    ? new Date(tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  if (t && d) return `${t}, ${d}`;
  return t || d || "—";
}

function formatJenisKelamin(jk: string | null): string {
  if (jk === "L") return "Laki-laki";
  if (jk === "P") return "Perempuan";
  return jk || "—";
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<SiswaDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStatus, setDetailStatus] = useState<VerifikasiStatus>("menunggu");
  const [detailCatatan, setDetailCatatan] = useState("");
  const [quickVerifyTarget, setQuickVerifyTarget] = useState<Pendaftar | null>(null);
  const [quickCatatan, setQuickCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchPendaftar = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("siswa")
      .select(`
        id, nama_lengkap, nisn, asal_sekolah, status,
        submitted_at, verified_at, catatan_verifikasi,
        jurusan (id, kode, nama),
        profiles!siswa_user_id_fkey (email, avatar_url)
      `)
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
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user?: { id: string } | null }) => {
        if (data.user?.id) setCurrentUserId(data.user.id);
      })
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, jurusanFilter, statusFilter, sortBy]);

  const fetchSiswaDetail = useCallback(async (siswaId: string) => {
    setDetailLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("siswa")
      .select(
        `
        id, nama_lengkap, nisn, nik, tempat_lahir, tanggal_lahir,
        jenis_kelamin, agama, asal_sekolah, alamat_lengkap,
        nilai_rata_rata, prestasi, status, catatan_verifikasi,
        ortu (nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, no_ortu),
        berkas (foto_url, ijazah_url, rapor_url, kk_url)
      `
      )
      .eq("id", siswaId)
      .single();

    if (!error && data) {
      const detail = data as SiswaDetail;
      setDetailData(detail);
      setDetailStatus(toVerifikasiStatus(detail.status));
      setDetailCatatan(detail.catatan_verifikasi ?? "");
    } else {
      setDetailData(null);
      setActiveDetailId(null);
      showToast("Gagal memuat detail pendaftar.", "error");
    }
    setDetailLoading(false);
  }, [showToast]);

  const openDetailModal = useCallback(
    (item: Pendaftar) => {
      setActiveDetailId(item.id);
      setDetailData(null);
      setDetailCatatan("");
      void fetchSiswaDetail(item.id);
    },
    [fetchSiswaDetail]
  );

  const closeDetailModal = useCallback(() => {
    setActiveDetailId(null);
    setDetailData(null);
    setDetailLoading(false);
  }, []);

  const updateVerifikasi = useCallback(
    async (siswaId: string, newStatus: VerifikasiStatus, catatan: string) => {
      if (!currentUserId) {
        showToast("Sesi tidak valid. Silakan login ulang.", "error");
        return false;
      }
      setSaving(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.from("siswa").update({
          status: newStatus,
          catatan_verifikasi: catatan,
          verified_at: new Date().toISOString(),
          verified_by: currentUserId,
        }).eq("id", siswaId);
        if (error) {
          showToast("Gagal menyimpan keputusan verifikasi.", "error");
          return false;
        }
        await fetchPendaftar();
        showToast("Keputusan verifikasi berhasil disimpan.");
        return true;
      } catch {
        showToast("Koneksi gagal. Coba lagi.", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [currentUserId, fetchPendaftar, showToast]
  );

  const handleDetailSave = useCallback(async () => {
    if (!detailData) return;
    const ok = await updateVerifikasi(detailData.id, detailStatus, detailCatatan);
    if (ok) closeDetailModal();
  }, [detailData, detailStatus, detailCatatan, updateVerifikasi, closeDetailModal]);

  const handleQuickVerify = useCallback(
    async (newStatus: "diterima" | "ditolak") => {
      if (!quickVerifyTarget) return;
      const ok = await updateVerifikasi(quickVerifyTarget.id, newStatus, quickCatatan);
      if (ok) {
        setQuickVerifyTarget(null);
        setQuickCatatan("");
      }
    },
    [quickVerifyTarget, quickCatatan, updateVerifikasi]
  );

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

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-detail {
          background: #fff;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #E5E7EB;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
        }

        .modal-detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 20px 16px;
          border-bottom: 1px solid #E5E7EB;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
        }

        .modal-detail-title {
          font-size: 18px;
          font-weight: 700;
          color: #0C0C0C;
          line-height: 1.3;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: #fff;
          color: #6B7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }

        .modal-close:hover {
          background: #F3F4F6;
          color: #0C0C0C;
        }

        .modal-body {
          padding: 0 20px 20px;
        }

        .modal-section {
          padding: 16px 0;
          border-bottom: 1px solid #F3F4F6;
        }

        .modal-section:last-of-type {
          border-bottom: none;
        }

        .modal-section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #1C5C38;
          margin-bottom: 12px;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 16px;
        }

        .modal-field label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .modal-field span,
        .modal-field a {
          font-size: 13px;
          color: #0C0C0C;
          line-height: 1.4;
          word-break: break-word;
        }

        .modal-field.full {
          grid-column: 1 / -1;
        }

        .file-link {
          color: #1C5C38;
          font-weight: 600;
          text-decoration: none;
        }

        .file-link:hover {
          text-decoration: underline;
        }

        .file-missing {
          color: #9CA3AF;
          font-size: 13px;
        }

        .modal-verify {
          padding: 16px 20px 20px;
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
        }

        .modal-verify label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .modal-verify select,
        .modal-verify textarea,
        .quick-verify-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: #0C0C0C;
          background: #fff;
          outline: none;
          margin-bottom: 12px;
        }

        .modal-verify select:focus,
        .modal-verify textarea:focus,
        .quick-verify-input:focus {
          border-color: #1C5C38;
        }

        .btn-save-decision {
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background: #1C5C38;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-save-decision:hover:not(:disabled) {
          background: #2A7A4E;
        }

        .btn-save-decision:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-quick {
          background: #fff;
          border-radius: 16px;
          max-width: 360px;
          width: 100%;
          padding: 24px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
        }

        .modal-quick-title {
          font-size: 16px;
          font-weight: 600;
          color: #0C0C0C;
          text-align: center;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .btn-terima,
        .btn-tolak {
          width: 100%;
          padding: 14px 16px;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-terima {
          background: #1C5C38;
          color: #fff;
        }

        .btn-terima:hover:not(:disabled) {
          background: #2A7A4E;
        }

        .btn-tolak {
          background: #DC2626;
          color: #fff;
        }

        .btn-tolak:hover:not(:disabled) {
          background: #B91C1C;
        }

        .btn-terima:disabled,
        .btn-tolak:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-loading {
          padding: 48px 20px;
          text-align: center;
          color: #6B7280;
          font-size: 14px;
        }

        .toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 200;
          padding: 13px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          max-width: 360px;
        }

        .toast.success {
          background: #D1FAE5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .toast.error {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }

        @media (max-width: 640px) {
          .toolbar-row { flex-direction: column; align-items: stretch; }
          .filter-controls { flex-direction: column; align-items: stretch; }
          .control-group { justify-content: space-between; }
          .modal-grid { grid-template-columns: 1fr; }
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
                      <button
                        type="button"
                        className="btn-detail"
                        onClick={() => openDetailModal(item)}
                      >
                        <Eye size={15} />
                        Detail
                      </button>
                      <button
                        type="button"
                        className="btn-verify"
                        onClick={() => {
                          setQuickCatatan("");
                          setQuickVerifyTarget(item);
                        }}
                      >
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

      {activeDetailId && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={closeDetailModal}
        >
          <div
            className="modal-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !detailData ? (
              <div className="modal-loading">Memuat detail pendaftar...</div>
            ) : (
              <>
                <div className="modal-detail-header">
                  <div>
                    <h2 id="detail-modal-title" className="modal-detail-title">
                      {detailData.nama_lengkap || "—"}
                    </h2>
                    <span className={`status-pill ${statusBadge(detailData.status).variant}`}>
                      {statusBadge(detailData.status).label}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={closeDetailModal}
                    aria-label="Tutup"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body">
                  {(() => {
                    const ortu = resolveOrtu(detailData.ortu);
                    const berkas = resolveBerkas(detailData.berkas);
                    const berkasItems: { label: string; url: string | null }[] = [
                      { label: "Foto", url: berkas?.foto_url ?? null },
                      { label: "Ijazah", url: berkas?.ijazah_url ?? null },
                      { label: "Rapor", url: berkas?.rapor_url ?? null },
                      { label: "KK", url: berkas?.kk_url ?? null },
                    ];

                    return (
                      <>
                        <section className="modal-section">
                          <h3 className="modal-section-title">Data Diri</h3>
                          <div className="modal-grid">
                            <div className="modal-field">
                              <label>NISN</label>
                              <span>{detailData.nisn || "—"}</span>
                            </div>
                            <div className="modal-field">
                              <label>NIK</label>
                              <span>{detailData.nik || "—"}</span>
                            </div>
                            <div className="modal-field">
                              <label>TTL</label>
                              <span>
                                {formatTTL(detailData.tempat_lahir, detailData.tanggal_lahir)}
                              </span>
                            </div>
                            <div className="modal-field">
                              <label>Jenis Kelamin</label>
                              <span>{formatJenisKelamin(detailData.jenis_kelamin)}</span>
                            </div>
                            <div className="modal-field">
                              <label>Agama</label>
                              <span>{detailData.agama || "—"}</span>
                            </div>
                            <div className="modal-field">
                              <label>Asal Sekolah</label>
                              <span>{detailData.asal_sekolah || "—"}</span>
                            </div>
                            <div className="modal-field full">
                              <label>Alamat</label>
                              <span>{detailData.alamat_lengkap || "—"}</span>
                            </div>
                          </div>
                        </section>

                        <section className="modal-section">
                          <h3 className="modal-section-title">Data Akademik</h3>
                          <div className="modal-grid">
                            <div className="modal-field">
                              <label>Nilai Rata-rata</label>
                              <span>
                                {detailData.nilai_rata_rata != null
                                  ? detailData.nilai_rata_rata
                                  : "—"}
                              </span>
                            </div>
                            <div className="modal-field full">
                              <label>Prestasi</label>
                              <span>{detailData.prestasi?.trim() || "—"}</span>
                            </div>
                          </div>
                        </section>

                        <section className="modal-section">
                          <h3 className="modal-section-title">Data Orang Tua</h3>
                          <div className="modal-grid">
                            <div className="modal-field">
                              <label>Nama Ayah</label>
                              <span>{ortu?.nama_ayah || "—"}</span>
                            </div>
                            <div className="modal-field">
                              <label>Nama Ibu</label>
                              <span>{ortu?.nama_ibu || "—"}</span>
                            </div>
                            <div className="modal-field">
                              <label>Pekerjaan Ayah</label>
                              <span>{ortu?.pekerjaan_ayah || "—"}</span>
                            </div>
                            <div className="modal-field">
                              <label>Pekerjaan Ibu</label>
                              <span>{ortu?.pekerjaan_ibu || "—"}</span>
                            </div>
                            <div className="modal-field full">
                              <label>No WA Ortu</label>
                              <span>{ortu?.no_ortu || "—"}</span>
                            </div>
                          </div>
                        </section>

                        <section className="modal-section">
                          <h3 className="modal-section-title">Berkas</h3>
                          <div className="modal-grid">
                            {berkasItems.map((b) => (
                              <div className="modal-field" key={b.label}>
                                <label>{b.label}</label>
                                {b.url ? (
                                  <a
                                    className="file-link"
                                    href={b.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Lihat File
                                  </a>
                                ) : (
                                  <span className="file-missing">Belum upload</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      </>
                    );
                  })()}
                </div>

                <div className="modal-verify">
                  <label htmlFor="detail-status">Status Verifikasi</label>
                  <select
                    id="detail-status"
                    value={detailStatus}
                    onChange={(e) =>
                      setDetailStatus(e.target.value as VerifikasiStatus)
                    }
                    disabled={saving}
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="diterima">Diterima</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                  <label htmlFor="detail-catatan">Catatan</label>
                  <textarea
                    id="detail-catatan"
                    rows={3}
                    placeholder="Catatan verifikasi..."
                    value={detailCatatan}
                    onChange={(e) => setDetailCatatan(e.target.value)}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    className="btn-save-decision"
                    onClick={() => void handleDetailSave()}
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan Keputusan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {quickVerifyTarget && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            if (!saving) {
              setQuickVerifyTarget(null);
              setQuickCatatan("");
            }
          }}
        >
          <div
            className="modal-quick"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="modal-quick-title">
              Verifikasi pendaftaran {quickVerifyTarget.nama_lengkap || "—"}?
            </p>
            <div className="quick-actions">
              <button
                type="button"
                className="btn-terima"
                disabled={saving}
                onClick={() => void handleQuickVerify("diterima")}
              >
                ✓ Terima
              </button>
              <button
                type="button"
                className="btn-tolak"
                disabled={saving}
                onClick={() => void handleQuickVerify("ditolak")}
              >
                ✗ Tolak
              </button>
            </div>
            <input
              type="text"
              className="quick-verify-input"
              placeholder="Catatan singkat (opsional)"
              value={quickCatatan}
              onChange={(e) => setQuickCatatan(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}