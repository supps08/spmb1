// ============================================================
// PATH : app/dashboard/users/page.tsx
// ISI  : Halaman manajemen pengguna — full CRUD
//        - Search real-time
//        - Tambah user → modal form
//        - Edit user  → modal pre-filled
//        - Hapus user → inline confirm card
// ============================================================

"use client";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

type ModalMode = "add" | "edit";

interface FormState {
  name: string;
  email: string;
  role: "admin" | "user";
  password: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", role: "user", password: "" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ─── Toast helper ──────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ─── Modal helpers ─────────────────────────────────────────
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
    setForm({ name: user.name, email: user.email, role: user.role, password: "" });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (formLoading) return;
    setModalOpen(false);
    setFormError("");
  }

  // ─── Submit: Add ───────────────────────────────────────────
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

  // ─── Submit: Edit ──────────────────────────────────────────
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

  // ─── Delete ────────────────────────────────────────────────
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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        :root {
          --cream: #FDF6EE; --cream-dark: #F5EAD8; --blush: #F2C4C4;
          --blush-light: #FAE8E8; --sage: #C8DDD1; --lavender: #DDD2EE;
          --warm-brown: #8B6B52; --text-dark: #3D2B1F; --text-mid: #7A5C48;
          --text-light: #B89A86; --white: #FFFFFF;
        }

        /* Page layout */
        .page { display: flex; flex-direction: column; gap: 20px; }
        .page-header {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .page-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: var(--text-dark); font-weight: 600;
        }
        .header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .count-label {
          font-size: 13px; color: var(--text-light);
          background: var(--cream-dark); padding: 3px 10px; border-radius: 8px;
        }
        .search-wrap { position: relative; }
        .search-wrap svg {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); opacity: 0.4; pointer-events: none;
        }
        .search-input {
          padding: 9px 14px 9px 36px;
          border: 1.5px solid var(--cream-dark); border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: var(--text-dark); background: var(--white);
          outline: none; transition: border-color .2s; min-width: 200px;
        }
        .search-input:focus { border-color: var(--blush); }

        .btn-add {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: linear-gradient(135deg, var(--warm-brown), #A0785A);
          color: white; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          font-weight: 500; cursor: pointer;
          box-shadow: 0 3px 12px rgba(139,107,82,0.25);
          transition: transform .15s, box-shadow .15s;
          white-space: nowrap;
        }
        .btn-add:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(139,107,82,0.35);
        }

        /* User grid */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .user-card {
          background: var(--white); border-radius: 16px;
          border: 1px solid var(--cream-dark); padding: 20px;
          transition: transform .2s, box-shadow .2s;
          animation: fadeIn .3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); } to { opacity: 1; }
        }
        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139,107,82,0.1);
        }
        .user-card-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .user-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blush), var(--lavender));
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: var(--warm-brown); flex-shrink: 0;
        }
        .user-avatar.admin-av {
          background: linear-gradient(135deg, #DDD2EE, #C4B4E4);
        }
        .user-name { font-size: 15px; font-weight: 600; color: var(--text-dark); }
        .user-email { font-size: 12px; color: var(--text-light); margin-top: 2px; }
        .user-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid var(--cream-dark);
        }
        .user-meta { font-size: 11.5px; color: var(--text-light); }
        .role-pill {
          padding: 3px 10px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600;
        }
        .role-pill.admin { background: #EDE7F6; color: #6B4FA0; }
        .role-pill.user { background: var(--cream-dark); color: var(--text-mid); }

        /* Card actions */
        .card-actions { display: flex; gap: 6px; margin-top: 12px; }
        .btn-edit, .btn-del {
          flex: 1; padding: 7px;
          border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; font-weight: 500; cursor: pointer;
          border: 1.5px solid; transition: all .15s;
        }
        .btn-edit {
          background: var(--cream); color: var(--text-mid);
          border-color: var(--cream-dark);
        }
        .btn-edit:hover { background: var(--cream-dark); border-color: var(--blush); }
        .btn-del {
          background: #FFF0F0; color: #C0392B;
          border-color: #F2C4C4;
        }
        .btn-del:hover { background: #FFE0E0; border-color: #E74C3C; }

        /* Delete confirm inline */
        .delete-confirm {
          background: #FFF8F8; border: 1.5px solid #F2C4C4;
          border-radius: 12px; padding: 14px; margin-top: 10px;
          animation: fadeIn .2s ease;
        }
        .delete-confirm p { font-size: 12.5px; color: var(--text-mid); margin-bottom: 10px; }
        .delete-confirm strong { color: var(--text-dark); }
        .confirm-btns { display: flex; gap: 8px; }
        .confirm-yes {
          flex: 1; padding: 8px;
          background: #E74C3C; color: white;
          border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: opacity .15s;
        }
        .confirm-yes:disabled { opacity: 0.6; cursor: not-allowed; }
        .confirm-no {
          flex: 1; padding: 8px;
          background: var(--cream); color: var(--text-mid);
          border: 1.5px solid var(--cream-dark); border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; cursor: pointer;
        }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(61,43,31,0.35); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px;
          animation: fadeIn .15s ease;
        }
        .modal {
          background: var(--white); border-radius: 24px;
          padding: 32px; width: 100%; max-width: 440px;
          box-shadow: 0 20px 60px rgba(61,43,31,0.2);
          animation: modalSlide .2s ease;
        }
        @keyframes modalSlide {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        .modal-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 24px;
        }
        .modal-header h3 {
          font-family: 'Playfair Display', serif;
          font-size: 18px; color: var(--text-dark); font-weight: 600;
        }
        .modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: none; background: var(--cream-dark); cursor: pointer;
          font-size: 16px; display: flex; align-items: center; justify-content: center;
          color: var(--text-mid); transition: background .15s;
        }
        .modal-close:hover { background: var(--blush-light); }

        .mform-group { margin-bottom: 16px; }
        .mform-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .mlabel {
          display: block; font-size: 11.5px; font-weight: 600;
          color: var(--text-mid); margin-bottom: 6px;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .minput {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid var(--cream-dark); border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: var(--text-dark); background: var(--cream);
          outline: none; transition: border-color .2s, background .2s;
        }
        .minput:focus { border-color: var(--blush); background: var(--white); }
        .mselect {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid var(--cream-dark); border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: var(--text-dark); background: var(--cream);
          outline: none; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B89A86' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }
        .mselect:focus { border-color: var(--blush); background-color: var(--white); }
        .mhint { font-size: 11px; color: var(--text-light); margin-top: 4px; }
        .merror {
          background: #FFF0F0; border: 1px solid #F2C4C4; border-radius: 9px;
          padding: 10px 13px; font-size: 13px; color: #C0392B;
          margin-bottom: 16px; display: flex; align-items: center; gap: 7px;
        }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
        .btn-cancel {
          padding: 10px 20px; background: var(--cream-dark);
          color: var(--text-mid); border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; cursor: pointer;
        }
        .btn-cancel:hover { background: var(--cream); }
        .btn-submit {
          padding: 10px 24px;
          background: linear-gradient(135deg, var(--warm-brown), #A0785A);
          color: white; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; cursor: pointer;
          box-shadow: 0 3px 12px rgba(139,107,82,0.25);
          transition: transform .15s, opacity .15s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Toast */
        .toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 200;
          padding: 13px 18px; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          font-weight: 500; display: flex; align-items: center; gap: 9px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          animation: toastIn .25s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
        .toast.success { background: #EDFBF2; color: #27AE60; border: 1px solid #A8E6BE; }
        .toast.error   { background: #FFF0F0; color: #C0392B; border: 1px solid #F2C4C4; }

        /* Empty / loading */
        .loading-state { text-align: center; padding: 48px; color: var(--text-light); }
        .spinner {
          width: 28px; height: 28px; border: 3px solid var(--cream-dark);
          border-top-color: var(--warm-brown); border-radius: 50%;
          animation: spin .8s linear infinite; margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state { text-align: center; padding: 48px; color: var(--text-light); font-size: 13px; }

        @media (max-width: 640px) {
          .mform-row { grid-template-columns: 1fr; }
          .modal { padding: 24px 20px; }
        }
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2>Manajemen Pengguna</h2>
            <span className="count-label">{users.length} akun</span>
          </div>
          <div className="header-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-add" onClick={openAdd}>
              <span style={{ fontSize: "16px" }}>＋</span> Tambah Pengguna
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"/>
            Memuat data pengguna...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {search ? `Tidak ada akun yang cocok dengan "${search}".` : "Belum ada pengguna."}
          </div>
        ) : (
          <div className="users-grid">
            {filtered.map((user) => (
              <div className="user-card" key={user.id}>
                {/* Top */}
                <div className="user-card-top">
                  <div className={`user-avatar${user.role === "admin" ? " admin-av" : ""}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="user-card-footer">
                  <span className="user-meta">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  <span className={`role-pill ${user.role}`}>{user.role}</span>
                </div>

                {/* Actions */}
                {deleteTarget?.id !== user.id && (
                  <div className="card-actions">
                    <button className="btn-edit" onClick={() => openEdit(user)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-del" onClick={() => setDeleteTarget(user)}>
                      🗑️ Hapus
                    </button>
                  </div>
                )}

                {/* Delete confirm */}
                {deleteTarget?.id === user.id && (
                  <div className="delete-confirm">
                    <p>Hapus akun <strong>{user.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
                    <div className="confirm-btns">
                      <button
                        className="confirm-yes"
                        disabled={deleteLoading}
                        onClick={() => handleDelete(user)}
                      >
                        {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => setDeleteTarget(null)}
                        disabled={deleteLoading}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Add / Edit ─────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === "add" ? "Tambah Pengguna Baru" : "Edit Pengguna"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {formError && (
              <div className="merror"><span>⚠️</span>{formError}</div>
            )}

            <div>
              <div className="mform-row">
                <div className="mform-group">
                  <label className="mlabel">Nama Lengkap</label>
                  <input
                    className="minput" type="text"
                    placeholder="Nama lengkap"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="mform-group">
                  <label className="mlabel">Role</label>
                  <select
                    className="mselect"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "admin" | "user" }))}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>

              <div className="mform-group">
                <label className="mlabel">Email</label>
                <input
                  className="minput" type="email"
                  placeholder="email@spmb.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="mform-group">
                <label className="mlabel">
                  {modalMode === "edit" ? "Password Baru" : "Password"}
                </label>
                <input
                  className="minput" type="password"
                  placeholder={modalMode === "edit" ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
                {modalMode === "edit" && (
                  <p className="mhint">Biarkan kosong untuk mempertahankan password lama.</p>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>Batal</button>
                <button
                  className="btn-submit"
                  disabled={formLoading}
                  onClick={modalMode === "add" ? handleAdd : handleEdit}
                >
                  {formLoading
                    ? (modalMode === "add" ? "Menambahkan..." : "Menyimpan...")
                    : (modalMode === "add" ? "Tambah Akun" : "Simpan Perubahan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </>
  );
}