// ============================================================
// PATH   : app/page.tsx
// ISI    : Landing Page SPMB SMK Citra Negara
//          - Navbar fixed (scroll effect)
//          - Hero + foto grid floating
//          - Marquee jurusan
//          - Challenges section
//          - Jurusan unggulan (PPLG, TKJ, MPLB)
//          - Alur pendaftaran 4 langkah
//          - Statistik (counter animation)
//          - Testimonial carousel
//          - CTA Final
//          - Footer
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LandingFooter from "@/components/landing/footer";
import StatsBlock from "@/components/landing/stats-block";
import HeroCountdown from "@/components/landing/hero-countdown";

export default function LandingPage() {
  const [navUser, setNavUser] = useState<{ name: string; role: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    // Navbar scroll effect
    const navbar = document.getElementById("lp-navbar");
    const handleScroll = () => {
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Scroll reveal
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));

    // Smooth scroll
    const links = document.querySelectorAll('a[href^="#"]');
    const handleClick = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    };
    links.forEach((a) => a.addEventListener("click", handleClick));

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setNavUser(data.user);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      links.forEach((a) => a.removeEventListener("click", handleClick));
    };
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #FFFFFF;
          --bg-soft: #F5F2EC;
          --ink: #0C0C0C;
          --ink-2: #1A1A1A;
          --muted: #696969;
          --muted-light: #A8A8A8;
          --accent: #1C5C38;
          --accent-mid: #2A7A4E;
          --accent-light: #EBF4EE;
          --border: rgba(0,0,0,0.08);
          --border-dark: rgba(255,255,255,0.1);
          --radius-sm: 8px;
          --radius: 14px;
          --radius-lg: 22px;
          --radius-pill: 100px;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--ink);
          overflow-x: hidden;
        }

        h1, h2, h3, h4 {
          font-family: 'Bricolage Grotesque', sans-serif;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 5vw;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--ink); color: #fff;
          border: none; border-radius: var(--radius-pill);
          padding: 14px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.25s ease; white-space: nowrap;
        }
        .btn-primary:hover { transform: translateY(-2px); background: #222; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: var(--ink);
          border: 1.5px solid var(--ink); border-radius: var(--radius-pill);
          padding: 14px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.25s ease; white-space: nowrap;
        }
        .btn-outline:hover { transform: translateY(-2px); background: var(--ink); color: #fff; }

        .btn-outline-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.4); border-radius: var(--radius-pill);
          padding: 14px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.25s ease;
        }
        .btn-outline-white:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.7); }

        .section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 20px;
        }
        .section-label::before {
          content: ''; width: 6px; height: 6px;
          border-radius: 50%; background: var(--accent); flex-shrink: 0;
        }

        /* ANIMATIONS */
        @keyframes float-a { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(-2deg)} }
        @keyframes float-b { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(-16px) rotate(1.5deg)} }
        @keyframes float-c { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(-1deg)} }
        @keyframes float-d { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
        @keyframes marquee-left { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marquee-right { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }

        .reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }

        /* ===== NAVBAR ===== */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        nav.scrolled {
          background: rgba(240,248,244,0.92);
          border-bottom: 1px solid rgba(196,224,209,0.6);
        }
        .nav-inner {
          display: flex; align-items: center;
          justify-content: space-between; height: 68px; gap: 32px;
        }
        .nav-logo {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 1.15rem;
          color: var(--ink); text-decoration: none;
          letter-spacing: -0.02em; flex-shrink: 0;
        }
        .nav-logo span { color: var(--accent); }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a {
          font-size: 0.88rem; font-weight: 500; color: var(--muted);
          text-decoration: none; transition: color 0.2s ease;
        }
        .nav-links a:hover { color: var(--ink); }

        /* ===== HERO ===== */
        .hero {
          padding: 140px 0 100px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center; min-height: 100vh;
        }
        .hero-left { animation: fadeUp 0.9s ease forwards; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--accent-light); color: var(--accent);
          border-radius: var(--radius-pill); padding: 8px 16px;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 28px;
        }
        .hero-badge::before {
          content: ''; width: 7px; height: 7px;
          background: var(--accent); border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .hero h1 {
          font-size: clamp(3rem, 5.5vw, 5rem); font-weight: 800;
          color: var(--ink); margin-bottom: 24px; max-width: 560px;
        }
        .hero p {
          font-size: 1.05rem; color: var(--muted);
          line-height: 1.7; margin-bottom: 40px;
          max-width: 440px; font-weight: 400;
        }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }

        .hero-right {
          position: relative; height: 560px;
          animation: fadeIn 1.1s ease 0.3s forwards; opacity: 0;
        }
        .hero-photo {
          position: absolute; border-radius: 20px;
          border: 3px solid white; object-fit: cover;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        .hero-photo-1 { width:220px;height:280px;top:0;left:20px;animation:float-a 5s ease-in-out infinite; }
        .hero-photo-2 { width:180px;height:220px;top:30px;left:255px;animation:float-b 6s ease-in-out infinite 0.5s; }
        .hero-photo-3 { width:200px;height:260px;top:20px;right:0;animation:float-c 5.5s ease-in-out infinite 1s; }
        .hero-photo-4 { width:240px;height:200px;bottom:60px;left:10px;animation:float-d 6.5s ease-in-out infinite 0.7s; }
        .hero-photo-5 { width:180px;height:220px;bottom:20px;right:30px;animation:float-a 5.8s ease-in-out infinite 1.2s; }

        .hero-badge-float {
          position: absolute; bottom: 120px; left: 50%;
          transform: translateX(-50%);
          background: white; border-radius: var(--radius);
          padding: 14px 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: flex; align-items: center; gap: 12px;
          white-space: nowrap; z-index: 10;
          animation: float-b 4s ease-in-out infinite;
        }
        .hero-badge-float .num {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 1.5rem; color: var(--ink);
        }
        .hero-badge-float .lbl { font-size: 0.8rem; color: var(--muted); font-weight: 500; }
        .hero-badge-float .dot {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--accent-light);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ===== MARQUEE ===== */
        .marquee-section { background: var(--ink-2,#1A1A1A); padding: 22px 0; overflow: hidden; }
        .marquee-track {
          display: flex; width: max-content;
          animation: marquee-left 22s linear infinite;
        }
        .marquee-item {
          display: flex; align-items: center; gap: 24px;
          padding: 0 24px; font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.5); white-space: nowrap;
        }
        .marquee-dot { width:6px;height:6px;background:var(--accent);border-radius:50%;flex-shrink:0; }

        /* ===== CHALLENGES ===== */
        .challenges { background: var(--bg-soft); padding: 120px 0; }
        .challenges-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .challenges h2 { font-size: clamp(2rem,3.5vw,3rem); font-weight: 800; margin-bottom: 16px; }
        .challenges-desc { color: var(--muted); line-height: 1.7; margin-bottom: 40px; font-size: 0.97rem; }
        .challenge-card {
          background: white; border: 1px solid var(--border);
          border-radius: var(--radius); padding: 22px 24px;
          margin-bottom: 14px; display: flex; align-items: flex-start; gap: 16px;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .challenge-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .challenge-icon {
          width: 44px; height: 44px; border-radius: var(--radius-sm);
          background: var(--accent-light);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .challenge-icon svg { width: 22px; height: 22px; color: var(--accent); }
        .challenge-title { font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:1rem; margin-bottom:4px; letter-spacing:-0.01em; }
        .challenge-text { font-size:0.85rem; color:var(--muted); line-height:1.55; }
        .challenges-right { position: relative; }
        .challenges-img { width:100%;height:500px;object-fit:cover;border-radius:20px;display:block; }
        .stat-float {
          position: absolute; bottom: 30px; left: -24px;
          background: white; border-radius: var(--radius);
          padding: 18px 22px; box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
        .stat-float .big { font-family:'Bricolage Grotesque',sans-serif;font-size:2rem;font-weight:800;color:var(--ink); }
        .stat-float .lbl { font-size:0.8rem;color:var(--muted);margin-top:2px; }

        /* ===== JURUSAN ===== */
        .jurusan { padding: 120px 0; }
        .jurusan-header { margin-bottom: 60px; }
        .jurusan h2 { font-size: clamp(2rem,3.5vw,3rem); font-weight: 800; }
        .jurusan-item {
          display: grid; grid-template-columns: 280px 1fr;
          gap: 36px; align-items: center;
          padding: 28px 0; border-bottom: 1px solid var(--border);
          transition: background 0.25s ease; cursor: pointer; border-radius: var(--radius-sm);
        }
        .jurusan-item:first-child { border-top: 1px solid var(--border); }
        .jurusan-item:hover { background:var(--bg-soft);padding-left:16px;padding-right:16px;margin:0 -16px; }
        .jurusan-img-wrap { position: relative; flex-shrink: 0; }
        .jurusan-img { width:100%;height:170px;object-fit:cover;border-radius:var(--radius);display:block; }
        .jurusan-badge {
          position: absolute; top: 12px; left: 12px;
          background: var(--ink); color: white;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 5px 12px; border-radius: var(--radius-pill);
        }
        .jurusan-name { font-family:'Bricolage Grotesque',sans-serif;font-size:1.4rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px; }
        .jurusan-desc { font-size:0.9rem;color:var(--muted);line-height:1.6;max-width:500px; }
        .jurusan-arrow { margin-top:16px;display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;font-weight:600;color:var(--accent); }

        /* ===== ALUR ===== */
        .alur { padding: 120px 0; background: var(--bg); }
        .alur-top { display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:80px;gap:40px; }
        .alur-top-left { flex: 1; }
        .alur h2 { font-size:clamp(2rem,3.5vw,3rem);font-weight:800; }
        .alur-step {
          display: grid; grid-template-columns: 80px 1px 1fr;
          gap: 0 32px; align-items: start;
          padding: 36px 0; border-bottom: 1px solid var(--border);
        }
        .alur-step:first-child { border-top: 1px solid var(--border); }
        .step-num { font-family:'Bricolage Grotesque',sans-serif;font-size:3rem;font-weight:800;color:rgba(0,0,0,0.06);line-height:1;padding-top:4px; }
        .step-divider { background:var(--border);width:1px;align-self:stretch;margin:4px 0; }
        .step-content { padding-top: 4px; }
        .step-title { font-family:'Bricolage Grotesque',sans-serif;font-size:1.2rem;font-weight:700;margin-bottom:10px;letter-spacing:-0.01em; }
        .step-desc { font-size:0.9rem;color:var(--muted);line-height:1.65;max-width:480px; }

        /* ===== STATISTIK ===== */
        .stats { background: var(--ink-2,#1A1A1A); padding: 120px 0; }
        .stats-label { color: rgba(255,255,255,0.5); }
        .stats-label::before { background: var(--accent); }
        .stats-layout {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: start;
        }
        .stats-heading {
          font-size: clamp(2rem,3.5vw,3rem);
          color: white; font-weight: 800;
          margin-bottom: 32px; max-width: 500px;
        }
        .stats-carousel { margin-top: 8px; }
        .stats-carousel-frame {
          position: relative; width: 100%;
          aspect-ratio: 16 / 9; border-radius: 12px;
          overflow: hidden; margin-bottom: 16px;
        }
        .stats-carousel-img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: 12px;
          animation: statsImgFade 0.3s ease;
        }
        @keyframes statsImgFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .stats-carousel-nav { display: flex; gap: 12px; }
        .stats-carousel-btn {
          width: 40px; height: 40px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%; background: transparent;
          color: white; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .stats-carousel-btn:hover {
          border-color: white;
          background: rgba(255,255,255,0.1);
        }
        .stats-cards-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--border-dark);
        }
        .stat-card {
          padding: 40px; background: var(--ink-2,#1A1A1A);
          border: 1px solid transparent;
          text-align: left; position: relative;
          transition: all 0.2s ease;
        }
        .stat-card-clickable {
          cursor: pointer;
        }
        .stat-card-clickable:hover {
          border-color: rgba(28,92,56,0.5);
          transform: translateY(-2px);
        }
        .stat-card-static { cursor: default; }
        .stat-card-icon {
          position: absolute; top: 16px; right: 16px;
          font-size: 0.75rem; color: rgba(255,255,255,0.35);
        }
        .stat-num { font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(2.8rem,5vw,4rem);font-weight:800;color:white;line-height:1;margin-bottom:12px; }
        .stat-num span { color: var(--accent); }
        .stat-lbl { font-size:0.85rem;color:rgba(255,255,255,0.45);font-weight:500;text-transform:uppercase;letter-spacing:0.06em; }
        .stat-sublbl {
          font-size: 0.72rem; color: rgba(255,255,255,0.3);
          margin-top: 6px; text-transform: none; letter-spacing: 0;
          font-weight: 400;
        }
        .stats-modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
        }
        .stats-modal-card {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 32px;
          max-width: 480px; width: calc(100% - 40px);
          animation: fadeUp 0.3s ease;
        }
        .stats-modal-close {
          position: absolute; top: 16px; right: 16px;
          background: none; border: none;
          color: rgba(255,255,255,0.5);
          font-size: 1.5rem; line-height: 1;
          cursor: pointer; padding: 4px;
          transition: color 0.2s ease;
        }
        .stats-modal-close:hover { color: white; }
        .stats-modal-text {
          color: rgba(255,255,255,0.75);
          font-size: 0.92rem; line-height: 1.7;
          padding-right: 24px;
        }
        .stats-modal-table {
          width: 100%; border-collapse: collapse;
          margin-bottom: 16px;
        }
        .stats-modal-table td {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
          font-size: 0.9rem;
        }
        .stats-modal-table td:last-child {
          text-align: right; color: var(--accent); font-weight: 600;
        }
        .stats-modal-note {
          font-size: 0.78rem; color: rgba(255,255,255,0.4);
        }
        .stats-modal-mitra-grid {
          list-style: none;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px 20px;
          padding-right: 24px;
        }
        .stats-modal-mitra-grid li {
          font-size: 0.88rem; color: rgba(255,255,255,0.8);
        }

        /* ===== MARQUEE 2 ===== */
        .marquee-section-2 { background:var(--bg-soft);padding:22px 0;overflow:hidden; }
        .marquee-track-2 { display:flex;width:max-content;animation:marquee-right 40s linear infinite; }
        .marquee-item-2 { display:flex;align-items:center;gap:24px;padding:0 24px;font-size:0.82rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.3);white-space:nowrap; }
        .marquee-dot-2 { width:5px;height:5px;background:var(--accent);border-radius:50%;flex-shrink:0; }

        /* ===== TESTIMONIAL ===== */
        .testimonial { padding: 120px 0; overflow: hidden; }
        .testimonial h2 { font-size:clamp(2rem,3.5vw,3rem);font-weight:800;margin-bottom:60px; }
        .testi-track-wrap { overflow: hidden; }
        .testi-track { display:flex;gap:24px;animation:marquee-left 30s linear infinite;width:max-content; }
        .testi-track:hover { animation-play-state: paused; }
        .testi-card { background:var(--bg-soft);border-radius:var(--radius-lg);padding:36px;width:380px;flex-shrink:0;display:flex;flex-direction:column;gap:20px; }
        .testi-quote { font-size:0.97rem;line-height:1.7;color:var(--ink);font-style:italic;flex:1; }
        .testi-author { display:flex;align-items:center;gap:14px; }
        .testi-avatar { width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.1); }
        .testi-name { font-weight:700;font-size:0.9rem; }
        .testi-jurusan { font-size:0.8rem;color:var(--muted); }

        /* ===== CTA FINAL ===== */
        .cta-section { padding: 80px 0; background: var(--bg-soft); }
        .cta-inner {
          background: var(--ink-2,#1A1A1A); border-radius: 32px; padding: 80px;
          display: grid; grid-template-columns: 1fr auto;
          gap: 60px; align-items: center; position: relative; overflow: hidden;
        }
        .cta-inner::before {
          content: ''; position: absolute; top: -80px; right: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(28,92,56,0.3) 0%, transparent 70%);
          border-radius: 50%;
        }
        .cta-label { color: rgba(255,255,255,0.5); }
        .cta-label::before { background: var(--accent); }
        .cta-inner h2 { font-size:clamp(2.2rem,4vw,3.5rem);color:white;font-weight:800;margin-bottom:16px; }
        .cta-inner p { color:rgba(255,255,255,0.6);line-height:1.65;max-width:440px;margin-bottom:36px; }
        .cta-buttons { display:flex;gap:14px;flex-wrap:wrap; }
        .btn-white {
          display:inline-flex;align-items:center;gap:8px;
          background:white;color:var(--ink);border:none;border-radius:var(--radius-pill);
          padding:14px 28px;font-family:'Plus Jakarta Sans',sans-serif;
          font-weight:700;font-size:0.9rem;cursor:pointer;text-decoration:none;
          transition:all 0.25s ease;
        }
        .btn-white:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,255,255,0.2); }
        .btn-cta-primary {
          display:inline-flex;align-items:center;gap:8px;
          background:#1C5C38;color:#fff;border:none;border-radius:var(--radius-pill);
          padding:14px 28px;font-family:'Plus Jakarta Sans',sans-serif;
          font-weight:700;font-size:0.9rem;cursor:pointer;text-decoration:none;
          transition:all 0.25s ease;
        }
        .btn-cta-primary:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(28,92,56,0.35); }
        .btn-cta-outline {
          display:inline-flex;align-items:center;gap:8px;
          background:transparent;color:#fff;
          border:1.5px solid #1C5C38;border-radius:var(--radius-pill);
          padding:14px 28px;font-family:'Plus Jakarta Sans',sans-serif;
          font-weight:600;font-size:0.9rem;cursor:pointer;text-decoration:none;
          transition:all 0.25s ease;
        }
        .btn-cta-outline:hover { transform:translateY(-2px);background:rgba(28,92,56,0.15); }
        .cta-deco { position:relative;width:260px;height:280px;flex-shrink:0; }
        .cta-deco img { width:240px;height:260px;object-fit:cover;border-radius:20px;border:3px solid rgba(255,255,255,0.1); }
        .cta-deco-badge {
          position:absolute;bottom:-10px;left:-20px;
          background:var(--accent);color:white;border-radius:var(--radius);
          padding:14px 18px;font-size:0.85rem;font-weight:700;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding: 120px 0 60px; }
          .hero-right { height: 340px; }
          .hero-photo-1 { width:160px;height:200px; }
          .hero-photo-2 { width:130px;height:160px;left:180px; }
          .hero-photo-3 { width:150px;height:190px; }
          .hero-photo-4 { width:180px;height:150px;bottom:20px; }
          .hero-photo-5 { width:140px;height:170px; }
          .challenges-inner { grid-template-columns: 1fr; }
          .jurusan-item { grid-template-columns: 1fr; }
          .jurusan-img { height: 220px; }
          .alur-top { flex-direction: column; align-items: flex-start; }
          .stats-layout { grid-template-columns: 1fr; gap: 48px; }
          .stats-cards-grid { grid-template-columns: repeat(2,1fr); }
          .cta-inner { grid-template-columns: 1fr; padding: 48px; }
          .cta-deco { display: none; }
          .nav-links { display: none; }
        }

        @media (max-width: 600px) {
          .stats-cards-grid { grid-template-columns: 1fr 1fr; }
          .alur-step { grid-template-columns: 60px 1px 1fr; gap: 0 20px; }
          .step-num { font-size: 2rem; }
          .hero-ctas { flex-direction: column; }
        }
      `}</style>

      {/* ===== NAVBAR ===== */}
      <nav id="lp-navbar">
        <div className="container">
          <div className="nav-inner">
            <a href="/" className="nav-logo">
              SMK <span>Citra Negara</span>
            </a>
            <ul className="nav-links">
              <li><a href="#jurusan">Jurusan</a></li>
              <li><a href="#alur">Alur Daftar</a></li>
              <li><a href="#tentang">Tentang</a></li>
              <li><a href="#kontak">Kontak</a></li>
            </ul>
            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            {navUser ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#1C5C38",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {navUser.name.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      onClick={() => setDropdownOpen(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        background: "white",
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        minWidth: 200,
                        zIndex: 50,
                        overflow: "hidden",
                        animation: "fadeUp 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #F3F4F6",
                          background: "#F9FAFB",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>
                          {navUser.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                          {navUser.role === "admin" ? "Administrator" : "Pendaftar"}
                        </div>
                      </div>

                      <div style={{ padding: "6px 0" }}>
                        <a
                          href="/hasil-seleksi"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "#374151",
                            textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          🔍 Hasil Seleksi
                        </a>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "#9CA3AF",
                            cursor: "not-allowed",
                            position: "relative",
                          }}
                        >
                          <span style={{ position: "relative" }}>
                            💳
                            <span
                              style={{
                                position: "absolute",
                                top: -4,
                                right: -4,
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#DC2626",
                                border: "1.5px solid white",
                              }}
                            />
                          </span>
                          Pembayaran
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 10,
                              fontWeight: 600,
                              background: "#FEF3C7",
                              color: "#92400E",
                              padding: "2px 6px",
                              borderRadius: 9999,
                            }}
                          >
                            Segera
                          </span>
                        </div>

                        <a
                          href={navUser.role === "admin" ? "/dashboard/profile" : "/pendaftaran"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "#374151",
                            textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          👤 {navUser.role === "admin" ? "Dashboard" : "Pendaftaran Saya"}
                        </a>

                        <div style={{ height: 1, background: "#F3F4F6", margin: "4px 0" }} />

                        <button
                          onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            setNavUser(null);
                            setDropdownOpen(false);
                            window.location.href = "/login";
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "#DC2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            width: "100%",
                            textAlign: "left",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          🚪 Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/register" className="btn-primary" style={{ fontSize: "0.85rem", padding: "12px 22px" }}>
                Daftar Sekarang
              </Link>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="hero">
            <div className="hero-left">
              <div className="hero-badge">Penerimaan Murid Baru 2025/2026</div>
              <h1>Wujudkan Mimpimu Bersama SMK Citra Negara</h1>
              <p>
                Pilih jurusan sesuai passion-mu, daftar online dengan mudah, dan mulai
                perjalanan karier digitalmu bersama ribuan alumni sukses kami.
              </p>
              <div className="hero-ctas">
                <Link href="/register" className="btn-primary">Daftar PPDB →</Link>
                <a href="#alur" className="btn-outline">Lihat Alur</a>
              </div>
              <HeroCountdown />
            </div>

            <div className="hero-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-photo hero-photo-1"
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop&q=80"
                alt="Siswa belajar" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-photo hero-photo-2"
                src="https://images.unsplash.com/photo-1580582932707-520afc8711b3?w=400&h=400&fit=crop&q=80"
                alt="Lab komputer" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-photo hero-photo-3"
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=500&fit=crop&q=80"
                alt="Siswa di kelas" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-photo hero-photo-4"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=400&fit=crop&q=80"
                alt="Kerja tim" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-photo hero-photo-5"
                src="https://images.unsplash.com/photo-1560785496-3c9d5ec3cdf7?w=400&h=440&fit=crop&q=80"
                alt="Siswa tersenyum" />

              <div className="hero-badge-float">
                <div className="dot">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1C5C38" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <div className="num">1.240+</div>
                  <div className="lbl">Pendaftar Tahun Ini</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE 1 ===== */}
      <div className="marquee-section">
        <div className="marquee-track">
          {["TKJ", "PPLG", "MPLB", "Teknik", "Digital", "Kreatif", "TKJ", "PPLG", "MPLB", "Teknik", "Digital", "Kreatif"].map((item, i) => (
            <div className="marquee-item" key={i}>
              {item}<span className="marquee-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* ===== CHALLENGES ===== */}
      <section className="challenges">
        <div className="container">
          <div className="challenges-inner">
            <div className="reveal">
              <div className="section-label">Tantangan Nyata</div>
              <h2>Masalah yang Sering Dihadapi Calon Siswa</h2>
              <p className="challenges-desc">
                Kami paham proses masuk sekolah bisa terasa membingungkan.
                SMK Citra Negara hadir sebagai solusi lengkap untuk kamu.
              </p>

              <div className="challenge-card reveal reveal-delay-1">
                <div className="challenge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <div className="challenge-title">Bingung pilih jurusan?</div>
                  <div className="challenge-text">
                    Kami punya 3 jurusan unggulan dengan jalur karier yang jelas.
                    Konsultasi gratis tersedia untuk bantu kamu memilih.
                  </div>
                </div>
              </div>

              <div className="challenge-card reveal reveal-delay-2">
                <div className="challenge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <div className="challenge-title">Khawatir soal biaya?</div>
                  <div className="challenge-text">
                    Tersedia beasiswa prestasi dan program KIP-SMK untuk semua
                    siswa yang memenuhi syarat.
                  </div>
                </div>
              </div>

              <div className="challenge-card reveal reveal-delay-3">
                <div className="challenge-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <div className="challenge-title">Proses daftar yang rumit?</div>
                  <div className="challenge-text">
                    Pendaftaran online 4 langkah simpel, dokumen digital, dan
                    pantau status real-time dari HP kamu.
                  </div>
                </div>
              </div>
            </div>

            <div className="challenges-right reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="challenges-img"
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=700&h=800&fit=crop&q=80"
                alt="Siswa belajar" />
              <div className="stat-float">
                <div className="big">98%</div>
                <div className="lbl">Tingkat Keterserapan Kerja</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== JURUSAN ===== */}
      <section className="jurusan" id="jurusan">
        <div className="container">
          <div className="jurusan-header reveal">
            <div className="section-label">Program Studi</div>
            <h2>6 Jurusan Unggulan<br />untuk Masa Depanmu</h2>
          </div>

          <div>
            {[
              {
                kode: "PPLG",
                nama: "Rekayasa Perangkat Lunak",
                desc: "Belajar pengembangan aplikasi web, mobile, dan sistem perangkat lunak dengan stack industri terkini.",
                img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=340&fit=crop&q=80",
                delay: "",
              },
              {
                kode: "TKJ",
                nama: "Teknik Komputer & Jaringan",
                desc: "Kuasai infrastruktur jaringan, keamanan siber, dan administrasi sistem. Siap kerja di bidang IT support dan network engineering.",
                img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&q=80",
                delay: "reveal-delay-1",
              },
              {
                kode: "PM",
                nama: "Pemasaran dan Marketing",
                desc: "Pelajari strategi pemasaran digital, branding, dan komunikasi bisnis untuk dunia industri modern.",
                img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&q=80",
                delay: "reveal-delay-2",
              },
              {
                kode: "DKV",
                nama: "Multimedia & Produksi Konten",
                desc: "Kembangkan skill desain grafis, video production, dan konten kreatif untuk media digital.",
                img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop&q=80",
                delay: "reveal-delay-3",
              },
              {
                kode: "MPLB",
                nama: "Manajemen & Layanan Bisnis",
                desc: "Administrasi profesional, manajemen dokumen digital, dan layanan pelanggan standar industri.",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop&q=80",
                delay: "reveal-delay-1",
              },
              {
                kode: "PH",
                nama: "Perhotelan & Pariwisata",
                desc: "Siap berkarier di industri hospitality dengan pelatihan layanan hotel, front office, dan pariwisata.",
                img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=340&fit=crop&q=80",
                delay: "reveal-delay-2",
              },
            ].map((j) => (
              <div className={`jurusan-item reveal ${j.delay}`} key={j.kode}>
                <div className="jurusan-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="jurusan-img" src={j.img} alt={j.nama} />
                  <div className="jurusan-badge">{j.kode}</div>
                </div>
                <div className="jurusan-info">
                  <div className="jurusan-name">{j.nama}</div>
                  <div className="jurusan-desc">{j.desc}</div>
                  <div className="jurusan-arrow">Selengkapnya →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ALUR PENDAFTARAN ===== */}
      <section className="alur" id="alur">
        <div className="container">
          <div className="alur-top">
            <div className="alur-top-left reveal">
              <div className="section-label">Cara Daftar</div>
              <h2>Alur Pendaftaran<br />yang Simpel & Cepat</h2>
            </div>
            <div className="reveal">
              <Link href="/register" className="btn-primary">Mulai Daftar →</Link>
            </div>
          </div>

          <div>
            {[
              {
                num: "01",
                title: "Registrasi Online",
                desc: "Buat akun di portal kami dengan mudah tanpa biaya administrasi",
                delay: "",
              },
              {
                num: "02",
                title: "Tes Bakat & Minat",
                desc: "Ikuti asesmen kognitif dan praktis untuk menentukan jurusan terbaik",
                delay: "reveal-delay-1",
              },
              {
                num: "03",
                title: "Wawancara Industri",
                desc: "Sesi wawancara bersama praktisi industri untuk mengevaluasi motivasi",
                delay: "reveal-delay-2",
              },
              {
                num: "04",
                title: "Pengumuman & Daftar Ulang",
                desc: "Calon siswa diterima akan mendapatkan notifikasi resmi",
                delay: "reveal-delay-3",
              },
            ].map((s) => (
              <div className={`alur-step reveal ${s.delay}`} key={s.num}>
                <div className="step-num">{s.num}</div>
                <div className="step-divider" />
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATISTIK ===== */}
      <section className="stats" id="tentang">
        <div className="container">
          <StatsBlock />
        </div>
      </section>

      {/* ===== MARQUEE 2 ===== */}
      <div className="marquee-section-2">
        <div className="marquee-track-2">
          {["Teknik", "Kreatif", "Bisnis", "Digital", "Desain", "Jaringan", "Pemasaran", "Teknik", "Kreatif", "Bisnis", "Digital", "Desain", "Jaringan", "Pemasaran"].map((item, i) => (
            <div className="marquee-item-2" key={i}>
              {item}<span className="marquee-dot-2" />
            </div>
          ))}
        </div>
      </div>

      {/* ===== TESTIMONIAL ===== */}
      <section className="testimonial">
        <div className="container">
          <div className="reveal">
            <div className="section-label">Kata Alumni</div>
            <h2>Dipercaya Ribuan<br />Alumni di Seluruh Indonesia</h2>
          </div>
        </div>
        <div style={{ marginTop: "60px", padding: "0 5vw" }}>
          <div className="testi-track-wrap">
            <div className="testi-track">
              {[
                {
                  quote: "Berkat PPLG di SMK Citra Negara, gue langsung diterima kerja di startup tech sebelum lulus. Kurikulumnya relevan banget sama dunia industri sekarang.",
                  name: "Rizky Fadillah",
                  meta: "Alumni PPLG · 2023 · Junior Dev",
                  img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&q=80",
                },
                {
                  quote: "Proses daftarnya gampang banget, semua online. Guru-gurunya juga supportif. Sekarang gue udah jadi teknisi jaringan di perusahaan BUMN.",
                  name: "Dimas Ardiansyah",
                  meta: "Alumni TKJ · 2022 · Network Engineer",
                  img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&q=80",
                },
                {
                  quote: "MPLB kasih gue skill administrasi digital yang langsung kepake. Magang di perusahaan multinasional waktu kelas 12, dan langsung ditawari kerja setelah lulus.",
                  name: "Nadia Syahputri",
                  meta: "Alumni MPLB · 2023 · Admin Executive",
                  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80",
                },
                {
                  quote: "Fasilitas lab-nya lengkap banget. Gue bisa langsung praktek jaringan real di sekolah, jadi waktu magang udah nggak kagok sama sekali.",
                  name: "Bagas Pratama",
                  meta: "Alumni TKJ · 2022 · IT Support",
                  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80",
                },
                {
                  quote: "Gurunya berpengalaman dari industri langsung. Ilmu yang gue dapet di PPLG langsung applicable waktu kerja, bukan cuma teori doang.",
                  name: "Siti Rahayu",
                  meta: "Alumni PPLG · 2021 · Frontend Developer",
                  img: "https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=80&h=80&fit=crop&q=80",
                },
                // duplicate for seamless loop
                {
                  quote: "Berkat PPLG di SMK Citra Negara, gue langsung diterima kerja di startup tech sebelum lulus. Kurikulumnya relevan banget sama dunia industri sekarang.",
                  name: "Rizky Fadillah",
                  meta: "Alumni PPLG · 2023 · Junior Dev",
                  img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&q=80",
                },
                {
                  quote: "Proses daftarnya gampang banget, semua online. Guru-gurunya juga supportif. Sekarang gue udah jadi teknisi jaringan di perusahaan BUMN.",
                  name: "Dimas Ardiansyah",
                  meta: "Alumni TKJ · 2022 · Network Engineer",
                  img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&q=80",
                },
              ].map((t, i) => (
                <div className="testi-card" key={i}>
                  <div className="testi-quote">&ldquo;{t.quote}&rdquo;</div>
                  <div className="testi-author">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="testi-avatar" src={t.img} alt={t.name} />
                    <div>
                      <div className="testi-name">{t.name}</div>
                      <div className="testi-jurusan">{t.meta}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="cta-section" id="kontak">
        <div className="container">
          <div className="cta-inner">
            <div className="reveal">
              <div className="section-label cta-label">Siap Mulai?</div>
              <h2>Siap Jadi Bagian Dari Masa Depan Digital?</h2>
              <p>
                Jangan tunda lagi. Kuota terbatas setiap tahunnya. Daftar sekarang
                dan jadilah bagian dari generasi digital yang siap kerja.
              </p>
              <div className="cta-buttons">
                <Link href="/register" className="btn-cta-primary">Daftar Sekarang Juga</Link>
                <a
                  href="https://wa.me/622177201052"
                  className="btn-cta-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hubungi Tim Admission
                </a>
              </div>
            </div>
            <div className="cta-deco reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=520&h=520&fit=crop&q=80"
                alt="Siswa SMK Citra Negara"
              />
              <div className="cta-deco-badge">✓ Pendaftaran Dibuka</div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />

    </>
  );
}