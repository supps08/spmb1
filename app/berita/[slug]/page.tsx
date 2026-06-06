"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import LandingNavbar from "@/components/landing/navbar";
import LandingFooter from "@/components/landing/footer";

interface BeritaDetail {
  id: string;
  judul: string;
  slug: string;
  konten: string | null;
  ringkasan: string | null;
  thumbnail_url: string | null;
  kategori: string;
  published_at: string | null;
  created_at: string;
  author_name: string | null;
}

function formatDate(ts: string | null) {
  const d = ts ? new Date(ts) : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BeritaDetailPage() {
  useScrollAnimation();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [berita, setBerita] = useState<BeritaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/berita/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d?.berita) setBerita(d.berita);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <LandingNavbar activePage="berita" />
        <div className="berita-detail-wrap">
          <p className="berita-detail-loading">Memuat artikel...</p>
        </div>
        <LandingFooter />
        <DetailStyles />
      </>
    );
  }

  if (notFound || !berita) {
    return (
      <>
        <LandingNavbar activePage="berita" />
        <div className="berita-detail-wrap">
          <h1 className="berita-detail-404">Berita tidak ditemukan</h1>
          <Link href="/berita" className="berita-detail-back">
            ← Kembali ke Berita
          </Link>
        </div>
        <LandingFooter />
        <DetailStyles />
      </>
    );
  }

  const paragraphs = (berita.konten ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <DetailStyles />
      <LandingNavbar activePage="berita" />

      <article className="berita-detail-wrap">
        <nav className="berita-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true"> &gt; </span>
          <Link href="/berita">Berita</Link>
          <span aria-hidden="true"> &gt; </span>
          <span className="berita-breadcrumb-current">{berita.judul}</span>
        </nav>

        <span className="berita-detail-badge">{berita.kategori}</span>
        <h1 className="berita-detail-title">{berita.judul}</h1>
        <div className="berita-detail-meta">
          <span>{formatDate(berita.published_at ?? berita.created_at)}</span>
          {berita.author_name && (
            <>
              <span className="berita-meta-sep">·</span>
              <span>{berita.author_name}</span>
            </>
          )}
        </div>

        {berita.thumbnail_url && (
          <img
            src={berita.thumbnail_url}
            alt={berita.judul}
            className="berita-detail-thumb"
          />
        )}

        <div className="berita-detail-prose">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => {
              if (para.startsWith("## ")) {
                return (
                  <h2 key={i}>{para.replace(/^##\s+/, "")}</h2>
                );
              }
              return <p key={i}>{para}</p>;
            })
          ) : (
            <p>{berita.ringkasan || "—"}</p>
          )}
        </div>

        <Link href="/berita" className="berita-detail-back">
          ← Kembali ke Berita
        </Link>
      </article>

      <LandingFooter />
    </>
  );
}

function DetailStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background: #F9FAFB;
        color: #0C0C0C;
        min-height: 100vh;
      }

      .berita-detail-wrap {
        max-width: 720px;
        margin: 0 auto;
        padding: 100px 24px 80px;
        text-align: left;
      }

      .berita-detail-loading,
      .berita-detail-404 {
        text-align: center;
        font-size: 16px;
        color: #6B7280;
        margin-top: 48px;
      }

      .berita-detail-404 {
        font-family: 'Bricolage Grotesque', sans-serif;
        font-size: 24px;
        font-weight: 700;
        color: #0C0C0C;
        margin-bottom: 24px;
      }

      .berita-breadcrumb {
        font-size: 13px;
        color: #6B7280;
        margin-bottom: 20px;
      }

      .berita-breadcrumb a {
        color: #1C5C38;
        text-decoration: none;
      }

      .berita-breadcrumb a:hover { text-decoration: underline; }

      .berita-breadcrumb-current {
        color: #374151;
      }

      .berita-detail-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: #1C5C38;
        background: #EBF4EE;
        padding: 4px 10px;
        border-radius: 4px;
        margin-bottom: 16px;
      }

      .berita-detail-title {
        font-family: 'Bricolage Grotesque', sans-serif;
        font-size: 36px;
        font-weight: 800;
        color: #0C0C0C;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      .berita-detail-meta {
        font-size: 14px;
        color: #6B7280;
        margin-top: 12px;
        margin-bottom: 8px;
      }

      .berita-meta-sep { margin: 0 8px; }

      .berita-detail-thumb {
        width: 100%;
        border-radius: 12px;
        margin: 24px 0;
        object-fit: cover;
        max-height: 400px;
      }

      .berita-detail-prose p {
        font-size: 15px;
        line-height: 1.8;
        color: #374151;
        margin-bottom: 16px;
      }

      .berita-detail-prose h2 {
        font-family: 'Bricolage Grotesque', sans-serif;
        font-size: 22px;
        font-weight: 700;
        color: #0C0C0C;
        margin: 32px 0 12px;
      }

      .berita-detail-back {
        display: inline-block;
        margin-top: 40px;
        font-size: 14px;
        font-weight: 600;
        color: #1C5C38;
        text-decoration: none;
      }

      .berita-detail-back:hover { text-decoration: underline; }

      @media (max-width: 768px) {
        .berita-detail-wrap {
          padding: 80px 16px 60px;
        }
        .berita-detail-title {
          font-size: 26px;
        }
        .berita-detail-prose p {
          font-size: 14px;
        }
        .berita-detail-prose h2 {
          font-size: 18px;
        }
      }

      @media (max-width: 480px) {
        .berita-detail-wrap {
          padding: 72px 12px 48px;
        }
        .berita-detail-title {
          font-size: 22px;
        }
        .berita-detail-thumb {
          max-height: 220px;
        }
      }
    `}</style>
  );
}