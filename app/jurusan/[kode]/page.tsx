"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LandingNavbar from "@/components/landing/navbar";
import LandingFooter from "@/components/landing/footer";

type JurusanRow = {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string | null;
  kuota: number;
};

type JurusanExtra = {
  tentang: string;
  keahlian: string[];
  prospek: string[];
  sertifikasi: string;
};

const JURUSAN_EXTRA: Record<string, JurusanExtra> = {
  PPLG: {
    tentang:
      "Program Rekayasa Perangkat Lunak membekali siswa dengan kompetensi pengembangan aplikasi modern — dari analisis kebutuhan, desain sistem, coding, hingga deployment. Kurikulum diselaraskan dengan standar industri dan dilengkapi praktik berbasis proyek nyata.",
    keahlian: [
      "Web Development",
      "Mobile App",
      "Database",
      "UI/UX Design",
      "Cloud Computing",
    ],
    prospek: [
      "Software Engineer",
      "Web Developer",
      "Mobile Developer",
      "IT Consultant",
    ],
    sertifikasi: "Junior Web Developer · Mobile App Developer",
  },
  TKJ: {
    tentang:
      "Program Teknik Komputer dan Jaringan fokus pada infrastruktur IT, keamanan jaringan, dan administrasi server. Siswa dilatih merancang, mengimplementasikan, dan memelihara sistem jaringan sesuai kebutuhan organisasi.",
    keahlian: [
      "Jaringan Komputer",
      "Keamanan Siber",
      "Server Administration",
      "Cloud Infrastructure",
    ],
    prospek: [
      "Network Engineer",
      "System Administrator",
      "IT Security",
      "Cloud Engineer",
    ],
    sertifikasi: "Network Administrator · Cyber Security Associate",
  },
  MPLB: {
    tentang:
      "Program Manajemen Perkantoran dan Layanan Bisnis menyiapkan tenaga profesional di bidang administrasi, operasional kantor, dan layanan pelanggan dengan penguasaan teknologi informasi bisnis.",
    keahlian: [
      "Administrasi Perkantoran",
      "Manajemen Bisnis",
      "Teknologi Informasi Bisnis",
    ],
    prospek: [
      "Staff Administrasi",
      "Business Analyst",
      "Office Manager",
    ],
    sertifikasi: "Office Administration · Business Management",
  },
  DKV: {
    tentang:
      "Program Desain Komunikasi Visual mengembangkan kreativitas visual siswa dalam desain grafis, branding, dan media digital. Pembelajaran menggabungkan teori desain dengan praktik tools industri.",
    keahlian: [
      "Desain Grafis",
      "UI/UX",
      "Branding",
      "Motion Graphics",
      "Fotografi",
    ],
    prospek: [
      "Graphic Designer",
      "UI/UX Designer",
      "Brand Strategist",
      "Content Creator",
    ],
    sertifikasi: "Graphic Design · Digital Media Production",
  },
  MPC: {
    tentang:
      "Program Multimedia dan Produksi Konten membekali siswa menghasilkan konten kreatif berkualitas — video, foto, audio, dan strategi distribusi digital untuk berbagai platform.",
    keahlian: [
      "Videografi",
      "Fotografi",
      "Editing Video",
      "Content Strategy",
      "Podcast",
    ],
    prospek: [
      "Content Creator",
      "Videografer",
      "Social Media Manager",
      "Broadcaster",
    ],
    sertifikasi: "Video Production · Content Creation",
  },
  PH: {
    tentang:
      "Program Perhotelan dan Pariwisata menyiapkan profesional hospitality dengan kompetensi pelayanan tamu, manajemen operasional hotel, dan industri pariwisata yang berstandar internasional.",
    keahlian: [
      "Pelayanan Tamu",
      "Manajemen Hotel",
      "Kuliner",
      "Event Organizer",
      "Pariwisata",
    ],
    prospek: [
      "Hotel Manager",
      "Tour Guide",
      "Event Organizer",
      "Restaurant Manager",
    ],
    sertifikasi: "Front Office · Food & Beverage Service",
  },
};

const DEFAULT_EXTRA: JurusanExtra = {
  tentang:
    "Program kejuruan SMK Citra Negara dirancang untuk menghasilkan lulusan yang siap kerja dan siap melanjutkan pendidikan di bidang terkait.",
  keahlian: ["Kompetensi Kejuruan", "Praktik Industri", "Soft Skills"],
  prospek: ["Tenaga Ahli", "Wirausaha", "Melanjutkan Kuliah"],
  sertifikasi: "Sertifikasi Kompetensi Kejuruan",
};

export default function JurusanDetailPage() {
  const params = useParams();
  const kode = String(params.kode ?? "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [jurusan, setJurusan] = useState<JurusanRow | null>(null);
  const [totalPendaftar, setTotalPendaftar] = useState(0);
  const [diterima, setDiterima] = useState(0);

  useEffect(() => {
    if (!kode) {
      setMissing(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const { data: jurusanData, error } = await supabase
        .from("jurusan")
        .select("id, kode, nama, deskripsi, kuota")
        .eq("kode", kode)
        .single();

      if (cancelled) return;

      if (error || !jurusanData) {
        setMissing(true);
        setLoading(false);
        return;
      }

      const { count: total } = await supabase
        .from("siswa")
        .select("*", { count: "exact", head: true })
        .eq("jurusan_id", jurusanData.id)
        .neq("status", "draft");

      const { count: acc } = await supabase
        .from("siswa")
        .select("*", { count: "exact", head: true })
        .eq("jurusan_id", jurusanData.id)
        .eq("status", "diterima");

      if (cancelled) return;

      setJurusan(jurusanData);
      setTotalPendaftar(total ?? 0);
      setDiterima(acc ?? 0);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [kode]);

  useEffect(() => {
    if (missing) notFound();
  }, [missing]);

  const extra = JURUSAN_EXTRA[kode] ?? DEFAULT_EXTRA;
  const kuota = jurusan?.kuota ?? 0;
  const sisaKuota = Math.max(0, kuota - totalPendaftar);
  const kuotaTerisiPct =
    kuota > 0 ? Math.min(100, Math.round((totalPendaftar / kuota) * 100)) : 0;

  return (
    <>
      <LandingNavbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .jd-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #0C0C0C;
          background: #fff;
        }
        .jd-page h1, .jd-page h2, .jd-page h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          letter-spacing: -0.03em;
        }
        .jd-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 5vw;
        }

        .jd-hero {
          background: #1C5C38;
          color: #fff;
          padding: calc(68px + 80px) 0 80px;
          position: relative;
          overflow: hidden;
        }
        .jd-hero-inner {
          display: flex;
          align-items: center;
          gap: 48px;
        }
        .jd-hero-content { flex: 1; }
        .jd-hero-photo {
          width: 340px; flex-shrink: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
        }
        .jd-hero-photo img {
          width: 100%; height: 420px;
          object-fit: cover; object-position: top;
          display: block;
        }
        @media (max-width: 768px) {
          .jd-hero-inner { flex-direction: column; }
          .jd-hero-photo { width: 100%; }
          .jd-hero-photo img { height: 260px; }
        }
        .jd-hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 9999px;
          padding: 8px 16px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .jd-hero h1 {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
          max-width: 720px;
        }
        .jd-hero-desc {
          font-size: 1.05rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.85);
          max-width: 640px;
          margin-bottom: 32px;
        }
        .jd-hero-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 32px;
          margin-bottom: 36px;
        }
        .jd-hero-stat-val {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
        }
        .jd-hero-stat-lbl {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          margin-top: 4px;
        }
        .jd-btn-white {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #1C5C38;
          border-radius: 9999px;
          padding: 14px 28px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .jd-btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .jd-tentang {
          padding: 80px 0;
        }
        .jd-tentang-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .jd-tentang h2 {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: 800;
          margin-bottom: 20px;
        }
        .jd-tentang p {
          color: #696969;
          line-height: 1.75;
          margin-bottom: 24px;
        }
        .jd-keahlian-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .jd-keahlian-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-size: 0.95rem;
          font-weight: 500;
        }
        .jd-keahlian-list li::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1C5C38;
          flex-shrink: 0;
        }

        .jd-info-card {
          background: #F9FAFB;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 32px;
        }
        .jd-info-row {
          padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .jd-info-row:last-child { border-bottom: none; }
        .jd-info-label {
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #696969;
          margin-bottom: 6px;
        }
        .jd-info-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .jd-prospek-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .jd-prospek-tag {
          background: #EBF4EE;
          color: #1C5C38;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 9999px;
        }

        .jd-stats-section {
          background: #F9FAFB;
          padding: 60px 0;
        }
        .jd-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .jd-stat-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 28px 24px;
        }
        .jd-stat-card-num {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #1C5C38;
          margin-bottom: 8px;
        }
        .jd-stat-card-lbl {
          font-size: 0.85rem;
          color: #696969;
          font-weight: 500;
        }
        .jd-progress-wrap {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 28px 32px;
        }
        .jd-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          font-weight: 600;
        }
        .jd-progress-bar {
          height: 12px;
          background: #E5E7EB;
          border-radius: 9999px;
          overflow: hidden;
        }
        .jd-progress-fill {
          height: 100%;
          background: #1C5C38;
          border-radius: 9999px;
          transition: width 0.6s ease;
        }

        .jd-cta {
          background: #1C5C38;
          color: #fff;
          padding: 60px 0;
          text-align: center;
        }
        .jd-cta h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          margin-bottom: 24px;
        }

        .jd-loading {
          padding: calc(68px + 120px) 0 120px;
          text-align: center;
          color: #696969;
        }

        @media (max-width: 900px) {
          .jd-hero h1 { font-size: 36px; }
          .jd-tentang-grid { grid-template-columns: 1fr; gap: 40px; }
          .jd-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .jd-stats-grid { grid-template-columns: 1fr; }
          .jd-hero-stats { gap: 20px; }
        }
      `}</style>

      <div className="jd-page">
        {loading ? (
          <div className="jd-container jd-loading">Memuat data jurusan…</div>
        ) : jurusan ? (
          <>
            <section className="jd-hero">
              <div className="jd-container">
                <div className="jd-hero-inner">
                  <div className="jd-hero-content">
                    <div className="jd-hero-badge">{jurusan.kode}</div>
                    <h1>{jurusan.nama}</h1>
                    <p className="jd-hero-desc">
                      {jurusan.deskripsi ||
                        "Program kejuruan unggulan SMK Citra Negara untuk masa depan karier Anda."}
                    </p>
                    <div className="jd-hero-stats">
                      <div>
                        <div className="jd-hero-stat-val">{totalPendaftar}</div>
                        <div className="jd-hero-stat-lbl">Total Pendaftar</div>
                      </div>
                      <div>
                        <div className="jd-hero-stat-val">{diterima}</div>
                        <div className="jd-hero-stat-lbl">Diterima</div>
                      </div>
                      <div>
                        <div className="jd-hero-stat-val">{sisaKuota}</div>
                        <div className="jd-hero-stat-lbl">Kuota Tersisa</div>
                      </div>
                    </div>
                    <Link href="/register" className="jd-btn-white">
                      Daftar Sekarang →
                    </Link>
                  </div>
                  {({"DKV":"/jurusan/dkv.jpg","TKJ":"/jurusan/tkj.jpg","PPLG":"/jurusan/pplg.jpg","PH":"/jurusan/ph.jpg","MPLB":"/jurusan/mplb.jpg", "PM":"/jurusan/pm.jpg"} as Record<string,string>)[jurusan.kode] && (
                    <div className="jd-hero-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={({"DKV":"/jurusan/dkv.jpg","TKJ":"/jurusan/tkj.jpg","PPLG":"/jurusan/pplg.jpg","PH":"/jurusan/ph.jpg","MPLB":"/jurusan/mplb.jpg"} as Record<string,string>)[jurusan.kode]}
                        alt={`Siswa ${jurusan.kode} SMK Citra Negara`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="jd-tentang">
              <div className="jd-container">
                <div className="jd-tentang-grid">
                  <div>
                    <h2>Tentang Program</h2>
                    <p>{extra.tentang}</p>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      Keahlian yang Dipelajari
                    </h3>
                    <ul className="jd-keahlian-list">
                      {extra.keahlian.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="jd-info-card">
                    <div className="jd-info-row">
                      <div className="jd-info-label">Kuota / Tahun</div>
                      <div className="jd-info-value">{kuota} siswa</div>
                    </div>
                    <div className="jd-info-row">
                      <div className="jd-info-label">Durasi</div>
                      <div className="jd-info-value">3 tahun</div>
                    </div>
                    <div className="jd-info-row">
                      <div className="jd-info-label">Sertifikasi</div>
                      <div className="jd-info-value">{extra.sertifikasi}</div>
                    </div>
                    <div className="jd-info-row">
                      <div className="jd-info-label">Prospek Kerja</div>
                      <div className="jd-prospek-tags">
                        {extra.prospek.map((p) => (
                          <span className="jd-prospek-tag" key={p}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="jd-stats-section">
              <div className="jd-container">
                <div className="jd-stats-grid">
                  <div className="jd-stat-card">
                    <div className="jd-stat-card-num">{totalPendaftar}</div>
                    <div className="jd-stat-card-lbl">Total Pendaftar</div>
                  </div>
                  <div className="jd-stat-card">
                    <div className="jd-stat-card-num">{diterima}</div>
                    <div className="jd-stat-card-lbl">Diterima</div>
                  </div>
                  <div className="jd-stat-card">
                    <div className="jd-stat-card-num">{kuotaTerisiPct}%</div>
                    <div className="jd-stat-card-lbl">Kuota Terisi</div>
                  </div>
                  <div className="jd-stat-card">
                    <div className="jd-stat-card-num">{sisaKuota}</div>
                    <div className="jd-stat-card-lbl">Sisa Kuota</div>
                  </div>
                </div>
                <div className="jd-progress-wrap">
                  <div className="jd-progress-header">
                    <span>Pengisian Kuota</span>
                    <span>
                      {totalPendaftar} / {kuota} ({kuotaTerisiPct}%)
                    </span>
                  </div>
                  <div className="jd-progress-bar">
                    <div
                      className="jd-progress-fill"
                      style={{ width: `${kuotaTerisiPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="jd-cta">
              <div className="jd-container">
                <h2>Tertarik dengan jurusan ini?</h2>
                <Link href="/register" className="jd-btn-white">
                  Daftar Sekarang →
                </Link>
              </div>
            </section>
          </>
        ) : null}
      </div>

      <LandingFooter />
    </>
  );
}