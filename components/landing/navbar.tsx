"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

interface NavUser { name: string; role: string; }
interface LandingNavbarProps { activePage?: "beranda" | "pendaftaran" | "hasil-seleksi" | "berita"; }

export default function LandingNavbar({ activePage }: LandingNavbarProps) {
  const [navUser, setNavUser] = useState<NavUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeDropdown() {
    setDropdownClosing(true);
    setTimeout(() => { setDropdownOpen(false); setDropdownClosing(false); }, 180);
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.user) setNavUser(data.user); })
      .catch(() => {});

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") { closeDropdown(); setMobileOpen(false); } };
    window.addEventListener("keydown", handleKey);
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("keydown", handleKey); };
  }, []);

  return (
    <>
      <style>{`
        .ln-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .ln-nav.scrolled { background: rgba(240,248,244,0.92); border-bottom: 1px solid rgba(196,224,209,0.6); }
        .ln-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 5vw;
          display: flex; align-items: center; justify-content: space-between; height: 68px; gap: 24px;
        }
        .ln-logo {
          font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.1rem; font-weight: 800;
          color: #0C0C0C; text-decoration: none; flex-shrink: 0; display: flex; align-items: center; gap: 10px;
        }
        .ln-logo span { color: #1C5C38; }
        .ln-links {
          display: flex; align-items: center; gap: 32px;
          list-style: none; margin: 0; padding: 0; flex: 1; justify-content: center;
        }
        .ln-links a { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 500; color: #374151; text-decoration: none; transition: color 0.2s; }
        .ln-links a:hover { color: #1C5C38; }
        .ln-links a.active { color: #1C5C38; font-weight: 600; border-bottom: 2px solid #1C5C38; padding-bottom: 2px; }
        .ln-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0C0C0C; color: #fff; border: none; border-radius: 9999px;
          padding: 12px 22px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none;
          transition: all 0.25s ease; flex-shrink: 0;
        }
        .ln-cta:hover { transform: translateY(-1px); background: #222; }
        .ln-avatar {
          width: 40px; height: 40px; border-radius: 50%; background: #1C5C38; color: white;
          border: none; cursor: pointer; font-size: 15px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ln-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px); background: white;
          border-radius: 12px; border: 1px solid #E5E7EB;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12); min-width: 200px; z-index: 50; overflow: hidden;
        }
        .ln-dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 16px;
          font-size: 13px; color: #374151; text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.15s;
        }
        .ln-dropdown-item:hover { background: #F9FAFB; }
        .ln-dropdown-item.danger { color: #DC2626; }
        .ln-dropdown-item.danger:hover { background: #FEF2F2; }
        .ln-hamburger {
          display: none; flex-direction: column; justify-content: center; gap: 5px;
          width: 40px; height: 40px; background: none; border: none; cursor: pointer;
          padding: 8px; flex-shrink: 0;
        }
        .ln-hamburger span {
          display: block; width: 22px; height: 2px; background: #0C0C0C;
          border-radius: 2px; transition: all 0.25s ease;
        }
        .ln-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .ln-hamburger.open span:nth-child(2) { opacity: 0; }
        .ln-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .ln-mobile-menu {
          display: none; position: fixed; inset: 0; top: 68px; z-index: 999;
          background: rgba(240,248,244,0.97); backdrop-filter: blur(16px);
          flex-direction: column; padding: 32px 24px; gap: 8px;
          animation: ln-slideDown 0.2s ease;
        }
        .ln-mobile-menu.open { display: flex; }
        .ln-mobile-link {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.1rem; font-weight: 600;
          color: #0C0C0C; text-decoration: none; padding: 14px 0;
          border-bottom: 1px solid rgba(0,0,0,0.07); transition: color 0.2s;
        }
        .ln-mobile-link:hover, .ln-mobile-link.active { color: #1C5C38; }
        .ln-mobile-cta {
          margin-top: 16px; display: block; text-align: center;
          background: #0C0C0C; color: #fff; border-radius: 12px;
          padding: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem; font-weight: 600; text-decoration: none;
        }
        @keyframes ln-fadeUp { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ln-fadeDown { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-8px); } }
        @keyframes ln-slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 768px) {
          .ln-links, .ln-cta, .ln-avatar { display: none; }
          .ln-hamburger { display: flex; }
        }
      `}</style>

      <nav className={`ln-nav${scrolled ? " scrolled" : ""}`}>
        <div className="ln-nav-inner">
          <Link href="/" className="ln-logo">
            <Image src="/logo-smk.png" alt="Logo SMK Citra Negara" width={38} height={38} style={{ objectFit: "contain", flexShrink: 0 }} />
            SMK <span>Citra Negara</span>
          </Link>

          <ul className="ln-links">
            <li><Link href="/" className={activePage === "beranda" ? "active" : ""}>Beranda</Link></li>
            <li><Link href="/#jurusan">Jurusan</Link></li>
            <li><Link href="/berita" className={activePage === "berita" ? "active" : ""}>Berita</Link></li>
            <li><Link href="/pendaftaran" className={activePage === "pendaftaran" ? "active" : ""}>Pendaftaran</Link></li>
          </ul>

          <div style={{ position: "relative", flexShrink: 0 }}>
            {navUser ? (
              <>
                <button className="ln-avatar" onClick={() => dropdownOpen ? closeDropdown() : setDropdownOpen(true)}>
                  {navUser.name.charAt(0).toUpperCase()}
                </button>
                {dropdownOpen && (
                  <>
                    <div onClick={closeDropdown} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                    <div className="ln-dropdown" style={{ animation: dropdownClosing ? "ln-fadeDown 0.18s ease forwards" : "ln-fadeUp 0.2s ease" }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", background: "#F9FAFB" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>{navUser.name}</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{navUser.role === "admin" ? "Administrator" : "Pendaftar"}</div>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        <Link href="/hasil-seleksi" className="ln-dropdown-item">Hasil Seleksi</Link>
                        <Link href={navUser.role === "admin" ? "/dashboard/profile" : "/pendaftaran"} className="ln-dropdown-item">
                          👤 {navUser.role === "admin" ? "Dashboard" : "Pendaftaran Saya"}
                        </Link>
                        <div style={{ height: 1, background: "#F3F4F6", margin: "4px 0" }} />
                        <button className="ln-dropdown-item danger" onClick={async () => {
                          await fetch("/api/auth/logout", { method: "POST" });
                          setNavUser(null); closeDropdown(); window.location.href = "/login";
                        }}>Keluar</button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link href="/register" className="ln-cta">Daftar Sekarang</Link>
            )}
          </div>

          <button className={`ln-hamburger${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`ln-mobile-menu${mobileOpen ? " open" : ""}`}>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: -1 }} />}
        <Link href="/" className={`ln-mobile-link${activePage === "beranda" ? " active" : ""}`} onClick={() => setMobileOpen(false)}>Beranda</Link>
        <Link href="/#jurusan" className="ln-mobile-link" onClick={() => setMobileOpen(false)}>Jurusan</Link>
        <Link href="/berita" className={`ln-mobile-link${activePage === "berita" ? " active" : ""}`} onClick={() => setMobileOpen(false)}>Berita</Link>
        <Link href="/pendaftaran" className={`ln-mobile-link${activePage === "pendaftaran" ? " active" : ""}`} onClick={() => setMobileOpen(false)}>Pendaftaran</Link>
        <Link href="/hasil-seleksi" className="ln-mobile-link" onClick={() => setMobileOpen(false)}>Hasil Seleksi</Link>
        {navUser ? (
          <>
            <Link href={navUser.role === "admin" ? "/dashboard" : "/pendaftaran"} className="ln-mobile-link" onClick={() => setMobileOpen(false)}>
              👤 {navUser.role === "admin" ? "Dashboard" : "Pendaftaran Saya"}
            </Link>
            <button className="ln-mobile-link" style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", color: "#DC2626", fontFamily: "inherit", fontWeight: 600, fontSize: "1.1rem", padding: "14px 0", borderBottom: "1px solid rgba(0,0,0,0.07)" }} onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              setMobileOpen(false); window.location.href = "/login";
            }}>Keluar</button>
          </>
        ) : (
          <Link href="/register" className="ln-mobile-cta" onClick={() => setMobileOpen(false)}>Daftar Sekarang →</Link>
        )}
      </div>
    </>
  );
}
