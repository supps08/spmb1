// ============================================================
// PATH   : app/hasil-seleksi/page.tsx
// ISI    : Halaman publik cek status pendaftaran
//          - Input NISN → cari di tabel siswa
//          - Tampilkan status: diterima / ditolak / menunggu / submitted
//          - Tampilkan detail data diri + jurusan
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface HasilSeleksi {
  nama_lengkap: string;
  nisn: string;
  asal_sekolah: string;
  status: "submitted" | "diterima" | "ditolak" | "menunggu";
  jurusan: { kode: string; nama: string } | null;
  submitted_at: string | null;
  verified_at: string | null;
  catatan_verifikasi: string | null;
}

const STATUS_CONFIG = {
  diterima: {
    label: "DITERIMA",
    emoji: "🎉",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
    desc: "Selamat! Kamu diterima di SMK Citra Negara. Segera lakukan daftar ulang sesuai jadwal yang telah ditentukan.",
  },
  ditolak: {
    label: "TIDAK DITERIMA",
    emoji: "😔",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FCA5A5",
    desc: "Mohon maaf, pendaftaranmu belum berhasil pada seleksi ini. Kamu bisa mendaftar kembali pada gelombang berikutnya.",
  },
  menunggu: {
    label: "MENUNGGU VERIFIKASI",
    emoji: "⏳",
    color: "#92400E",
    bg: "#FEF3C7",
    border: "#FCD34D",
    desc: "Berkasmu sedang dalam proses verifikasi oleh tim kami. Harap tunggu 1–3 hari kerja.",
  },
  submitted: {
    label: "BERKAS DIKIRIM",
    emoji: "📋",
    color: "#1E40AF",
    bg: "#DBEAFE",
    border: "#93C5FD",
    desc: "Pendaftaranmu sudah diterima. Berkas sedang antri untuk diverifikasi oleh tim kami.",
  },
};

export default function HasilSeleksiPage() {
  const supabase = createClient();

  const [nisn, setNisn] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  async function handleCek() {
    const cleaned = nisn.trim().replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("NISN harus 10 digit angka.");
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);
    setHasil(null);

    const { data, error: dbError } = await supabase
      .from("siswa")
      .select(`
        nama_lengkap,
        nisn,
        asal_sekolah,
        status,
        submitted_at,
        verified_at,
        catatan_verifikasi,
        jurusan (
          kode,
          nama
        )
      `)
      .eq("nisn", cleaned)
      .neq("status", "draft")
      .single();

    setLoading(false);

    if (dbError || !data) {
      setNotFound(true);
      return;
    }

    const jurusanRaw = data.jurusan;
    const jurusan = Array.isArray(jurusanRaw)
      ? jurusanRaw[0] ?? null
      : jurusanRaw ?? null;

    setHasil({
      nama_lengkap: data.nama_lengkap ?? "-",
      nisn: data.nisn ?? cleaned,
      asal_sekolah: data.asal_sekolah ?? "-",
      status: data.status as HasilSeleksi["status"],
      jurusan,
      submitted_at: data.submitted_at,
      verified_at: data.verified_at,
      catatan_verifikasi: data.catatan_verifikasi,
    });
  }

  function formatDate(ts: string | null) {
    if (!ts) return "-";
    return new Date(ts).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  const statusCfg = hasil ? STATUS_CONFIG[hasil.status] : null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --accent: #1C5C38;
          --accent-light: #EBF4EE;
          --ink: #0C0C0C;
          --muted: #6B7280;
          --border: #E5E7EB;
          --bg: #F9FAFB;
          --white: #FFFFFF;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg); color: var(--ink);
          min-height: 100vh;
        }

        /* Navbar */
        .hs-nav {
          background: var(--white); border-bottom: 1px solid var(--border);
          height: 60px; display: flex; align-items: center;
          position: sticky; top: 0; z-index: 50;
        }
        .hs-nav-inner {
          max-width: 680px; margin: 0 auto; padding: 0 24px;
          width: 100%; display: flex; align-items: center; justify-content: space-between;
        }
        .hs-logo {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800; font-size: 1rem;
          color: var(--ink); text-decoration: none; letter-spacing: -0.02em;
        }
        .hs-logo span { color: var(--accent); }
        .hs-nav-links { display: flex; gap: 20px; list-style: none; }
        .hs-nav-links a {
          font-size: 0.85rem; font-weight: 500; color: var(--muted);
          text-decoration: none; transition: color .2s;
        }
        .hs-nav-links a:hover { color: var(--ink); }
        .hs-nav-links a.active { color: var(--accent); font-weight: 600; }

        /* Page */
        .hs-page {
          max-width: 680px; margin: 0 auto;
          padding: 48px 24px 80px;
        }

        /* Header */
        .hs-header { text-align: center; margin-bottom: 36px; }
        .hs-header h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.9rem; font-weight: 800; color: var(--ink);
          letter-spacing: -0.03em; margin-bottom: 8px;
        }
        .hs-header p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; }

        /* Search card */
        .search-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          margin-bottom: 24px;
        }
        .search-label {
          display: block; font-size: 0.78rem; font-weight: 600;
          color: #374151; margin-bottom: 8px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .search-row { display: flex; gap: 10px; }
        .search-input {
          flex: 1; padding: 12px 16px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem; color: var(--ink); background: #F9FAFB;
          outline: none; transition: border-color .2s;
          letter-spacing: 0.05em;
        }
        .search-input:focus {
          border-color: var(--accent); background: var(--white);
          box-shadow: 0 0 0 3px rgba(28,92,56,0.08);
        }
        .search-btn {
          background: var(--accent); color: white; border: none;
          border-radius: 10px; padding: 12px 24px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: background .2s; white-space: nowrap;
        }
        .search-btn:hover:not(:disabled) { background: #2A7A4E; }
        .search-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .search-hint { font-size: 0.75rem; color: var(--muted); margin-top: 8px; }
        .error-msg {
          background: #FEE2E2; border: 1px solid #FECACA;
          border-radius: 8px; padding: 10px 14px;
          font-size: 0.83rem; color: #DC2626; margin-top: 12px;
        }

        /* Not found */
        .not-found {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 16px; padding: 40px;
          text-align: center;
        }
        .not-found .nf-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .not-found h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.1rem; font-weight: 700; color: var(--ink);
          margin-bottom: 8px;
        }
        .not-found p { font-size: 0.85rem; color: var(--muted); line-height: 1.6; }

        /* Result card */
        .result-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
        }

        /* Status banner */
        .status-banner {
          padding: 24px 28px;
          display: flex; align-items: center; gap: 16px;
        }
        .status-emoji { font-size: 2rem; }
        .status-label {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em;
        }
        .status-desc { font-size: 0.85rem; margin-top: 4px; line-height: 1.5; opacity: 0.85; }

        /* Detail section */
        .detail-section { padding: 24px 28px; }
        .detail-section-title {
          font-size: 0.72rem; font-weight: 700; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 16px; padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .detail-item {}
        .detail-key { font-size: 0.72rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; }
        .detail-val { font-size: 0.9rem; color: var(--ink); font-weight: 500; margin-top: 3px; }

        .divider { border: none; border-top: 1px solid var(--border); }

        /* Catatan */
        .catatan-box {
          margin: 0 28px 24px;
          background: #FEF3C7; border: 1px solid #FDE68A;
          border-radius: 10px; padding: 14px 16px;
          font-size: 0.83rem; color: #92400E; line-height: 1.5;
        }
        .catatan-box strong { display: block; margin-bottom: 4px; }

        /* CTA */
        .result-cta {
          padding: 20px 28px; background: #F9FAFB;
          border-top: 1px solid var(--border);
          display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
        }
        .btn-daftar-ulang {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent); color: white; border: none;
          border-radius: 8px; padding: 10px 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          text-decoration: none; transition: background .2s;
        }
        .btn-daftar-ulang:hover { background: #2A7A4E; }
        .btn-cek-lagi {
          background: transparent; color: var(--muted);
          border: 1.5px solid var(--border); border-radius: 8px;
          padding: 10px 16px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          transition: all .2s;
        }
        .btn-cek-lagi:hover { border-color: #9CA3AF; color: var(--ink); }

        /* Info boxes */
        .info-boxes {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-top: 24px;
        }
        .info-box {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px;
          display: flex; gap: 12px; align-items: flex-start;
        }
        .info-box-icon { font-size: 1.2rem; flex-shrink: 0; }
        .info-box-title { font-size: 0.8rem; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
        .info-box-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.4; }

        @media (max-width: 600px) {
          .search-row { flex-direction: column; }
          .detail-grid { grid-template-columns: 1fr; }
          .info-boxes { grid-template-columns: 1fr; }
          .hs-nav-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="hs-nav">
        <div className="hs-nav-inner">
          <Link href="/" className="hs-logo">SMK <span>Citra Negara</span></Link>
          <ul className="hs-nav-links">
            <li><Link href="/">Beranda</Link></li>
            <li><Link href="/pendaftaran">Pendaftaran</Link></li>
            <li><Link href="/hasil-seleksi" className="active">Hasil Seleksi</Link></li>
          </ul>
        </div>
      </nav>

      <div className="hs-page">
        {/* Header */}
        <div className="hs-header">
          <h1>Cek Hasil Seleksi</h1>
          <p>Masukkan NISN kamu untuk melihat status pendaftaran di SMK Citra Negara.</p>
        </div>

        {/* Search */}
        <div className="search-card">
          <label className="search-label">Nomor Induk Siswa Nasional (NISN)</label>
          <div className="search-row">
            <input
              className="search-input"
              type="text"
              placeholder="Masukkan 10 digit NISN"
              maxLength={10}
              value={nisn}
              onChange={e => {
                setNisn(e.target.value.replace(/\D/g, ""));
                setError("");
                setNotFound(false);
                setHasil(null);
              }}
              onKeyDown={e => { if (e.key === "Enter") handleCek(); }}
            />
            <button className="search-btn" disabled={loading} onClick={handleCek}>
              {loading ? "Mencari..." : "Cek Status"}
            </button>
          </div>
          <div className="search-hint">
            NISN terdiri dari 10 digit angka. Contoh: 0012345678
          </div>
          {error && <div className="error-msg">⚠️ {error}</div>}
        </div>

        {/* Not found */}
        {notFound && (
          <div className="not-found">
            <div className="nf-icon">🔍</div>
            <h3>Data Tidak Ditemukan</h3>
            <p>
              NISN <strong>{nisn}</strong> tidak ditemukan dalam sistem kami.
              Pastikan NISN yang kamu masukkan sudah benar, atau cek apakah
              pendaftaranmu sudah berhasil dikirim.
            </p>
            <div style={{ marginTop: "20px" }}>
              <Link href="/pendaftaran" style={{
                display: "inline-block", background: "#1C5C38", color: "white",
                padding: "10px 22px", borderRadius: "8px",
                fontWeight: 600, fontSize: "0.85rem", textDecoration: "none",
              }}>
                Ke Halaman Pendaftaran →
              </Link>
            </div>
          </div>
        )}

        {/* Result */}
        {hasil && statusCfg && (
          <div className="result-card">
            {/* Status banner */}
            <div className="status-banner" style={{
              background: statusCfg.bg,
              borderBottom: `1px solid ${statusCfg.border}`,
              color: statusCfg.color,
            }}>
              <div className="status-emoji">{statusCfg.emoji}</div>
              <div>
                <div className="status-label">{statusCfg.label}</div>
                <div className="status-desc">{statusCfg.desc}</div>
              </div>
            </div>

            {/* Detail data */}
            <div className="detail-section">
              <div className="detail-section-title">Data Pendaftar</div>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-key">Nama Lengkap</div>
                  <div className="detail-val">{hasil.nama_lengkap}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">NISN</div>
                  <div className="detail-val" style={{ fontFamily: "monospace" }}>{hasil.nisn}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Asal Sekolah</div>
                  <div className="detail-val">{hasil.asal_sekolah}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Jurusan Dipilih</div>
                  <div className="detail-val">
                    {hasil.jurusan
                      ? `${hasil.jurusan.kode} — ${hasil.jurusan.nama}`
                      : "-"}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Tanggal Daftar</div>
                  <div className="detail-val">{formatDate(hasil.submitted_at)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-key">Tanggal Verifikasi</div>
                  <div className="detail-val">{formatDate(hasil.verified_at)}</div>
                </div>
              </div>
            </div>

            {/* Catatan verifikasi (jika ada) */}
            {hasil.catatan_verifikasi && (
              <div className="catatan-box">
                <strong>📝 Catatan dari Tim Verifikasi:</strong>
                {hasil.catatan_verifikasi}
              </div>
            )}

            {/* CTA */}
            <div className="result-cta">
              {hasil.status === "diterima" && (
                <a href="mailto:hello@smkdigital.sch.id" className="btn-daftar-ulang">
                  📞 Hubungi Kami untuk Daftar Ulang
                </a>
              )}
              <button className="btn-cek-lagi" onClick={() => {
                setHasil(null); setNisn(""); setNotFound(false);
              }}>
                Cek NISN Lain
              </button>
            </div>
          </div>
        )}

        {/* Info boxes (tampil saat belum ada hasil) */}
        {!hasil && !notFound && (
          <div className="info-boxes">
            <div className="info-box">
              <div className="info-box-icon">📅</div>
              <div>
                <div className="info-box-title">Pengumuman Berkala</div>
                <div className="info-box-desc">
                  Hasil seleksi diumumkan secara bertahap setelah proses verifikasi berkas selesai.
                </div>
              </div>
            </div>
            <div className="info-box">
              <div className="info-box-icon">📱</div>
              <div>
                <div className="info-box-title">Notifikasi WhatsApp</div>
                <div className="info-box-desc">
                  Kamu juga akan mendapat notifikasi via WhatsApp ke nomor yang didaftarkan.
                </div>
              </div>
            </div>
            <div className="info-box">
              <div className="info-box-icon">🎯</div>
              <div>
                <div className="info-box-title">Kriteria Seleksi</div>
                <div className="info-box-desc">
                  Seleksi berdasarkan nilai rapor, kelengkapan berkas, dan kuota jurusan yang tersedia.
                </div>
              </div>
            </div>
            <div className="info-box">
              <div className="info-box-icon">🎧</div>
              <div>
                <div className="info-box-title">Butuh Bantuan?</div>
                <div className="info-box-desc">
                  Hubungi CS kami di (021) 77201052 atau hello@smkdigital.sch.id
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}