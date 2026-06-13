
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface JurusanInfo {
  nama: string;
  kode: string;
}

interface SiswaKartu {
  nama_lengkap: string | null;
  nisn: string | null;
  asal_sekolah: string | null;
  submitted_at: string | null;
  status: string;
  jurusan: JurusanInfo | JurusanInfo[] | null;
}

function formatNomorPendaftaran(nisn: string | null, submittedAt: string | null): string {
  const tahun = submittedAt
    ? new Date(submittedAt).getFullYear()
    : new Date().getFullYear();
  const digits = (nisn ?? "").replace(/\D/g, "");
  const suffix = digits.slice(-6).padStart(6, "0");
  return `CN-${tahun}-${suffix}`;
}

function formatTanggalDaftar(submittedAt: string | null): string {
  if (!submittedAt) return "—";
  return new Date(submittedAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  submitted:  { label: "Dikirim",   color: "#2563EB", bg: "#EFF6FF", desc: "Pendaftaranmu sudah diterima dan sedang menunggu verifikasi." },
  menunggu:   { label: "Menunggu",  color: "#D97706", bg: "#FEF3C7", desc: "Berkasmu sedang dalam proses verifikasi oleh tim kami." },
  diterima:   { label: "Diterima",  color: "#16A34A", bg: "#DCFCE7", desc: "Selamat! Kamu diterima di SMK Citra Negara." },
  ditolak:    { label: "Ditolak",   color: "#DC2626", bg: "#FEE2E2", desc: "Maaf, pendaftaranmu tidak dapat diterima." },
};

export default function KartuPendaftaranPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [siswa, setSiswa] = useState<SiswaKartu | null>(null);

  useScrollAnimation();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/pendaftaran"); return; }

      const { data, error } = await supabase
        .from("siswa")
        .select("nama_lengkap, nisn, asal_sekolah, submitted_at, status, jurusan(nama, kode)")
        .eq("user_id", user.id)
        .single();

      if (error || !data || data.status === "draft") {
        router.replace("/pendaftaran");
        return;
      }

      setSiswa(data as SiswaKartu);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const nomorPendaftaran = useMemo(
    () => formatNomorPendaftaran(siswa?.nisn ?? null, siswa?.submitted_at ?? null),
    [siswa]
  );

  const jurusanLabel = useMemo(() => {
    if (!siswa?.jurusan) return "—";
    const j = Array.isArray(siswa.jurusan) ? siswa.jurusan[0] : siswa.jurusan;
    if (!j) return "—";
    return `${j.kode} — ${j.nama}`;
  }, [siswa]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "#6B7280" }}>
        Memuat status pendaftaran...
      </div>
    );
  }

  if (!siswa) return null;

  const statusCfg = STATUS_CONFIG[siswa.status] ?? STATUS_CONFIG.submitted;

  return (
    <>
      <style>{`
        .kartu-wrap {
          max-width: 540px;
          margin: 0 auto;
        }
        .kartu-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .kartu-header h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.8rem; font-weight: 800;
          color: #0C0C0C; letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .kartu-header p {
          font-size: 0.9rem; color: #6B7280;
        }
        .kartu-status-box {
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .kartu-status-label {
          font-size: 0.75rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .kartu-status-desc {
          font-size: 0.88rem; line-height: 1.5;
        }
        .kartu-card {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .kartu-card-header {
          background: #1C5C38;
          padding: 16px 20px;
        }
        .kartu-card-header h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 800;
          color: #fff; letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .kartu-card-header p {
          font-size: 0.72rem; font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .kartu-nomor {
          padding: 16px 20px;
          border-bottom: 1px solid #F3F4F6;
          background: #F9FAFB;
        }
        .kartu-nomor dt {
          font-size: 0.7rem; font-weight: 600;
          color: #6B7280; text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 4px;
        }
        .kartu-nomor dd {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.2rem; font-weight: 800; color: #1C5C38;
        }
        .kartu-fields {
          padding: 16px 20px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .kartu-field dt {
          font-size: 0.7rem; font-weight: 600;
          color: #6B7280; text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 3px;
        }
        .kartu-field dd {
          font-size: 0.9rem; font-weight: 600; color: #0C0C0C;
        }
        .kartu-card-footer {
          padding: 10px 20px;
          background: #F9FAFB;
          border-top: 1px solid #F3F4F6;
          font-size: 11px; color: #9CA3AF;
          text-align: center;
        }
        .kartu-back {
          display: block; text-align: center;
          font-size: 0.88rem; color: #1C5C38;
          font-weight: 600; text-decoration: none;
        }
        .kartu-back:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .kartu-fields { grid-template-columns: 1fr; }
        }
      
        @media (max-width: 768px) {
          .kartu-wrap { padding: 16px; }
          .kartu-print { transform: none; width: 100%; }
        }
      `}</style>

      <div className="kartu-wrap">
        <div className="kartu-header" data-animate data-delay="0">
          <h1>Status Pendaftaran</h1>
          <p>Bukti pendaftaran SMK Citra Negara 2025/2026</p>
        </div>

        <div
          className="kartu-status-box"
          style={{ background: statusCfg.bg }}
          data-animate data-delay="50"
        >
          <div>
            <div className="kartu-status-label" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </div>
            <div className="kartu-status-desc" style={{ color: statusCfg.color }}>
              {statusCfg.desc}
            </div>
          </div>
        </div>

        <div className="kartu-card" data-animate data-delay="100">
          <div className="kartu-card-header">
            <h2>SMK CITRA NEGARA</h2>
            <p>Kartu Pendaftaran 2025/2026</p>
          </div>

          <dl className="kartu-nomor">
            <dt>Nomor Pendaftaran</dt>
            <dd>{nomorPendaftaran}</dd>
          </dl>

          <div className="kartu-fields">
            <dl className="kartu-field">
              <dt>Nama Lengkap</dt>
              <dd>{siswa.nama_lengkap || "—"}</dd>
            </dl>
            <dl className="kartu-field">
              <dt>NISN</dt>
              <dd>{siswa.nisn || "—"}</dd>
            </dl>
            <dl className="kartu-field">
              <dt>Jurusan</dt>
              <dd>{jurusanLabel}</dd>
            </dl>
            <dl className="kartu-field">
              <dt>Asal Sekolah</dt>
              <dd>{siswa.asal_sekolah || "—"}</dd>
            </dl>
            <dl className="kartu-field">
              <dt>Tanggal Daftar</dt>
              <dd>{formatTanggalDaftar(siswa.submitted_at)}</dd>
            </dl>
            <dl className="kartu-field">
              <dt>Status</dt>
              <dd style={{ color: statusCfg.color }}>{statusCfg.label}</dd>
            </dl>
          </div>

          <div className="kartu-card-footer">
            hello@smkdigital.sch.id · (021) 77201052
          </div>
        </div>

        <Link href="/pendaftaran" className="kartu-back" data-animate data-delay="150">
          ← Kembali ke Pendaftaran
        </Link>
      </div>
    </>
  );
}