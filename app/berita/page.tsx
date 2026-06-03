"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FileText, Newspaper } from "lucide-react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import LandingNavbar from "@/components/landing/navbar";
import LandingFooter from "@/components/landing/footer";

interface BeritaItem {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string | null;
  thumbnail_url: string | null;
  kategori: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const KATEGORI_TABS = ["Semua", "Umum", "Akademik", "Prestasi", "Pengumuman"] as const;
type KategoriTab = (typeof KATEGORI_TABS)[number];

function formatDate(ts: string | null) {
  const d = ts ? new Date(ts) : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BeritaListPage() {
  useScrollAnimation();

  const [berita, setBerita] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState<KategoriTab>("Semua");

  useEffect(() => {
    fetch("/api/berita")
      .then((r) => (r.ok ? r.json() : { berita: [] }))
      .then((d) => setBerita(d.berita ?? []))
      .catch(() => setBerita([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (kategori === "Semua") return berita;
    return berita.filter((b) => b.kategori === kategori);
  }, [berita, kategori]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F9FAFB;
          color: #0C0C0C;
          min-height: 100vh;
        }

        .berita-hero {
          background: #1C5C38;
          padding: 100px 5vw 48px;
          text-align: center;
          color: #fff;
        }

        .berita-hero h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .berita-hero p {
          font-size: 15px;
          opacity: 0.9;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .berita-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 5vw 80px;
        }

        .berita-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }

        .berita-tab {
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #E5E7EB;
          background: #fff;
          color: #374151;
          font-family: inherit;
          transition: all 0.2s;
        }

        .berita-tab.active {
          background: #1C5C38;
          color: #fff;
          border-color: #1C5C38;
        }

        .berita-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .berita-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .berita-grid { grid-template-columns: 1fr; }
        }

        .berita-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s;
        }

        .berita-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .berita-thumb {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px 8px 0 0;
        }

        .berita-thumb-fallback {
          width: 100%;
          height: 200px;
          background: #EBF4EE;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1C5C38;
          border-radius: 8px 8px 0 0;
        }

        .berita-card-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .berita-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #1C5C38;
          background: #EBF4EE;
          padding: 4px 10px;
          border-radius: 4px;
          margin-bottom: 10px;
          width: fit-content;
        }

        .berita-card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #0C0C0C;
          line-height: 1.35;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .berita-card-summary {
          font-size: 13px;
          font-weight: 400;
          color: #6B7280;
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .berita-card-date {
          font-size: 12px;
          color: #9CA3AF;
          margin-bottom: 12px;
        }

        .berita-card-link {
          font-size: 13px;
          font-weight: 600;
          color: #1C5C38;
        }

        .berita-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 24px;
          color: #6B7280;
        }

        .berita-empty svg {
          margin: 0 auto 16px;
          color: #9CA3AF;
        }

        .berita-loading {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px;
          color: #6B7280;
          font-size: 14px;
        }
      `}</style>

      <LandingNavbar activePage="berita" />

      <section className="berita-hero">
        <h1>Berita & Pengumuman</h1>
        <p>Informasi terbaru seputar kegiatan, prestasi, dan pengumuman SMK Citra Negara.</p>
      </section>

      <main className="berita-main">
        <div className="berita-tabs">
          {KATEGORI_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`berita-tab${kategori === tab ? " active" : ""}`}
              onClick={() => setKategori(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="berita-grid">
          {loading ? (
            <div className="berita-loading">Memuat berita...</div>
          ) : filtered.length === 0 ? (
            <div className="berita-empty">
              <Newspaper size={48} strokeWidth={1.25} />
              <p>Belum ada berita.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <Link key={item.id} href={`/berita/${item.slug}`} className="berita-card">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.judul}
                    className="berita-thumb"
                  />
                ) : (
                  <div className="berita-thumb-fallback">
                    <FileText size={40} strokeWidth={1.5} />
                  </div>
                )}
                <div className="berita-card-body">
                  <span className="berita-badge">{item.kategori}</span>
                  <h2 className="berita-card-title">{item.judul}</h2>
                  <p className="berita-card-summary">
                    {item.ringkasan || "—"}
                  </p>
                  <div className="berita-card-date">
                    {formatDate(item.published_at ?? item.created_at)}
                  </div>
                  <span className="berita-card-link">Baca Selengkapnya →</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
