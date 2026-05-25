// ============================================================
// PATH : app/dashboard/users/page.tsx
// ISI  : Halaman manajemen pengguna — full CRUD
//        - Search real-time
//        - Tambah user → modal form
//        - Edit user  → modal pre-filled
//        - Hapus user → inline confirm card
// ============================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  is_active?: boolean;
}

type ModalMode = "add" | "edit";
type RoleFilter = "all" | "admin" | "user";
type SortOption = "newest" | "oldest" | "az";

interface FormState {
  name: string;
  email: string;
  role: "admin" | "user";
  password: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  role: "user",
  password: "",
  is_active: true,
};

const PAGE_SIZE = 20;
const SKELETON_COUNT = 6;

export default function UsersPage() {
  useScrollAnimation();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const d = await res.json();
      setUsers(
        (d.users ?? []).map((u: User) => ({
          ...u,
          is_active: u.is_active ?? true,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, sortBy]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setModalMode("add");
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setModalMode("edit");
    setEditTarget(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      is_active: user.is_active ?? true,
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (formLoading) return;
    setModalOpen(false);
    setFormError("");
  }

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) {
      setFormError("Nama, email, dan password wajib diisi.");
      return;
    }
    setFormLoading(true);
    setFormError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) {
      setFormError(data.error || "Gagal menambah user.");
      return;
    }
    setModalOpen(false);
    await fetchUsers();
    showToast(`Akun ${data.user.name} berhasil ditambahkan!`, "success");
  }

  async function handleEdit() {
    if (!form.name || !form.email) {
      setFormError("Nama dan email wajib diisi.");
      return;
    }
    if (form.password && form.password.length < 6) {
      setFormError("Password baru minimal 6 karakter.");
      return;
    }
    setFormLoading(true);
    setFormError("");

    const body: Partial<FormState> = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (form.password) body.password = form.password;

    const res = await fetch(`/api/admin/users/${editTarget!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) {
      setFormError(data.error || "Gagal mengupdate user.");
      return;
    }
    setModalOpen(false);
    await fetchUsers();
    showToast(`Akun ${data.user.name} berhasil diperbarui!`, "success");
  }

  async function handleDelete(user: User) {
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleteLoading(false);
    if (!res.ok) {
      showToast(data.error || "Gagal menghapus user.", "error");
    } else {
      setDeleteTarget(null);
      await fetchUsers();
      showToast(`Akun ${user.name} berhasil dihapus.`, "success");
    }
  }

  const filtered = useMemo(() => {
    let list = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }
    return list;
  }, [users, search, roleFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, "id"));
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

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #1C5C38;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          white-space: nowrap;
        }

        .btn-add:hover {
          background: #2A7A4E;
          transform: translateY(-1px);
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

        .filter-tab:hover {
          border-color: #1C5C38;
          color: #1C5C38;
        }

        .filter-tab.active {
          background: #1C5C38;
          color: #fff;
          border-color: #1C5C38;
        }

        .sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-label {
          font-size: 13px;
          color: #6B7280;
          font-weight: 500;
        }

        .sort-select {
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

        .sort-select:focus {
          border-color: #1C5C38;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .user-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(28, 92, 56, 0.1);
        }

        .user-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #EBF4EE;
          color: #1C5C38;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-info { min-width: 0; flex: 1; }

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #0C0C0C;
          line-height: 1.3;
        }

        .user-email {
          font-size: 13px;
          font-weight: 400;
          color: #6B7280;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .role-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .role-pill.admin {
          background: #EBF4EE;
          color: #1C5C38;
        }

        .role-pill.user {
          background: #F3F4F6;
          color: #6B7280;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-pill.active {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-pill.inactive {
          background: #F3F4F6;
          color: #6B7280;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 4px;
          border-top: 1px solid #F3F4F6;
        }

        .btn-edit,
        .btn-del {
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

        .btn-edit {
          background: #fff;
          color: #374151;
          border: 1px solid #E5E7EB;
        }

        .btn-edit:hover {
          background: #F2F8F4;
          border-color: #EBF4EE;
          color: #1C5C38;
        }

        .btn-del {
          background: #fff;
          color: #DC2626;
          border: 1px solid #E5E7EB;
        }

        .btn-del:hover {
          background: #FEE2E2;
          border-color: #FECACA;
        }

        .delete-confirm {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 14px;
          margin-top: 4px;
        }

        .delete-confirm p {
          font-size: 13px;
          color: #374151;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .delete-confirm strong { color: #0C0C0C; }

        .confirm-btns { display: flex; gap: 8px; }

        .confirm-yes {
          flex: 1;
          padding: 8px;
          background: #DC2626;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .confirm-yes:disabled { opacity: 0.6; cursor: not-allowed; }

        .confirm-no {
          flex: 1;
          padding: 8px;
          background: #fff;
          color: #6B7280;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Skeleton */
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

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: #fff;
          cursor: pointer;
          font-size: 18px;
          color: #6B7280;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover { background: #F3F4F6; }

        .mform-group { margin-bottom: 16px; }

        .mlabel {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .minput,
        .mselect {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: #0C0C0C;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .minput:focus,
        .mselect:focus {
          border-color: #1C5C38;
          box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
        }

        .mselect {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }

        .mhint {
          font-size: 11px;
          color: #6B7280;
          margin-top: 4px;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0 4px;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 600;
          color: #0C0C0C;
        }

        .toggle-hint {
          font-size: 12px;
          color: #6B7280;
          margin-top: 2px;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
          padding: 0;
        }

        .toggle-switch.on { background: #1C5C38; }
        .toggle-switch.off { background: #D1D5DB; }

        .toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }

        .toggle-switch.on .toggle-knob { transform: translateX(20px); }

        .merror {
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          color: #991B1B;
          margin-bottom: 16px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: #fff;
          color: #374151;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-cancel:hover { background: #F9FAFB; }

        .btn-submit {
          padding: 10px 24px;
          background: #1C5C38;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-submit:hover:not(:disabled) { background: #2A7A4E; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Pagination */
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

        /* Toast */
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
          .toolbar { flex-direction: column; align-items: stretch; }
          .sort-wrap { justify-content: space-between; }
        }
      `}</style>

      <div className="page">
        <header className="page-header" data-animate data-delay="0">
          <h1 className="page-title">Manajemen Pengguna</h1>
          <button type="button" className="btn-add" onClick={openAdd}>
            <Plus size={18} strokeWidth={2.5} />
            Tambah Pengguna
          </button>
        </header>

        <div className="search-bar" data-animate data-delay="50">
          <Search size={18} />
          <input
            className="search-input"
            type="text"
            placeholder="Cari pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar" data-animate data-delay="100">
          <div className="filter-tabs">
            {(
              [
                { key: "all" as RoleFilter, label: "Semua" },
                { key: "admin" as RoleFilter, label: "Admin" },
                { key: "user" as RoleFilter, label: "User" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`filter-tab${roleFilter === tab.key ? " active" : ""}`}
                onClick={() => setRoleFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="sort-wrap">
            <span className="sort-label">Urutkan</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="users-grid">
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
            {search || roleFilter !== "all"
              ? "Tidak ada pengguna yang cocok dengan filter."
              : "Belum ada pengguna."}
          </div>
        ) : (
          <>
            <div className="users-grid" data-animate data-delay="150">
              {paginated.map((user, idx) => {
                const isActive = user.is_active ?? true;
                return (
                  <article
                    key={user.id}
                    className="user-card"
                    data-animate
                    data-delay={String(200 + idx * 50)}
                  >
                    <div className="user-card-top">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="user-badges">
                      <span className={`role-pill ${user.role}`}>
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                      <span
                        className={`status-pill ${isActive ? "active" : "inactive"}`}
                      >
                        {isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    {deleteTarget?.id !== user.id ? (
                      <div className="card-actions">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-del"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 size={15} />
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="delete-confirm">
                        <p>
                          Hapus akun <strong>{user.name}</strong>? Tindakan ini
                          tidak bisa dibatalkan.
                        </p>
                        <div className="confirm-btns">
                          <button
                            type="button"
                            className="confirm-yes"
                            disabled={deleteLoading}
                            onClick={() => handleDelete(user)}
                          >
                            {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
                          </button>
                          <button
                            type="button"
                            className="confirm-no"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteLoading}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {sorted.length > PAGE_SIZE && (
              <nav className="pagination" data-animate data-delay="100">
                <span className="page-info">
                  {sorted.length} pengguna · halaman {safePage}/{totalPages}
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

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>
                {modalMode === "add" ? "Tambah Pengguna" : "Edit Pengguna"}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {formError && <div className="merror">{formError}</div>}

            <div className="mform-group">
              <label className="mlabel" htmlFor="user-name">
                Nama Lengkap
              </label>
              <input
                id="user-name"
                className="minput"
                type="text"
                placeholder="Nama lengkap"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="mform-group">
              <label className="mlabel" htmlFor="user-email">
                Email
              </label>
              <input
                id="user-email"
                className="minput"
                type="email"
                placeholder="email@spmb.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>

            <div className="mform-group">
              <label className="mlabel" htmlFor="user-password">
                {modalMode === "edit" ? "Password Baru" : "Password"}
              </label>
              <input
                id="user-password"
                className="minput"
                type="password"
                placeholder={
                  modalMode === "edit"
                    ? "Kosongkan jika tidak diubah"
                    : "Min. 6 karakter"
                }
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              {modalMode === "edit" && (
                <p className="mhint">
                  Biarkan kosong untuk mempertahankan password lama.
                </p>
              )}
            </div>

            <div className="mform-group">
              <label className="mlabel" htmlFor="user-role">
                Role
              </label>
              <select
                id="user-role"
                className="mselect"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    role: e.target.value as "admin" | "user",
                  }))
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {modalMode === "edit" && (
              <div className="toggle-row">
                <div>
                  <div className="toggle-label">Status Akun</div>
                  <div className="toggle-hint">
                    {form.is_active ? "Pengguna dapat login" : "Login dinonaktifkan"}
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle-switch${form.is_active ? " on" : " off"}`}
                  onClick={() =>
                    setForm((p) => ({ ...p, is_active: !p.is_active }))
                  }
                  aria-pressed={form.is_active}
                  aria-label="Toggle status aktif"
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeModal}>
                Batal
              </button>
              <button
                type="button"
                className="btn-submit"
                disabled={formLoading}
                onClick={modalMode === "add" ? handleAdd : handleEdit}
              >
                {formLoading
                  ? modalMode === "add"
                    ? "Menambahkan..."
                    : "Menyimpan..."
                  : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
