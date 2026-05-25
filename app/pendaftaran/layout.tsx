// ============================================================
// PATH : app/pendaftaran/layout.tsx
// ISI  : Layout wrapper halaman pendaftaran (user only)
//        - Navbar sederhana
//        - Trust badges di bawah
// ============================================================

import Link from "next/link";

export default function PendaftaranLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --accent: #1C5C38;
          --accent-mid: #2A7A4E;
          --accent-light: #EBF4EE;
          --ink: #0C0C0C;
          --muted: #6B7280;
          --border: #E5E7EB;
          --bg: #F9FAFB;
          --white: #FFFFFF;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--ink);
        }
        .pend-navbar {
          position: sticky; top: 0; z-index: 50;
          background: var(--white);
          border-bottom: 1px solid var(--border);
          height: 60px;
          display: flex; align-items: center;
        }
        .pend-navbar-inner {
          max-width: 800px; margin: 0 auto; padding: 0 24px;
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pend-logo {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 1rem;
          color: var(--ink); text-decoration: none;
          letter-spacing: -0.02em;
        }
        .pend-logo span { color: var(--accent); }
        .pend-nav-links {
          display: flex; align-items: center; gap: 24px; list-style: none;
        }
        .pend-nav-links a {
          font-size: 0.85rem; font-weight: 500; color: var(--muted);
          text-decoration: none; transition: color .2s;
        }
        .pend-nav-links a:hover { color: var(--ink); }
        .pend-nav-links a.active {
          color: var(--accent); font-weight: 600;
          border-bottom: 2px solid var(--accent); padding-bottom: 2px;
        }

        .pend-main {
          max-width: 800px; margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .pend-page-header {
          text-align: center; margin-bottom: 40px;
        }
        .pend-page-header h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2rem; font-weight: 800; color: var(--ink);
          letter-spacing: -0.03em; margin-bottom: 8px;
        }
        .pend-page-header p {
          font-size: 0.92rem; color: var(--muted); line-height: 1.6;
        }

        .trust-badges {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 12px; margin-top: 32px;
        }
        .trust-badge {
          background: var(--white);
          border: 1px solid var(--border); border-radius: 10px;
          padding: 14px 16px;
          display: flex; align-items: flex-start; gap: 10px;
        }
        .trust-badge-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .trust-badge-icon.green { background: var(--accent-light); }
        .trust-badge-icon.yellow { background: #FEF3C7; }
        .trust-badge-icon.blue { background: #EFF6FF; }
        .trust-badge-title {
          font-size: 0.8rem; font-weight: 700; color: var(--ink); margin-bottom: 2px;
        }
        .trust-badge-title.green { color: var(--accent); }
        .trust-badge-title.yellow { color: #D97706; }
        .trust-badge-title.blue { color: #2563EB; }
        .trust-badge-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.4; }

        @media (max-width: 600px) {
          .trust-badges { grid-template-columns: 1fr; }
          .pend-nav-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="pend-navbar">
        <div className="pend-navbar-inner">
          <Link href="/" className="pend-logo">
            SMK <span>Citra Negara</span>
          </Link>
          <ul className="pend-nav-links">
            <li><Link href="/">Beranda</Link></li>
            <li><Link href="/pendaftaran" className="active">Pendaftaran</Link></li>
            <li><Link href="/hasil-seleksi">Hasil Seleksi</Link></li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <main className="pend-main">
        <div className="pend-page-header">
          <h1>Formulir Pendaftaran</h1>
          <p>Lengkapi data diri Anda untuk memulai masa depan digital.</p>
        </div>

        {children}

        {/* Trust badges */}
        <div className="trust-badges">
          <div className="trust-badge">
            <div className="trust-badge-icon green">🛡️</div>
            <div>
              <div className="trust-badge-title green">Data Terenkripsi</div>
              <div className="trust-badge-desc">Informasi kamu aman bersama sistem kami.</div>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-badge-icon yellow">⚡</div>
            <div>
              <div className="trust-badge-title yellow">Proses Cepat</div>
              <div className="trust-badge-desc">Estimasi pendaftaran hanya 10 menit.</div>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-badge-icon blue">🎧</div>
            <div>
              <div className="trust-badge-title blue">Butuh Bantuan?</div>
              <div className="trust-badge-desc">Hubungi CS kami di 0800-123-456.</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}