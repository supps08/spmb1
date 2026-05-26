// ============================================================
// STATUS : 🆕 BARU
// PATH   : app/dashboard/profile/page.tsx
// ISI    : Halaman profil pengguna (semua role)
//          - Card kiri: avatar, nama, email, role, tanggal bergabung
//          - Form kanan: edit nama, ganti password, upload avatar
// ============================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  avatar_url?: string | null;
}

type ToastState = { msg: string; type: "success" | "error" } | null;

const ACCEPTED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ProfilePage() {
  useScrollAnimation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sideFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const d = await res.json();
        const u = d.user as User | null;
        setUser(u);
        setName(u?.name ?? "");
        setAvatarPreview(u?.avatar_url ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama lengkap wajib diisi.", "error");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menyimpan nama.", "error");
        return;
      }
      setUser(data.user);
      setName(data.user.name);
      showToast("Nama berhasil diperbarui.", "success");
    } catch {
      showToast("Gagal menyimpan nama.", "error");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast("Isi password baru dan konfirmasi.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Konfirmasi password tidak cocok.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password minimal 6 karakter.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        showToast(error.message || "Gagal mengubah password.", "error");
        return;
      }
      setPassword("");
      setConfirmPassword("");
      showToast("Password berhasil diperbarui.", "success");
    } catch {
      showToast("Gagal mengubah password.", "error");
    } finally {
      setSavingPassword(false);
    }
  }

  async function uploadAvatarFile(file: File) {
    if (!user) return;
    if (!ACCEPTED_IMAGE.includes(file.type)) {
      showToast("Format file harus JPG, PNG, WebP, atau GIF.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran file maksimal 2 MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        showToast(
          uploadError.message.includes("Bucket not found")
            ? "Bucket storage 'avatars' belum dikonfigurasi di Supabase."
            : uploadError.message || "Gagal mengunggah foto.",
          "error"
        );
        setAvatarPreview(user.avatar_url ?? null);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: urlData.publicUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menyimpan URL avatar.", "error");
        setAvatarPreview(user.avatar_url ?? null);
        return;
      }

      URL.revokeObjectURL(localPreview);
      setUser(data.user);
      setAvatarPreview(data.user.avatar_url ?? urlData.publicUrl);
      showToast("Foto profil berhasil diperbarui.", "success");
    } catch {
      showToast("Gagal mengunggah foto.", "error");
      setAvatarPreview(user.avatar_url ?? null);
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadAvatarFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAvatarFile(file);
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const displayAvatar = avatarPreview;
  const initial = (user?.name ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .profile-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          align-items: start;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .profile-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 28px 24px;
          text-align: center;
        }

        .avatar-wrap {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
        }

        .big-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #EBF4EE;
          color: #1C5C38;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .big-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-camera {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 16px;
          padding: 8px 14px;
          background: #F2F8F4;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-camera:hover:not(:disabled) {
          background: #EBF4EE;
          border-color: #1C5C38;
          color: #1C5C38;
        }

        .btn-camera:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0C0C0C;
          line-height: 1.2;
        }

        .profile-role {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          background: #EBF4EE;
          color: #1C5C38;
        }

        .profile-meta {
          margin-top: 14px;
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
        }

        .profile-meta strong {
          display: block;
          color: #0C0C0C;
          font-weight: 600;
          margin-top: 2px;
        }

        .profile-since {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #6B7280;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
        }

        .form-section h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #0C0C0C;
          margin-bottom: 18px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-of-type {
          margin-bottom: 0;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          color: #0C0C0C;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input:focus {
          border-color: #1C5C38;
          box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
        }

        .field-input:disabled {
          background: #F9FAFB;
          color: #6B7280;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .btn-save {
          padding: 10px 22px;
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

        .btn-save:hover:not(:disabled) {
          background: #2A7A4E;
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .drop-zone {
          border: 2px dashed #E5E7EB;
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .drop-zone.drag-over,
        .drop-zone:hover {
          border-color: #1C5C38;
          background: #F2F8F4;
        }

        .drop-zone p {
          font-size: 14px;
          color: #374151;
          margin-bottom: 4px;
        }

        .drop-zone span {
          font-size: 12px;
          color: #6B7280;
        }

        .avatar-preview-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .preview-thumb {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #EBF4EE;
          color: #1C5C38;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .preview-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-label {
          font-size: 13px;
          color: #6B7280;
        }

        .hidden-input {
          display: none;
        }

        /* Skeleton */
        .skeleton-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 28px 24px;
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
          margin: 0 auto;
        }

        .skeleton-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-bottom: 16px;
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

        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {loading ? (
        <div className="profile-layout">
          <div className="skeleton-card" data-animate data-delay="0">
            <div className="skeleton-line skeleton-avatar" />
            <div className="skeleton-line" style={{ height: 18, width: "60%", marginBottom: 10 }} />
            <div className="skeleton-line" style={{ height: 14, width: "80%" }} />
          </div>
          <div className="form-column">
            {[0, 100, 200].map((delay) => (
              <div
                key={delay}
                className="skeleton-card"
                data-animate
                data-delay={String(delay)}
                style={{ padding: 24 }}
              >
                <div className="skeleton-line" style={{ height: 16, width: 140, marginBottom: 20, marginLeft: 0 }} />
                <div className="skeleton-line" style={{ height: 40, width: "100%", marginLeft: 0 }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="profile-layout">
          <aside className="profile-card" data-animate data-delay="0">
            <div className="avatar-wrap">
              <div className="big-avatar">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={user?.name ?? "Avatar"} />
                ) : (
                  initial
                )}
              </div>
            </div>
            <div className="profile-name">{user?.name ?? "—"}</div>
            <span className="profile-role">{user?.role ?? "—"}</span>
            <div className="profile-meta">
              {user?.email ?? "—"}
            </div>
            <div className="profile-since">
              Bergabung sejak
              <br />
              <strong>{joinedDate}</strong>
            </div>
            <button
              type="button"
              className="btn-camera"
              disabled={uploadingAvatar}
              onClick={() => sideFileInputRef.current?.click()}
            >
              <Camera size={16} />
              {uploadingAvatar ? "Mengunggah..." : "Ubah Foto"}
            </button>
            <input
              ref={sideFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden-input"
              onChange={handleFileChange}
            />
          </aside>

          <div className="form-column">
            <section className="form-section" data-animate data-delay="100">
              <h3>Informasi Dasar</h3>
              <form onSubmit={handleSaveName}>
                <div className="form-group">
                  <label htmlFor="profile-name">Nama Lengkap</label>
                  <input
                    id="profile-name"
                    type="text"
                    className="field-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    className="field-input"
                    value={user?.email ?? ""}
                    disabled
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={savingName}
                  >
                    {savingName ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </section>

            <section className="form-section" data-animate data-delay="200">
              <h3>Ubah Password</h3>
              <form onSubmit={handleSavePassword}>
                <div className="form-group">
                  <label htmlFor="new-password">Password Baru</label>
                  <input
                    id="new-password"
                    type="password"
                    className="field-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Konfirmasi Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="field-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={savingPassword}
                  >
                    {savingPassword ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </section>

            <section className="form-section" data-animate data-delay="300">
              <h3>Upload Avatar</h3>
              <div
                className={`drop-zone${dragOver ? " drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <p>Seret & lepas foto di sini</p>
                <span>atau klik untuk memilih file (JPG, PNG, WebP, GIF · maks. 2 MB)</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden-input"
                onChange={handleFileChange}
              />
              {(displayAvatar || user) && (
                <div className="avatar-preview-row">
                  <div className="preview-thumb">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Preview" />
                    ) : (
                      initial
                    )}
                  </div>
                  <span className="preview-label">Pratinjau foto profil</span>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
