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
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import LandingFooter from "@/components/landing/footer";
import LandingNavbar from "@/components/landing/navbar";

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

interface StatusStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
  Icon: LucideIcon;
}

const STATUS_CONFIG: Record<HasilSeleksi["status"], StatusStyle> = {
  diterima: {
    label: "DITERIMA",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#A7F3D0",
    desc: "Selamat! Kamu diterima di SMK Citra Negara. Segera lakukan daftar ulang sesuai jadwal yang telah ditentukan.",
    Icon: CheckCircle,
  },
  ditolak: {
    label: "TIDAK DITERIMA",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
    desc: "Mohon maaf, pendaftaranmu belum berhasil pada seleksi ini. Kamu bisa mendaftar kembali pada gelombang berikutnya.",
    Icon: XCircle,
  },
  menunggu: {
    label: "MENUNGGU VERIFIKASI",
    color: "#92400E",
    bg: "#FEF3C7",
    border: "#FDE68A",
    desc: "Berkasmu sedang dalam proses verifikasi oleh tim kami. Harap tunggu 1–3 hari kerja.",
    Icon: Clock,
  },
  submitted: {
    label: "BERKAS DIKIRIM",
    color: "#1E40AF",
    bg: "#DBEAFE",
    border: "#BFDBFE",
    desc: "Pendaftaranmu sudah diterima. Berkas sedang antri untuk diverifikasi oleh tim kami.",
    Icon: FileText,
  },
};

export default function HasilSeleksiPage() {
  useScrollAnimation();

  const supabase = createClient();

  const [nisn, setNisn] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDateShort(ts: string | null) {
    if (!ts) return "-";
    return new Date(ts).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const statusCfg = hasil ? STATUS_CONFIG[hasil.status] : null;
  const StatusIcon = statusCfg?.Icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: #1c5c38;
          --accent-hover: #2a7a4e;
          --ink: #0c0c0c;
          --muted: #6b7280;
          --border: #e5e7eb;
          --bg: #f9fafb;
          --white: #ffffff;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }

        .hs-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 116px 24px 0;
        }

        .hs-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .hs-header h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .hs-header p {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        .search-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 24px;
        }

        .search-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .search-row {
          display: flex;
          gap: 10px;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: inherit;
          font-size: 15px;
          color: var(--ink);
          background: #f9fafb;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          letter-spacing: 0.05em;
        }

        .search-input:focus {
          border-color: var(--accent);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
        }

        .search-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 22px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .search-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .search-hint {
          font-size: 12px;
          color: var(--muted);
          margin-top: 8px;
        }

        .error-msg {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #dc2626;
          margin-top: 12px;
        }

        .not-found {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 40px 28px;
          text-align: center;
          margin-bottom: 24px;
        }

        .not-found h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .not-found p {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        .result-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
          animation: fadeUp 0.4s ease;
        }

        .status-banner {
          padding: 24px 28px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .status-icon-wrap {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .status-label {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .status-desc {
          font-size: 14px;
          margin-top: 6px;
          line-height: 1.55;
          opacity: 0.9;
        }

        .detail-section {
          padding: 24px 28px;
        }

        .detail-section-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .detail-key {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .detail-val {
          font-size: 14px;
          color: var(--ink);
          font-weight: 500;
          margin-top: 4px;
        }

        .catatan-box {
          margin: 0 28px 24px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 13px;
          color: #92400e;
          line-height: 1.5;
        }

        .catatan-box strong {
          display: block;
          margin-bottom: 4px;
        }

        .result-cta {
          padding: 20px 28px;
          background: #f9fafb;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .btn-daftar-ulang {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-daftar-ulang:hover {
          background: var(--accent-hover);
        }

        .btn-cek-lagi {
          background: #fff;
          color: var(--muted);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 16px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cek-lagi:hover {
          border-color: #9ca3af;
          color: var(--ink);
        }

        .info-boxes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 48px;
        }

        .info-box {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }

        .info-box-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .info-box-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.45;
        }

        .btn-link {
          display: inline-block;
          margin-top: 20px;
          background: var(--accent);
          color: #fff;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-link:hover {
          background: var(--accent-hover);
        }

        .timeline-section {
          padding: 20px 28px 24px;
          border-bottom: 1px solid var(--border);
        }

        .timeline-track {
          display: flex;
          align-items: flex-start;
          gap: 0;
          width: 100%;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .timeline-dot.filled {
          background: #1C5C38;
        }

        .timeline-dot.filled.active {
          animation: pulse-ring 1.5s ease-out infinite;
        }

        .timeline-dot.empty {
          border: 2px solid #E5E7EB;
          background: white;
        }

        .timeline-connector {
          flex: 1;
          height: 2px;
          align-self: center;
          min-width: 12px;
        }

        .timeline-label {
          font-size: 11px;
          font-weight: 500;
          color: #6B7280;
          text-align: center;
          max-width: 80px;
          margin-top: 8px;
          line-height: 1.3;
        }

        .timeline-date {
          font-size: 10px;
          color: #9CA3AF;
          text-align: center;
          max-width: 80px;
          margin-top: 2px;
          line-height: 1.3;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(28,92,56,0.4); }
          100% { box-shadow: 0 0 0 8px rgba(28,92,56,0); }
        }

        @media (max-width: 600px) {
          .search-row { flex-direction: column; }
          .detail-grid { grid-template-columns: 1fr; }
          .info-boxes { grid-template-columns: 1fr; }
        }
      `}</style>

      <LandingNavbar activePage="hasil-seleksi" />

      <div className="hs-page">
        <div className="hs-header" data-animate data-delay="0">
          <h1>Cek Hasil Seleksi</h1>
          <p>
            Masukkan NISN kamu untuk melihat status pendaftaran di SMK Citra
            Negara.
          </p>
        </div>

        <div className="search-card" data-animate data-delay="50">
          <label className="search-label" htmlFor="nisn-input">
            Nomor Induk Siswa Nasional (NISN)
          </label>
          <div className="search-row">
            <input
              id="nisn-input"
              className="search-input"
              type="text"
              placeholder="Masukkan 10 digit NISN"
              maxLength={10}
              value={nisn}
              onChange={(e) => {
                setNisn(e.target.value.replace(/\D/g, ""));
                setError("");
                setNotFound(false);
                setHasil(null);
                setCopied(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCek();
              }}
            />
            <button
              type="button"
              className="search-btn"
              disabled={loading}
              onClick={handleCek}
            >
              <Search size={18} />
              {loading ? "Mencari..." : "Cek Status"}
            </button>
          </div>
          <p className="search-hint">
            NISN terdiri dari 10 digit angka. Contoh: 0012345678
          </p>
          {error && <div className="error-msg">{error}</div>}
        </div>

        {notFound && (
          <div className="not-found" data-animate data-delay="100">
            <h3>Data Tidak Ditemukan</h3>
            <p>
              NISN <strong>{nisn}</strong> tidak ditemukan dalam sistem kami.
              Pastikan NISN yang kamu masukkan sudah benar, atau cek apakah
              pendaftaranmu sudah berhasil dikirim.
            </p>
            <Link href="/pendaftaran" className="btn-link">
              Ke Halaman Pendaftaran →
            </Link>
          </div>
        )}

        {hasil && statusCfg && StatusIcon && (
          <div className="result-card" data-animate data-delay="100">
            <div
              className="status-banner"
              style={{
                background: statusCfg.bg,
                borderBottom: `1px solid ${statusCfg.border}`,
                color: statusCfg.color,
              }}
            >
              <div className="status-icon-wrap">
                <StatusIcon size={32} strokeWidth={2.25} />
              </div>
              <div>
                <div className="status-label">{statusCfg.label}</div>
                <div className="status-desc">{statusCfg.desc}</div>
              </div>
            </div>

            {(() => {
              const step1Filled = !!hasil.submitted_at;
              const step2Filled = !!hasil.verified_at;
              const step3Filled =
                hasil.status === "diterima" || hasil.status === "ditolak";
              const step4Filled = hasil.status === "diterima";
              const filledSteps = [
                step1Filled,
                step2Filled,
                step3Filled,
                step4Filled,
              ];
              const lastActiveIdx = filledSteps.lastIndexOf(true);

              const steps: {
                key: string;
                label: string;
                date: string;
                filled: boolean;
              }[] = [
                {
                  key: "pendaftaran",
                  label: "Pendaftaran Diterima",
                  date: formatDateShort(hasil.submitted_at),
                  filled: step1Filled,
                },
                {
                  key: "verifikasi",
                  label: "Berkas Diverifikasi",
                  date: hasil.verified_at
                    ? formatDateShort(hasil.verified_at)
                    : "Menunggu verifikasi",
                  filled: step2Filled,
                },
              ];

              if (step3Filled) {
                steps.push({
                  key: "seleksi",
                  label: "Hasil Seleksi",
                  date: formatDateShort(hasil.verified_at),
                  filled: step3Filled,
                });
              }

              if (hasil.status === "diterima") {
                steps.push({
                  key: "daftar-ulang",
                  label: "Daftar Ulang",
                  date: "Menunggu daftar ulang",
                  filled: step4Filled,
                });
              }

              return (
                <div className="timeline-section">
                  <div className="timeline-track">
                    {steps.map((step, idx) => (
                      <span key={step.key} style={{ display: "contents" }}>
                        {idx > 0 && (
                          <div
                            className="timeline-connector"
                            style={{
                              background:
                                step.filled && steps[idx - 1].filled
                                  ? "#1C5C38"
                                  : "#E5E7EB",
                            }}
                          />
                        )}
                        <div className="timeline-step">
                          <div
                            className={`timeline-dot ${step.filled ? "filled" : "empty"}${step.filled && idx === lastActiveIdx ? " active" : ""}`}
                          />
                          <div className="timeline-label">{step.label}</div>
                          <div className="timeline-date">{step.date}</div>
                        </div>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="detail-section">
              <div className="detail-section-title">Data Pendaftar</div>
              <div className="detail-grid">
                <div>
                  <div className="detail-key">Nama Lengkap</div>
                  <div className="detail-val">{hasil.nama_lengkap}</div>
                </div>
                <div>
                  <div className="detail-key">NISN</div>
                  <div className="detail-val" style={{ fontFamily: "monospace" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{hasil.nisn}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(hasil.nisn);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: copied ? "#1C5C38" : "#9CA3AF",
                          fontSize: 12,
                          padding: "2px 8px",
                          borderRadius: 4,
                          transition: "color 0.2s",
                          fontFamily: "inherit",
                        }}
                      >
                        {copied ? "✓ Disalin" : "Salin"}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="detail-key">Asal Sekolah</div>
                  <div className="detail-val">{hasil.asal_sekolah}</div>
                </div>
                <div>
                  <div className="detail-key">Jurusan Dipilih</div>
                  <div className="detail-val">
                    {hasil.jurusan
                      ? `${hasil.jurusan.kode} — ${hasil.jurusan.nama}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="detail-key">Tanggal Daftar</div>
                  <div className="detail-val">
                    {formatDate(hasil.submitted_at)}
                  </div>
                </div>
                <div>
                  <div className="detail-key">Tanggal Verifikasi</div>
                  <div className="detail-val">
                    {formatDate(hasil.verified_at)}
                  </div>
                </div>
              </div>
            </div>

            {hasil.catatan_verifikasi && (
              <div className="catatan-box">
                <strong>Catatan dari Tim Verifikasi:</strong>
                {hasil.catatan_verifikasi}
              </div>
            )}

            <div className="result-cta">
              {hasil.status === "diterima" && (
                <a
                  href="mailto:hello@smkdigital.sch.id"
                  className="btn-daftar-ulang"
                >
                  Hubungi Kami untuk Daftar Ulang
                </a>
              )}
              <button
                type="button"
                className="btn-cek-lagi"
                onClick={() => {
                  setHasil(null);
                  setNisn("");
                  setNotFound(false);
                  setCopied(false);
                }}
              >
                Cek NISN Lain
              </button>
            </div>
          </div>
        )}

        {!hasil && !notFound && (
          <div className="info-boxes" data-animate data-delay="100">
            <div className="info-box">
              <div className="info-box-title">Pengumuman Berkala</div>
              <div className="info-box-desc">
                Hasil seleksi diumumkan secara bertahap setelah proses
                verifikasi berkas selesai.
              </div>
            </div>
            <div className="info-box">
              <div className="info-box-title">Notifikasi WhatsApp</div>
              <div className="info-box-desc">
                Kamu juga akan mendapat notifikasi via WhatsApp ke nomor yang
                didaftarkan.
              </div>
            </div>
            <div className="info-box">
              <div className="info-box-title">Kriteria Seleksi</div>
              <div className="info-box-desc">
                Seleksi berdasarkan nilai rapor, kelengkapan berkas, dan kuota
                jurusan yang tersedia.
              </div>
            </div>
            <div className="info-box">
              <div className="info-box-title">Butuh Bantuan?</div>
              <div className="info-box-desc">
                Hubungi CS kami di (021) 77201052 atau hello@smkdigital.sch.id
              </div>
            </div>
          </div>
        )}
      </div>

      <LandingFooter />
    </>
  );
}
