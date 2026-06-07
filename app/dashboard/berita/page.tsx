"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, X } from "lucide-react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface BeritaRow {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string | null;
  konten?: string | null;
  thumbnail_url: string | null;
  kategori: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface FormState {
  judul: string;
  ringkasan: string;
  konten: string;
  kategori: string;
  thumbnail_url: string;
  is_published: boolean;
}

const KATEGORI_OPTIONS = ["umum", "akademik", "prestasi", "pengumuman"];

const emptyForm: FormState = {
  judul: "",
  ringkasan: "",
  konten: "",
  kategori: "umum",
  thumbnail_url: "",
  is_published: false,
};

function formatDate(ts: string | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardBeritaPage() {
  useScrollAnimation();

  const [berita, setBerita] = useState<BeritaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchBerita = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/berita");
      if (res.ok) {
        const d = await res.json();
        setBerita(d.berita ?? []);
      }
    } catch {
      showToast("Gagal memuat berita.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBerita();
  }, [fetchBerita]);

  function openCreate() {
    setEditingSlug(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function openEdit(row: BeritaRow) {
    setEditingSlug(row.slug);
    setForm({
      judul: row.judul,
      ringkasan: row.ringkasan ?? "",
      konten: "",
      kategori: row.kategori,
      thumbnail_url: row.thumbnail_url ?? "",
      is_published: row.is_published,
    });
    setModalOpen(true);

    try {
      const res = await fetch(`/api/berita/${encodeURIComponent(row.slug)}`);
      if (res.ok) {
        const d = await res.json();
        if (d.berita?.konten) {
          setForm((prev) => ({ ...prev, konten: d.berita.konten }));
        }
      }
    } catch {
      /* keep partial form */
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSlug(null);
    setForm(emptyForm);
  }

  async function save(publish: boolean) {
    if (!form.judul.trim()) {
      showToast("Judul wajib diisi.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      judul: form.judul,
      ringkasan: form.ringkasan,
      konten: form.konten,
      kategori: form.kategori,
      thumbnail_url: form.thumbnail_url || null,
      is_published: publish,
    };

    try {
      const url = editingSlug
        ? `/api/berita/${encodeURIComponent(editingSlug)}`
        : "/api/berita";
      const method = editingSlug ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error ?? "Gagal menyimpan.", "error");
        return;
      }

      const resData = await res.json().catch(() => ({}));

      // Kalau slug berubah (judul diedit), update editingSlug ke slug baru
      if (resData.slugChanged && resData.berita?.slug) {
        setEditingSlug(resData.berita.slug);
      }

      showToast(publish ? "Berita dipublikasikan." : "Draft disimpan.");
      closeModal();
      fetchBerita();
    } catch {
      showToast("Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string, judul: string) {
    if (!window.confirm(`Hapus berita "${judul}"?`)) return;

    try {
      const res = await fetch(`/api/berita/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast("Gagal menghapus.", "error");
        return;
      }
      showToast("Berita dihapus.");
      fetchBerita();
    } catch {
      showToast("Gagal menghapus.", "error");
    }
  }

  return (
    <>
      <style>{`
        .berita-dash { font-family: 'Plus Jakarta Sans', sans-serif; display: flex; flex-direction: column; gap: 20px; }
        .berita-dash-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .berita-dash-header h1 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; color: #0C0C0C; }
        .btn-tulis {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; background: #1C5C38; color: #fff;
          border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
        }
        .btn-tulis:hover { background: #164a2e; }
        .berita-table-wrap {
          background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;
        }
        .berita-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .berita-table th {
          text-align: left; padding: 12px 16px; background: #F9FAFB;
          font-weight: 600; color: #6B7280; border-bottom: 1px solid #E5E7EB;
        }
        .berita-table td {
          padding: 14px 16px; border-bottom: 1px solid #F3F4F6; color: #374151;
          vertical-align: middle;
        }
        .berita-table tr:last-child td { border-bottom: none; }
        .berita-table .judul-cell { font-weight: 600; color: #0C0C0C; max-width: 280px; }
        .badge-published {
          display: inline-block; padding: 4px 10px; border-radius: 9999px;
          font-size: 11px; font-weight: 600; background: #D1FAE5; color: #065F46;
        }
        .badge-draft {
          display: inline-block; padding: 4px 10px; border-radius: 9999px;
          font-size: 11px; font-weight: 600; background: #F3F4F6; color: #6B7280;
        }
        .aksi-btns { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .aksi-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
          border: 1px solid #E5E7EB; background: #fff; color: #374151;
          cursor: pointer; text-decoration: none; font-family: inherit;
        }
        .aksi-btn:hover { background: #F9FAFB; }
        .aksi-btn.danger { color: #DC2626; border-color: #FECACA; }
        .aksi-btn.danger:hover { background: #FEF2F2; }
        .berita-empty-row { text-align: center; padding: 40px; color: #6B7280; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 100; display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .modal-box {
          background: #fff; border-radius: 12px; width: 100%; max-width: 560px;
          max-height: 90vh; overflow-y: auto; padding: 24px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.15);
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .modal-header h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700; }
        .modal-close { border: none; background: none; cursor: pointer; color: #6B7280; padding: 4px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; padding: 10px 12px; border: 1px solid #E5E7EB; border-radius: 8px;
          font-family: inherit; font-size: 14px; color: #0C0C0C;
        }
        .form-group textarea { resize: vertical; min-height: 80px; }
        .form-group textarea.konten { min-height: 200px; }
        .toggle-row { display: flex; align-items: center; gap: 10px; }
        .toggle-row input { width: auto; }
        .modal-actions { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .btn-draft {
          flex: 1; padding: 10px 16px; border: 1px solid #E5E7EB; border-radius: 8px;
          background: #fff; font-weight: 600; cursor: pointer; font-family: inherit;
        }
        .btn-publish {
          flex: 1; padding: 10px 16px; border: none; border-radius: 8px;
          background: #1C5C38; color: #fff; font-weight: 600; cursor: pointer; font-family: inherit;
        }
        .btn-publish:disabled, .btn-draft:disabled { opacity: 0.6; cursor: not-allowed; }
        .toast {
          position: fixed; bottom: 24px; right: 24px; z-index: 200;
          padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .toast.success { background: #1C5C38; color: #fff; }
        .toast.error { background: #DC2626; color: #fff; }
        @media (max-width: 768px) {
          .berita-table-wrap { overflow-x: auto; }
          .berita-table { min-width: 640px; }
        }
      `}</style>

      <div className="berita-dash">
        <div className="berita-dash-header">
          <h1>Manajemen Berita</h1>
          <button type="button" className="btn-tulis" onClick={openCreate}>
            <Plus size={18} />
            Tulis Berita
          </button>
        </div>

        <div className="berita-table-wrap">
          <table className="berita-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="berita-empty-row">
                    Memuat...
                  </td>
                </tr>
              ) : berita.length === 0 ? (
                <tr>
                  <td colSpan={5} className="berita-empty-row">
                    Belum ada berita.
                  </td>
                </tr>
              ) : (
                berita.map((row) => (
                  <tr key={row.id}>
                    <td className="judul-cell">{row.judul}</td>
                    <td>{row.kategori}</td>
                    <td>
                      {row.is_published ? (
                        <span className="badge-published">Published</span>
                      ) : (
                        <span className="badge-draft">Draft</span>
                      )}
                    </td>
                    <td>{formatDate(row.published_at ?? row.created_at)}</td>
                    <td>
                      <div className="aksi-btns">
                        <button
                          type="button"
                          className="aksi-btn"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="aksi-btn danger"
                          onClick={() => handleDelete(row.slug, row.judul)}
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                        <Link
                          href={`/berita/${row.slug}`}
                          className="aksi-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                          Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSlug ? "Edit Berita" : "Tulis Berita"}</h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Tutup">
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="judul">Judul</label>
              <input
                id="judul"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Judul berita"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ringkasan">Ringkasan</label>
              <textarea
                id="ringkasan"
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                placeholder="Ringkasan singkat untuk kartu berita"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="konten">Konten</label>
              <textarea
                id="konten"
                className="konten"
                value={form.konten}
                onChange={(e) => setForm({ ...form, konten: e.target.value })}
                placeholder="Isi artikel (pisahkan paragraf dengan baris kosong; gunakan ## untuk subjudul)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="kategori">Kategori</label>
              <select
                id="kategori"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                {KATEGORI_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">Thumbnail URL</label>
              <input
                id="thumbnail"
                type="url"
                value={form.thumbnail_url}
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <div className="toggle-row">
                <input
                  id="published"
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                />
                <label htmlFor="published">Published</label>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-draft"
                disabled={saving}
                onClick={() => save(false)}
              >
                Simpan Draft
              </button>
              <button
                type="button"
                className="btn-publish"
                disabled={saving}
                onClick={() => save(true)}
              >
                {saving ? "Menyimpan..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}