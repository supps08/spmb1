// ============================================================
// PATH : app/pendaftaran/layout.tsx
// ISI  : Layout wrapper halaman pendaftaran (user only)
//        - Navbar sederhana
//        - Trust badges di bawah
// ============================================================

import LandingFooter from "@/components/landing/footer";
import LandingNavbar from "@/components/landing/navbar";

export default function PendaftaranLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
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
        .pend-main {
          max-width: 800px; margin: 0 auto;
          padding: 108px 24px 80px;
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
        }
      `}</style>

      <LandingNavbar activePage="pendaftaran" />

      {/* Content */}
      <main className="pend-main">{children}</main>

      <LandingFooter />
    </>
  );
}