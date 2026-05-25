"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Autocomplete email dari localStorage
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
        // Simpan email untuk autocomplete berikutnya
        localStorage.setItem("spmb_last_email", email);
        router.push("/dashboard");
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream:       #FDF6EE;
          --cream-dark:  #F5EAD8;
          --blush:       #F2C4C4;
          --blush-light: #FAE8E8;
          --sage:        #C8DDD1;
          --lavender:    #DDD2EE;
          --warm-brown:  #8B6B52;
          --text-dark:   #3D2B1F;
          --text-mid:    #7A5C48;
          --text-light:  #B89A86;
          --white:       #FFFFFF;
          --shadow:      rgba(139,107,82,0.15);
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Decorative blobs */
        body::before, body::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.45;
          pointer-events: none;
        }
        body::before {
          width: 500px; height: 500px;
          background: radial-gradient(circle, var(--blush) 0%, transparent 70%);
          top: -150px; right: -100px;
        }
        body::after {
          width: 400px; height: 400px;
          background: radial-gradient(circle, var(--sage) 0%, transparent 70%);
          bottom: -120px; left: -80px;
        }

        .login-card {
          background: var(--white);
          border-radius: 28px;
          padding: 52px 48px;
          width: 420px;
          box-shadow:
            0 4px 24px var(--shadow),
            0 1px 4px rgba(139,107,82,0.08);
          position: relative;
          z-index: 1;
          animation: floatIn .5s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes floatIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Accent bar top */
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 32px; right: 32px;
          height: 4px;
          border-radius: 0 0 8px 8px;
          background: linear-gradient(90deg, var(--blush), var(--lavender), var(--sage));
        }

        .brand {
          text-align: center;
          margin-bottom: 36px;
        }
        .brand-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, var(--blush-light), var(--cream-dark));
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          font-size: 26px;
          border: 1px solid var(--blush);
        }
        .brand h1 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: var(--text-dark);
          font-weight: 600;
          letter-spacing: -0.3px;
        }
        .brand p {
          font-size: 13px;
          color: var(--text-light);
          margin-top: 5px;
          font-weight: 300;
        }

        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-mid);
          margin-bottom: 8px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .input-wrap {
          position: relative;
        }
        .input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.45;
          pointer-events: none;
        }

        input[type="email"],
        input[type="password"],
        input[type="text"] {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border: 1.5px solid var(--cream-dark);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          color: var(--text-dark);
          background: var(--cream);
          transition: border-color .2s, box-shadow .2s, background .2s;
          outline: none;
        }
        input:focus {
          border-color: var(--blush);
          background: var(--white);
          box-shadow: 0 0 0 4px rgba(242,196,196,0.2);
        }

        .toggle-pass {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-light);
          font-size: 18px;
          padding: 2px;
          transition: color .2s;
        }
        .toggle-pass:hover { color: var(--warm-brown); }

        .error-msg {
          background: #FFF0F0;
          border: 1px solid #F2C4C4;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #C0392B;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake .3s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .btn-login {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--warm-brown), #A0785A);
          color: var(--white);
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          box-shadow: 0 4px 16px rgba(139,107,82,0.3);
          margin-top: 8px;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139,107,82,0.4);
        }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

        .footer-note {
          text-align: center;
          font-size: 12px;
          color: var(--text-light);
          margin-top: 24px;
        }
        .footer-note span {
          display: inline-block;
          background: var(--cream-dark);
          border-radius: 6px;
          padding: 4px 10px;
          font-weight: 500;
          color: var(--text-mid);
        }

        .lavender-dot {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--lavender);
          margin-right: 6px;
        }
      `}</style>

      <div className="login-card">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <h1>SPMB Dashboard</h1>
          <p>Sistem Penerimaan Mahasiswa Baru</p>
        </div>

        {error && (
          <div className="error-msg">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrap">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input
                type="email"
                placeholder="email@spmb.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
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
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Memverifikasi..." : "Masuk →"}
          </button>
        </form>

        <div className="footer-note">
          Demo: <span>admin@spmb.com</span> / <span>admin123</span>
        </div>
      </div>
    </>
  );
}