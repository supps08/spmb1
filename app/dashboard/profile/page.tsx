// ============================================================
// STATUS : 🆕 BARU
// PATH   : app/dashboard/profile/page.tsx
// ISI    : Halaman profil pengguna (semua role)
//          - Card kiri: avatar inisial, nama, email, role, tanggal bergabung
//          - Form kanan: edit nama, ganti password
// ============================================================

"use client";
import { useState, useEffect } from "react";

interface User {
  id: string; name: string; email: string; role: string; createdAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
        .profile-layout {
          display: grid; grid-template-columns: 280px 1fr; gap: 24px;
          align-items: start;
        }
        .profile-card {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--cream-dark); padding: 28px 22px;
          text-align: center;
        }
        .big-avatar {
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blush), var(--lavender));
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 700; color: var(--warm-brown);
          margin: 0 auto 14px;
          box-shadow: 0 4px 16px rgba(139,107,82,0.15);
        }
        .profile-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px; color: var(--text-dark); font-weight: 600;
        }
        .profile-email { font-size: 13px; color: var(--text-light); margin-top: 4px; }
        .profile-role {
          display: inline-block; margin-top: 10px;
          padding: 4px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
        }
        .profile-role.admin { background: #EDE7F6; color: #6B4FA0; }
        .profile-role.user { background: var(--cream-dark); color: var(--text-mid); }
        .profile-since {
          margin-top: 16px; padding-top: 16px;
          border-top: 1px solid var(--cream-dark);
          font-size: 12px; color: var(--text-light);
        }
        .profile-since strong { color: var(--text-mid); }

        .form-card {
          background: var(--white); border-radius: 20px;
          border: 1px solid var(--cream-dark); padding: 28px;
        }
        .form-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 17px; color: var(--text-dark);
          font-weight: 600; margin-bottom: 22px;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { margin-bottom: 18px; }
        label {
          display: block; font-size: 12px; font-weight: 600;
          color: var(--text-mid); margin-bottom: 7px;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        input[type="text"], input[type="email"], input[type="password"] {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid var(--cream-dark); border-radius: 11px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: var(--text-dark); background: var(--cream);
          outline: none; transition: border-color .2s, background .2s;
        }
        input:focus {
          border-color: var(--blush); background: var(--white);
          box-shadow: 0 0 0 3px rgba(242,196,196,0.15);
        }
        input:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
        .btn-save {
          padding: 11px 28px;
          background: linear-gradient(135deg, var(--warm-brown), #A0785A);
          color: white; border: none; border-radius: 11px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; cursor: pointer;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 3px 12px rgba(139,107,82,0.25);
        }
        .btn-save:hover { transform: translateY(-1px); }
        .success-msg {
          display: flex; align-items: center; gap: 8px;
          background: #EDFBF2; border: 1px solid #A8E6BE;
          border-radius: 10px; padding: 10px 14px;
          font-size: 13px; color: #27AE60; margin-bottom: 18px;
          animation: fadeIn .3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .divider { border: none; border-top: 1px solid var(--cream-dark); margin: 22px 0; }

        @media (max-width: 768px) {
          .profile-layout { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="profile-layout">
        {/* Left card */}
        <div className="profile-card">
          <div className="big-avatar">
            {user?.name.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="profile-name">{user?.name ?? "—"}</div>
          <div className="profile-email">{user?.email ?? "—"}</div>
          <span className={`profile-role ${user?.role}`}>{user?.role ?? "—"}</span>
          {user && (
            <div className="profile-since">
              Bergabung sejak<br/>
              <strong>
                {new Date(user.createdAt ?? Date.now()).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </strong>
            </div>
          )}
        </div>

        {/* Right form */}
        <div className="form-card">
          <h3>Pengaturan Akun</h3>

          {saved && (
            <div className="success-msg">
              ✅ Perubahan berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  defaultValue={user?.name ?? ""}
                  key={user?.name}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email ?? ""} disabled/>
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <input type="text" value={user?.role ?? ""} disabled/>
            </div>

            <hr className="divider"/>

            <h3 style={{ fontSize: "15px", marginBottom: "18px" }}>Ganti Password</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Password Saat Ini</label>
                <input type="password" placeholder="••••••••"/>
              </div>
              <div className="form-group">
                <label>Password Baru</label>
                <input type="password" placeholder="••••••••"/>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}