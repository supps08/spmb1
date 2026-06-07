// ============================================================
// STATUS : 🆕 BARU
// PATH   : app/dashboard/layout.tsx
// ISI    : Sidebar + Topbar (Navbar) untuk semua halaman dashboard
//          - Sidebar: logo, nav links (admin-only gated), user chip, logout
//          - Topbar: judul halaman, notifikasi bell real-time
//          - Notif panel: mark as read, mark all read
//          - Polling notifikasi setiap 10 detik
//          - Responsive: hamburger menu di mobile
// ============================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  User as UserIcon,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Info,
  CircleCheck,
  AlertTriangle,
  CircleX,
  type LucideIcon,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/dashboard/laporan", label: "Laporan", icon: BarChart2 },
  { href: "/dashboard/users", label: "Manajemen Pendaftar", icon: Users, adminOnly: true },
  { href: "/dashboard/profile", label: "Profil Saya", icon: UserIcon },
];

const notifIconMap: Record<string, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: AlertTriangle,
  error: CircleX,
};

const notifBg: Record<string, string> = {
  info: "#EBF4EE",
  success: "#D1FAE5",
  warning: "#FEF3C7",
  error: "#FEE2E2",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setUser(data.user);
    setUserLoaded(true);

    // Redirect user biasa jika akses halaman admin
    const adminOnlyPaths = ["/dashboard/users", "/dashboard/berita", "/dashboard/laporan"];
    const isAdminPath = adminOnlyPaths.some(p => pathname.startsWith(p));
    if (isAdminPath && data.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [router, pathname]);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchUser, fetchNotifications]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return `${m} mnt lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  }

  const pageTitle = navLinks.find((l) => l.href === pathname)?.label ?? "Dashboard";
  const visibleNav = navLinks.filter((l) => !l.adminOnly || user?.role === "admin");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --color-primary: #1C5C38;
          --color-primary-light: #EBF4EE;
          --color-primary-soft: #F2F8F4;
          --color-success-bg: #D1FAE5;
          --color-danger: #DC2626;
          --color-danger-bg: #FEE2E2;
          --color-border: #E5E7EB;
          --color-muted: #6B7280;
          --color-ink: #0C0C0C;
          --sidebar-w: 180px;
          --topbar-h: 64px;
        }

        html, body { height: 100%; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--color-primary-soft);
          color: var(--color-ink);
        }

        /* ── Sidebar ── */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-w);
          background: #fff;
          border-right: 1px solid var(--color-border);
          z-index: 50;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
        }

        .sidebar-logo-row {
          height: var(--topbar-h);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--color-primary);
          color: #fff;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-ink);
          line-height: 1.25;
        }

        .sidebar-user-card {
          margin: 12px 8px;
          padding: 10px;
          background: var(--color-primary-soft);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--color-primary-light);
          color: var(--color-primary);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-ink);
          line-height: 1.2;
        }

        .sidebar-user-role {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 400;
          color: var(--color-muted);
          margin-top: 2px;
          text-transform: capitalize;
        }

        .sidebar-user-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          flex-shrink: 0;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          padding-bottom: 72px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 40px;
          padding: 0 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-muted);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background: var(--color-primary-soft);
          color: var(--color-ink);
        }

        .nav-link.active {
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-left-color: var(--color-primary);
          padding-left: 9px;
        }

        .sidebar-logout {
          position: absolute;
          bottom: 16px;
          left: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 40px;
          border: none;
          border-radius: 6px;
          background: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-danger);
          cursor: pointer;
          transition: background 0.15s;
        }

        .sidebar-logout:hover {
          background: var(--color-danger-bg);
        }

        /* ── Topbar ── */
        .topbar {
          position: fixed;
          top: 0;
          left: var(--sidebar-w);
          right: 0;
          height: var(--topbar-h);
          background: #fff;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 12px;
          z-index: 40;
        }

        .topbar-title {
          flex: 1;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .topbar-icon-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--color-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }

        .topbar-icon-btn:hover {
          background: var(--color-primary-soft);
          color: var(--color-ink);
        }

        .notif-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-danger);
          border: 2px solid #fff;
        }

        .notif-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          background: var(--color-danger);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #fff;
        }

        .topbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-primary-light);
          color: var(--color-primary);
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-wrap { position: relative; }

        .notif-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 340px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          box-shadow: 0 8px 32px rgba(12, 12, 12, 0.1);
          z-index: 200;
          overflow: hidden;
          animation: dropIn 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notif-header h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .notif-mark-all {
          font-size: 12px;
          color: var(--color-primary);
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .notif-mark-all:hover { background: var(--color-primary-soft); }

        .notif-list { max-height: 320px; overflow-y: auto; }

        .notif-item {
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--color-primary-soft); }

        .notif-item-icon {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .notif-item-body { flex: 1; min-width: 0; }

        .notif-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-ink);
        }

        .notif-item-msg {
          font-size: 12px;
          color: var(--color-muted);
          margin-top: 2px;
          line-height: 1.4;
        }

        .notif-item-time {
          font-size: 11px;
          color: var(--color-muted);
          margin-top: 4px;
        }

        .notif-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--color-muted);
          font-size: 13px;
        }

        /* ── Main ── */
        .main-content {
          margin-left: var(--sidebar-w);
          padding-top: var(--topbar-h);
          padding: calc(var(--topbar-h) + 24px) 24px 24px;
          min-height: 100vh;
          background: var(--color-primary-soft);
        }

        /* ── Mobile ── */
        .hamburger {
          display: none;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--color-muted);
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .hamburger:hover {
          background: var(--color-primary-soft);
          color: var(--color-ink);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 45;
        }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); z-index: 50; }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .topbar { left: 0; padding: 0 16px; }
          .main-content {
            margin-left: 0;
            padding: calc(var(--topbar-h) + 16px) 16px 16px;
          }
          .hamburger { display: flex; }
        }
      `}</style>

      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-logo-row">
          <Image src="/logo-smk.png" alt="Logo" width={32} height={32} style={{ objectFit: "contain", flexShrink: 0 }} />
          <div className="sidebar-logo-text">SMK Citra Negara</div>
        </div>

        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">
                <span className="sidebar-user-role-dot" aria-hidden="true" />
                {user.role}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {visibleNav.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${active ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={active ? 2.25 : 2} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Keluar
        </button>
      </aside>

      <header className="topbar">
        <button
          type="button"
          className="hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="topbar-title">{pageTitle}</div>

        <div className="topbar-actions">
          <button type="button" className="topbar-icon-btn" aria-label="Cari">
            <Search size={18} />
          </button>

          <div className="notif-wrap" ref={notifRef}>
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Notifikasi"
            >
              <Bell size={18} />
              {unread > 0 && (
                <>
                  <span className="notif-dot" aria-hidden="true" />
                  <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
                </>
              )}
            </button>

            {notifOpen && (
              <div className="notif-panel">
                <div className="notif-header">
                  <h3>Notifikasi {unread > 0 && `(${unread})`}</h3>
                  {unread > 0 && (
                    <button type="button" className="notif-mark-all" onClick={markAllRead}>
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">Tidak ada notifikasi</div>
                  ) : (
                    notifications.map((n) => {
                      const NotifIcon = notifIconMap[n.type] ?? Info;
                      return (
                        <div
                          key={n.id}
                          className="notif-item"
                          style={{
                            background: !n.read
                              ? (notifBg[n.type] ?? "#F2F8F4")
                              : undefined,
                          }}
                          onClick={() => markRead(n.id)}
                        >
                          <NotifIcon className="notif-item-icon" size={16} />
                          <div className="notif-item-body">
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-msg">{n.message}</div>
                            <div className="notif-item-time">{timeAgo(n.timestamp)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="topbar-avatar" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">{children}</main>
    </>
  );
}