"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("spmb_last_email");
    if (saved) setEmail(saved);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
      } else {
        localStorage.setItem("spmb_last_email", email);
        if (data.user?.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/pendaftaran");
        }
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green: #1C5C38; --green-hover: #2A7A4E;
          --text-dark: #0C0C0C;
          --card-bg: rgba(255,255,255,0.12); --card-border: rgba(255,255,255,0.2);
          --input-bg: rgba(255,255,255,0.9); --input-border: rgba(255,255,255,0.4);
        }
        body { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; margin: 0; }
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; padding: 24px 16px;
        }
        .auth-bg { position: fixed !important; inset: 0 !important; z-index: 0 !important; }
        .auth-content {
          position: relative; z-index: 1; display: flex; flex-direction: column;
          align-items: center; width: 100%; max-width: 440px;
        }
        .auth-card {
          background: var(--card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--card-border); border-radius: 24px; padding: 48px 40px;
          width: 100%; animation: floatIn .5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes floatIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .brand { text-align: center; margin-bottom: 32px; }
        .brand-icon {
          width: 56px; height: 56px; background: var(--green); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px;
        }
        .brand h1 {
          font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700;
          color: var(--text-dark); letter-spacing: -0.3px; line-height: 1.3;
        }
        .brand p { font-size: 13px; color: var(--text-dark); margin-top: 8px; opacity: 0.75; line-height: 1.6; }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .label-row label { margin-bottom: 0; }
        .forgot-link { font-size: 12px; font-weight: 500; color: var(--green); text-decoration: none; }
        .forgot-link:hover { text-decoration: underline; }
        .input-wrap { position: relative; }
        .input-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-dark); opacity: 0.45; pointer-events: none; }
        input[type="email"], input[type="password"], input[type="text"], input[type="tel"] {
          width: 100%; padding: 13px 48px 13px 42px; border: 1.5px solid var(--input-border);
          border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px;
          color: var(--text-dark); background: var(--input-bg); transition: border-color .2s, box-shadow .2s; outline: none;
        }
        input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(28,92,56,0.15); }
        .toggle-pass {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-dark); opacity: 0.5;
          padding: 4px; line-height: 0; display: flex; align-items: center; justify-content: center; transition: opacity .2s;
        }
        .toggle-pass:hover { opacity: 0.8; }
        .error-msg {
          background: rgba(255,240,240,0.9); border: 1px solid rgba(242,196,196,0.8); border-radius: 10px;
          padding: 11px 14px; font-size: 13px; color: #C0392B; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px; animation: shake .3s ease;
        }
        @keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
        .btn-submit {
          width: 100%; padding: 14px; background: var(--green); color: #fff; border: none; border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: background .2s, opacity .2s; margin-top: 8px;
        }
        .btn-submit:hover:not(:disabled) { background: var(--green-hover); }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .card-footer { text-align: center; font-size: 13px; color: var(--text-dark); margin-top: 24px; opacity: 0.75; }
        .card-footer a { color: var(--green); font-weight: 600; text-decoration: none; }
        .card-footer a:hover { text-decoration: underline; }
        .page-footer { margin-top: 20px; font-size: 11px; color: #fff; opacity: 0.5; text-align: center; }
        @media (max-width: 480px) {
          .auth-card { padding: 32px 20px; border-radius: 16px; }
          .brand h1 { font-size: 18px; }
        }
      `}</style>

      <div className="auth-page">
        <Image className="auth-bg" src="/sekolah/kegiatan.jpg" alt="" fill priority quality={85} style={{ objectFit: "cover" }} />
        <div className="auth-content">
          <div className="auth-card">
            <div className="brand">
              <Image src="/logo-smk.png" alt="Logo SMK Citra Negara" width={64} height={64} style={{ objectFit: "contain", marginBottom: 8, display: "block", margin: "0 auto 8px" }} priority />
              <h1>Login Pendaftaran Citra Negara</h1>
              <p>Masuk ke portal pendaftaran Citra Negara untuk melanjutkan proses admisi Anda.</p>
            </div>

            {error && (
              <div className="error-msg">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email atau Username</label>
                <div className="input-wrap">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="email@spmb.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9@._+-]/g, ""))}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>Kata Sandi</label>
                  <a href="#" className="forgot-link">Lupa Password?</a>
                </div>
                <div className="input-wrap">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}>
                    {showPass ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Memverifikasi..." : "Masuk Sekarang →"}
              </button>
            </form>

            <div className="card-footer">
              Belum punya akun? <a href="/register">Daftar Sekarang</a>
            </div>
          </div>
          <p className="page-footer">© 2026 SMK Citra Negara. All rights reserved</p>
        </div>
      </div>
    </>
  );
}
