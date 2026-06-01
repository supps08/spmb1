// ============================================================
// PATH   : app/pendaftaran/kartu/page.tsx
// ISI    : Kartu pendaftaran — cetak & download PDF
//          Akses: login + status siswa !== 'draft'
// ============================================================

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/client";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface JurusanInfo {
  nama: string;
  kode: string;
}

interface BerkasInfo {
  foto_url: string | null;
}

interface SiswaKartu {
  nama_lengkap: string | null;
  nisn: string | null;
  asal_sekolah: string | null;
  submitted_at: string | null;
  status: string;
  jurusan: JurusanInfo | null;
  berkas: BerkasInfo | BerkasInfo[] | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
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
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function resolveFotoUrl(berkas: SiswaKartu["berkas"]): string | null {
  if (!berkas) return null;
  if (Array.isArray(berkas)) return berkas[0]?.foto_url ?? null;
  return berkas.foto_url;
}

export default function KartuPendaftaranPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [siswa, setSiswa] = useState<SiswaKartu | null>(null);

  useScrollAnimation();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/pendaftaran");
        return;
      }

      const { data, error } = await supabase
        .from("siswa")
        .select("*, jurusan(nama, kode), berkas(foto_url)")
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
    return `${siswa.jurusan.kode} — ${siswa.jurusan.nama}`;
  }, [siswa]);

  const qrValue = useMemo(() => {
    if (!siswa) return "";
    return JSON.stringify({
      nisn: siswa.nisn ?? "",
      nama: siswa.nama_lengkap ?? "",
      jurusan: jurusanLabel,
      tanggal_daftar: siswa.submitted_at ?? "",
    });
  }, [siswa, jurusanLabel]);

  const fotoUrl = resolveFotoUrl(siswa?.berkas ?? null);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    const card = document.querySelector(".print-card") as HTMLElement | null;
    if (!card) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(card, {
        useCORS: true,
        background: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", margin, 20, imgWidth, imgHeight);
      pdf.save("kartu-pendaftaran.pdf");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <>
        <style>{`
          .kartu-loading {
            text-align: center;
            padding: 80px 24px;
            color: #6B7280;
            font-size: 0.95rem;
          }
        `}</style>
        <div className="kartu-loading no-print">Memuat kartu pendaftaran...</div>
      </>
    );
  }

  if (!siswa) return null;

  return (
    <>
      <style>{`
        .kartu-page-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .kartu-page-header h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #0C0C0C;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .kartu-page-header p {
          font-size: 0.92rem;
          color: #6B7280;
          line-height: 1.6;
        }

        .kartu-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 32px;
        }
        .kartu-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .kartu-btn-primary {
          background: #1C5C38;
          color: #fff;
          border: 2px solid #1C5C38;
        }
        .kartu-btn-primary:hover:not(:disabled) {
          background: #2A7A4E;
          border-color: #2A7A4E;
        }
        .kartu-btn-outline {
          background: #fff;
          color: #1C5C38;
          border: 2px solid #1C5C38;
        }
        .kartu-btn-outline:hover:not(:disabled) {
          background: #F2F8F4;
        }
        .kartu-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .print-card-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .print-card {
          width: 100%;
          max-width: 600px;
          border: 2px solid #1C5C38;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 4px 24px rgba(28, 92, 56, 0.08);
        }

        .print-card-header {
          background: #1C5C38;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .print-card-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #fff;
          flex-shrink: 0;
        }
        .print-card-header-text h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .print-card-header-text p {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .print-card-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 24px;
          align-items: start;
        }

        .print-card-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .print-card-photo {
          width: 100px;
          height: 120px;
          border-radius: 10px;
          border: 2px solid #E5E7EB;
          object-fit: cover;
          background: #F2F8F4;
        }
        .print-card-avatar {
          width: 100px;
          height: 120px;
          border-radius: 10px;
          border: 2px solid #E5E7EB;
          background: #EBF4EE;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #1C5C38;
        }
        .print-card-qr {
          padding: 6px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
        }

        .print-card-data {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .print-card-field dt {
          font-size: 0.68rem;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .print-card-field dd {
          font-size: 0.92rem;
          font-weight: 600;
          color: #0C0C0C;
          line-height: 1.4;
        }
        .print-card-field.highlight dd {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          color: #1C5C38;
        }

        .print-card-footer {
          background: #F2F8F4;
          padding: 12px 24px;
          font-size: 11px;
          color: #6B7280;
          text-align: center;
          line-height: 1.5;
          border-top: 1px solid #E5E7EB;
        }

        @media (max-width: 520px) {
          .print-card-body {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
          }
          .print-card-data {
            width: 100%;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          .pend-main {
            padding: 0 !important;
            max-width: none !important;
          }
          .pend-navbar,
          footer {
            display: none !important;
          }
          .print-card {
            box-shadow: none !important;
            max-width: 100% !important;
            page-break-inside: avoid;
          }
          .print-card-wrap {
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="kartu-page-header no-print" data-animate data-delay="0">
        <h1>Kartu Pendaftaran</h1>
        <p>Simpan atau cetak kartu ini sebagai bukti pendaftaran Anda</p>
      </div>

      <div className="kartu-actions no-print" data-animate data-delay="50">
        <button type="button" className="kartu-btn kartu-btn-primary" onClick={handlePrint}>
          🖨 Cetak Kartu
        </button>
        <button
          type="button"
          className="kartu-btn kartu-btn-outline"
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          ⬇ {downloading ? "Menyiapkan PDF..." : "Download PDF"}
        </button>
      </div>

      <div className="print-card-wrap" data-animate data-delay="100">
        <article className="print-card">
          <header className="print-card-header">
            <div className="print-card-logo">S</div>
            <div className="print-card-header-text">
              <h2>SMK CITRA NEGARA</h2>
              <p>Kartu Pendaftaran 2025/2026</p>
            </div>
          </header>

          <div className="print-card-body">
            <div className="print-card-left">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoUrl}
                  alt={`Foto ${siswa.nama_lengkap ?? "siswa"}`}
                  className="print-card-photo"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="print-card-avatar">{getInitials(siswa.nama_lengkap)}</div>
              )}
              <div className="print-card-qr">
                <QRCodeSVG value={qrValue} size={80} level="M" />
              </div>
            </div>

            <dl className="print-card-data">
              <div className="print-card-field highlight">
                <dt>Nomor Pendaftaran</dt>
                <dd>{nomorPendaftaran}</dd>
              </div>
              <div className="print-card-field">
                <dt>Nama Lengkap</dt>
                <dd>{siswa.nama_lengkap || "—"}</dd>
              </div>
              <div className="print-card-field">
                <dt>NISN</dt>
                <dd>{siswa.nisn || "—"}</dd>
              </div>
              <div className="print-card-field">
                <dt>Jurusan</dt>
                <dd>{jurusanLabel}</dd>
              </div>
              <div className="print-card-field">
                <dt>Asal Sekolah</dt>
                <dd>{siswa.asal_sekolah || "—"}</dd>
              </div>
              <div className="print-card-field">
                <dt>Tanggal Daftar</dt>
                <dd>{formatTanggalDaftar(siswa.submitted_at)}</dd>
              </div>
            </dl>
          </div>

          <footer className="print-card-footer">
            Kartu ini sah sebagai bukti pendaftaran. hello@smkdigital.sch.id · (021)
            77201052
          </footer>
        </article>
      </div>
    </>
  );
}
