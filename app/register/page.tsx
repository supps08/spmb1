"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState(0);

  function calcStrength(pw: string) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === "password") setStrength(calcStrength(value));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Password dan konfirmasi tidak cocok."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registrasi gagal."); }
      else { router.push("/dashboard"); }
    } catch { setError("Koneksi gagal. Coba lagi."); }
    finally { setLoading(false); }
  }

  const strengthLabel = ["", "Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "#E74C3C", "#E67E22", "#F1C40F", "#2ECC71", "#27AE60"][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green-dark: #1A2E1A; --green-mid: #2D4A2D; --green-soft: #3D6B3D;
          --gold: #D4A843; --gold-light: #F0C85A; --gold-pale: #FDF5E0;
          --cream: #FAFAF5; --white: #FFFFFF; --text-dark: #1A2E1A;
          --text-mid: #3D4D3D; --text-light: #7A8F7A; --border: #E0E8DA;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh; display: flex;
          align-items: stretch; background: var(--green-dark);
        }
        .reg-left {
          flex: 1; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, var(--green-dark) 0%, var(--green-mid) 60%, var(--green-soft) 100%);
          padding: 60px; position: relative; overflow: hidden;
        }
        .reg-left::before {
          content: ''; position: absolute; top: -100px; left: -100px;
          width: 400px; height: 400px;
          border: 1px solid rgba(212,168,67,0.12); border-radius: 50%;
        }
        .left-content { position: relative; z-index: 1; max-width: 360px; }
        .left-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .left-logo-icon { width: 46px; height: 46px; border-radius: 13px; background: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .left-logo-text { font-family: 'DM Serif Display', serif; font-size: 20px; color: white; }
        .left-logo-sub { font-size: 11.5px; color: rgba(255,255,255,0.55); margin-top: 2px; }
        .left-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: white; line-height: 1.2; margin-bottom: 16px; }
        .left-title span { color: var(--gold); }
        .left-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 36px; }
        .feature-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-item { display: flex; align-items: center; gap: 12px; font-size: 13.5px; color: rgba(255,255,255,0.8); }
        .feature-check { width: 22px; height: 22px; border-radius: 6px; background: rgba(212,168,67,0.2); border: 1px solid rgba(212,168,67,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }

        .reg-right {
          width: 500px; background: var(--white);
          display: flex; align-items: center; justify-content: center;
          padding: 48px 56px; overflow-y: auto;
        }
        .form-box { width: 100%; }
        .form-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--text-dark); margin-bottom: 6px; }
        .form-sub { font-size: 13.5px; color: var(--text-light); margin-bottom: 28px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-mid); margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
        .input-wrap { position: relative; }
        .input-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); opacity: 0.4; pointer-events: none; }
        input[type="text"], input[type="email"], input[type="password"] {
          width: 100%; padding: 12px 14px 12px 44px;
          border: 1.5px solid var(--border); border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
          color: var(--text-dark); background: var(--cream); outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        input:focus { border-color: var(--green-soft); background: var(--white); box-shadow: 0 0 0 4px rgba(61,107,61,0.1); }
        .toggle-pass { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-light); font-size: 17px; padding: 2px; transition: color .2s; }
        .toggle-pass:hover { color: var(--green-soft); }
        .strength-bar { margin-top: 8px; display: flex; gap: 4px; align-items: center; }
        .strength-seg { height: 3px; flex: 1; border-radius: 4px; background: var(--border); transition: background .3s; }
        .strength-label { font-size: 11px; color: var(--text-light); margin-left: 6px; min-width: 72px; }
        .error-msg { background: #FFF5F5; border: 1px solid #FFCCCC; border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #C0392B; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; animation: shake .3s ease; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .btn-reg {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
          color: white; border: none; border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.3px;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          box-shadow: 0 4px 16px rgba(26,46,26,0.3); margin-top: 6px;
          position: relative; overflow: hidden;
        }
        .btn-reg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 0%, rgba(212,168,67,0.12) 100%); }
        .btn-reg:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,46,26,0.4); }
        .btn-reg:active:not(:disabled) { transform: translateY(0); }
        .btn-reg:disabled { opacity: 0.65; cursor: not-allowed; }
        .form-footer { text-align: center; font-size: 13px; color: var(--text-light); margin-top: 22px; }
        .form-footer a { color: var(--green-soft); font-weight: 600; text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }

        @media (max-width: 900px) {
          body { flex-direction: column; background: var(--cream); }
          .reg-left { display: none; }
          .reg-right { width: 100%; min-height: 100vh; padding: 40px 24px; }
        }
      `}</style>

      <div className="reg-left">
        <div className="left-content">
          <div className="left-logo">
            <div className="left-logo-icon">🏫</div>
            <div>
              <div className="left-logo-text">SPMB Citra Negara</div>
              <div className="left-logo-sub">SMK Digital Nusantara</div>
            </div>
          </div>
          <h1 className="left-title">Bergabunglah &<br />Raih <span>Masa Depanmu</span></h1>
          <p className="left-desc">Daftar sekarang dan jadilah bagian dari komunitas talenta digital terbaik Indonesia.</p>
          <div className="feature-list">
            {["Akses kurikulum berbasis industri terkini","Lab berstandar Apple & fasilitas premium","Program magang di perusahaan luar negeri","12+ sertifikasi internasional bergengsi","Jaringan alumni di 200+ perusahaan top"].map(f=>(
              <div className="feature-item" key={f}>
                <div className="feature-check">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reg-right">
        <div className="form-box">
          <h1 className="form-title">Buat Akun Baru</h1>
          <p className="form-sub">Daftar ke portal SPMB Citra Negara</p>

          {error && <div className="error-msg"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div className="input-wrap">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <input type="text" name="name" placeholder="Nama Lengkap" value={form.name} onChange={handleChange} required autoComplete="name"/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrap">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input type="email" name="email" placeholder="email@spmb.com" value={form.email} onChange={handleChange} required autoComplete="email"/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input type={showPass ? "text" : "password"} name="password" placeholder="Min. 6 karakter" value={form.password} onChange={handleChange} required/>
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>
              </div>
              {form.password && (
                <div className="strength-bar">
                  {[1,2,3,4,5].map(i=>(
                    <div key={i} className="strength-seg" style={{background: i <= strength ? strengthColor : undefined}}/>
                  ))}
                  <span className="strength-label" style={{color: strengthColor || undefined}}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password</label>
              <div className="input-wrap">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"} name="confirm"
                  placeholder="Ulangi password" value={form.confirm} onChange={handleChange} required
                  style={{borderColor: form.confirm && form.confirm !== form.password ? "#FFCCCC" : undefined}}
                />
              </div>
            </div>

            <button type="submit" className="btn-reg" disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar Sekarang →"}
            </button>
          </form>

          <div className="form-footer">
            Sudah punya akun? <Link href="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </>
  );
}