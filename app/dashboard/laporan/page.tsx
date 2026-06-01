// ============================================================
// PATH   : app/dashboard/laporan/page.tsx
// ISI    : Halaman Laporan Penerimaan
//          - 4 stat cards (total, diterima, ditolak, menunggu)
//          - Tabel rekap per jurusan + progress bar
//          - Bar chart tren harian 7 hari (Recharts)
//          - Info card penutupan pendaftaran
// ============================================================

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

interface StatsSiswa {
  total: number;
  diterima: number;
  ditolak: number;
  menunggu: number;
  submitted: number;
}

interface RekapJurusan {
  id: string;
  kode: string;
  nama: string;
  kuota: number;
  total: number;
  diterima: number;
  persen: number;
}

interface TrendData {
  hari: string;
  jumlah: number;
}

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function LaporanPage() {
  useScrollAnimation();

  const supabase = createClient();

  const [stats, setStats] = useState<StatsSiswa>({
    total: 0,
    diterima: 0,
    ditolak: 0,
    menunggu: 0,
    submitted: 0,
  });
  const [rekap, setRekap] = useState<RekapJurusan[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [pengaturan, setPengaturan] = useState<Record<string, string>>({});

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      const { data: peng } = await supabase
        .from("pengaturan_sistem")
        .select("key, value");
      if (peng) {
        const map: Record<string, string> = {};
        peng.forEach((p) => {
          map[p.key] = p.value ?? "";
        });
        setPengaturan(map);
      }

      const { data: siswaData } = await supabase
        .from("siswa")
        .select("status, jurusan_id, created_at")
        .neq("status", "draft");

      if (siswaData) {
        const total = siswaData.length;
        const diterima = siswaData.filter((s) => s.status === "diterima").length;
        const ditolak = siswaData.filter((s) => s.status === "ditolak").length;
        const menunggu = siswaData.filter((s) => s.status === "menunggu").length;
        const submitted = siswaData.filter((s) => s.status === "submitted").length;
        setStats({ total, diterima, ditolak, menunggu, submitted });

        const trendMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          trendMap[key] = 0;
        }
        siswaData.forEach((s) => {
          const key = s.created_at?.split("T")[0];
          if (key && trendMap[key] !== undefined) {
            trendMap[key]++;
          }
        });
        const trendArr: TrendData[] = Object.entries(trendMap).map(
          ([date, jumlah]) => ({
            hari: HARI[new Date(date).getDay()],
            jumlah,
          })
        );
        setTrend(trendArr);
      }

      const { data: jurusanData } = await supabase
        .from("jurusan")
        .select("id, kode, nama, kuota")
        .eq("is_active", true);

      if (jurusanData && siswaData) {
        const rekapArr: RekapJurusan[] = jurusanData.map((j) => {
          const siswaJurusan = siswaData.filter((s) => s.jurusan_id === j.id);
          const totalJ = siswaJurusan.length;
          const diterimaJ = siswaJurusan.filter(
            (s) => s.status === "diterima"
          ).length;
          const persen =
            j.kuota > 0 ? Math.round((diterimaJ / j.kuota) * 100) : 0;
          return {
            id: j.id,
            kode: j.kode,
            nama: j.nama,
            kuota: j.kuota,
            total: totalJ,
            diterima: diterimaJ,
            persen,
          };
        });
        setRekap(rekapArr);
      }

      setLoading(false);
    }

    fetchAll();
  }, [supabase]);

  function sisaHari() {
    const tutup = pengaturan["tanggal_tutup"];
    if (!tutup) return null;
    const diff = new Date(tutup).getTime() - Date.now();
    const hari = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return hari > 0 ? hari : 0;
  }

  async function exportExcel() {
    setExporting(true);
    try {
      const { data: siswaList } = await supabase
        .from("siswa")
        .select(`
          nama_lengkap, nisn, nik, asal_sekolah,
          nilai_rata_rata, status, submitted_at, verified_at,
          catatan_verifikasi,
          jurusan (kode, nama),
          ortu (nama_ayah, nama_ibu, no_ortu)
        `)
        .neq("status", "draft")
        .order("submitted_at", { ascending: false });

      if (!siswaList || siswaList.length === 0) {
        showToast("Tidak ada data untuk diekspor", "error");
        return;
      }

      const rows = siswaList.map((s, i) => {
        const jurusan = Array.isArray(s.jurusan) ? s.jurusan[0] : s.jurusan;
        const ortu = Array.isArray(s.ortu) ? s.ortu[0] : s.ortu;

        return {
          No: i + 1,
          "Nama Lengkap": s.nama_lengkap,
          NISN: s.nisn,
          NIK: s.nik,
          "Asal Sekolah": s.asal_sekolah,
          Jurusan: jurusan?.nama,
          "Kode Jurusan": jurusan?.kode,
          "Nilai Rata-rata": s.nilai_rata_rata,
          Status: s.status,
          "Tanggal Daftar": s.submitted_at
            ? new Date(s.submitted_at).toLocaleDateString("id-ID")
            : "-",
          "Tanggal Verifikasi": s.verified_at
            ? new Date(s.verified_at).toLocaleDateString("id-ID")
            : "-",
          "Nama Ayah": ortu?.nama_ayah,
          "Nama Ibu": ortu?.nama_ibu,
          "No WA Ortu": ortu?.no_ortu,
          Catatan: s.catatan_verifikasi ?? "-",
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);

      const colWidths = Object.keys(rows[0]).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Pendaftar");

      const tanggal = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");
      XLSX.writeFile(wb, `SPMB-SMK-Citra-Negara-${tanggal}.xlsx`);
    } catch {
      showToast("Gagal mengekspor data.", "error");
    } finally {
      setExporting(false);
    }
  }

  const maxTrend = useMemo(
    () => Math.max(...trend.map((t) => t.jumlah), 0),
    [trend]
  );

  const sisa = sisaHari();
  const tahunAjaran = pengaturan["tahun_ajaran"] || "2025/2026";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .laporan-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .laporan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .laporan-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .laporan-subtitle {
          font-size: 13px;
          color: #6B7280;
          margin-top: 2px;
        }

        .print-only-title {
          display: none;
        }

        .export-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1C5C38;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }

        .export-btn:hover:not(:disabled) {
          background: #2A7A4E;
          transform: translateY(-1px);
        }

        .export-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 200;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .toast.success {
          background: #D1FAE5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }

        .toast.error {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }

        .stats-wrapper {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          overflow: hidden;
        }

        .stat-card-l {
          padding: 20px 24px;
          border-right: 1px solid #E5E7EB;
        }

        .stat-card-l:last-child {
          border-right: none;
        }

        .stat-label-l {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }

        .stat-value-l {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #0C0C0C;
          line-height: 1;
        }

        .stat-value-l.red {
          color: #DC2626;
        }

        .panel {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
        }

        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid #E5E7EB;
        }

        .panel-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .panel-subtitle {
          font-size: 13px;
          color: #6B7280;
          margin-top: 2px;
        }

        .rekap-table {
          width: 100%;
          border-collapse: collapse;
        }

        .rekap-table th {
          text-align: left;
          padding: 12px 20px;
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
        }

        .rekap-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
          color: #374151;
          vertical-align: middle;
        }

        .rekap-table tr:last-child td {
          border-bottom: none;
        }

        .rekap-table tbody tr:hover td {
          background: #F9FAFB;
        }

        .jurusan-kode {
          display: inline-block;
          padding: 3px 8px;
          background: #EBF4EE;
          color: #1C5C38;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          margin-right: 8px;
          letter-spacing: 0.04em;
        }

        .progress-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-track {
          flex: 1;
          height: 6px;
          background: #E5E7EB;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #1C5C38;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .progress-pct {
          font-size: 12px;
          color: #6B7280;
          font-weight: 600;
          min-width: 36px;
        }

        .progress-meta {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 4px;
        }

        .status-aktif {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #065F46;
        }

        .dot-aktif {
          width: 6px;
          height: 6px;
          background: #10B981;
          border-radius: 50%;
        }

        .bottom-row {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #E5E7EB;
        }

        .chart-badge {
          background: #F3F4F6;
          color: #374151;
          border-radius: 9999px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .chart-wrap {
          padding: 20px;
          height: 260px;
        }

        .info-card {
          background: #1C5C38;
          border-radius: 12px;
          padding: 28px;
          color: #fff;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 100%;
        }

        .info-card-deco {
          position: absolute;
          bottom: -20px;
          right: -10px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          pointer-events: none;
        }

        .info-card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .info-card-days {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 40px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
        }

        .info-card-days-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
        }

        .info-card-body {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin-bottom: 20px;
          flex: 1;
        }

        .btn-jadwal {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
          width: fit-content;
        }

        .btn-jadwal:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .loading-state {
          text-align: center;
          padding: 60px;
          color: #6B7280;
          font-size: 14px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
        }

        .loading-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #E5E7EB;
          border-top-color: #1C5C38;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .stats-wrapper {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-card-l:nth-child(2) {
            border-right: none;
          }
          .stat-card-l:nth-child(1),
          .stat-card-l:nth-child(2) {
            border-bottom: 1px solid #E5E7EB;
          }
          .bottom-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .stats-wrapper {
            grid-template-columns: 1fr;
          }
          .stat-card-l {
            border-right: none;
            border-bottom: 1px solid #E5E7EB;
          }
          .stat-card-l:last-child {
            border-bottom: none;
          }
        }
      `}</style>

      <div className="laporan-page" id="laporan-print-root">
        <div className="print-only-title">
          <h1>Laporan Penerimaan SPMB — {tahunAjaran}</h1>
          <p>
            Dicetak:{" "}
            {new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="laporan-header" data-animate data-delay="0">
          <div>
            <h1 className="laporan-title">Laporan</h1>
            <p className="laporan-subtitle">Tahun Ajaran {tahunAjaran}</p>
          </div>
          <button
            type="button"
            className="export-btn no-print"
            onClick={exportExcel}
            disabled={exporting}
          >
            <FileSpreadsheet size={18} />
            {exporting ? "Mengekspor..." : "Export Excel"}
          </button>
        </div>

        {loading ? (
          <div className="loading-state" data-animate data-delay="50">
            <div className="loading-spinner" />
            Memuat data laporan...
          </div>
        ) : (
          <>
            <div className="stats-wrapper" data-animate data-delay="100">
              <div className="stat-card-l">
                <div className="stat-label-l">Total Pendaftar</div>
                <div className="stat-value-l">
                  {stats.total.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="stat-card-l">
                <div className="stat-label-l">Diterima</div>
                <div className="stat-value-l">
                  {stats.diterima.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="stat-card-l">
                <div className="stat-label-l">Ditolak</div>
                <div className="stat-value-l red">
                  {stats.ditolak.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="stat-card-l">
                <div className="stat-label-l">Menunggu Verifikasi</div>
                <div className="stat-value-l">
                  {(stats.menunggu + stats.submitted).toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="panel" data-animate data-delay="150">
              <div className="panel-header">
                <div className="panel-title">Rekap per Jurusan</div>
                <div className="panel-subtitle">
                  Data statistik pendaftaran tahun ajaran {tahunAjaran}
                </div>
              </div>
              <table className="rekap-table">
                <thead>
                  <tr>
                    <th>Jurusan</th>
                    <th>Total Pendaftar</th>
                    <th>Diterima</th>
                    <th>Kuota Terisi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rekap.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          color: "#9CA3AF",
                          padding: "32px",
                        }}
                      >
                        Belum ada data pendaftar.
                      </td>
                    </tr>
                  ) : (
                    rekap.map((j) => (
                      <tr key={j.id}>
                        <td>
                          <span className="jurusan-kode">{j.kode}</span>
                          {j.nama}
                        </td>
                        <td style={{ fontWeight: 600 }}>{j.total}</td>
                        <td style={{ color: "#1C5C38", fontWeight: 600 }}>
                          {j.diterima}
                        </td>
                        <td>
                          <div className="progress-wrap">
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(j.persen, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="progress-pct">{j.persen}%</span>
                          </div>
                          <div className="progress-meta">
                            {j.diterima} / {j.kuota} kuota
                          </div>
                        </td>
                        <td>
                          <span className="status-aktif">
                            <span className="dot-aktif" aria-hidden="true" />
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bottom-row">
              <div className="panel" data-animate data-delay="200">
                <div className="chart-header">
                  <div className="panel-title">Tren Pendaftaran Harian</div>
                  <span className="chart-badge">7 Hari Terakhir</span>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} barSize={32}>
                      <CartesianGrid
                        vertical={false}
                        stroke="#E5E7EB"
                        strokeDasharray="0"
                      />
                      <XAxis
                        dataKey="hari"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        width={32}
                      />
                      <Tooltip
                        cursor={{ fill: "#F2F8F4" }}
                        contentStyle={{
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v: unknown) => [`${v} pendaftar`, ""]}
                      />
                      <Bar
                        dataKey="jumlah"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {trend.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              entry.jumlah === maxTrend && maxTrend > 0
                                ? "#1C5C38"
                                : "#D1FAE5"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="info-card" data-animate data-delay="250">
                <div className="info-card-deco" aria-hidden="true" />
                <div>
                  <div className="info-card-title">Informasi Penting</div>
                  {sisa !== null && (
                    <>
                      <div className="info-card-days">{sisa}</div>
                      <div className="info-card-days-label">
                        hari lagi tutup pendaftaran
                      </div>
                    </>
                  )}
                  <div className="info-card-body">
                    {sisa === 0
                      ? "Pendaftaran sudah ditutup. Lanjutkan proses verifikasi berkas."
                      : `Penutupan pendaftaran tersisa ${sisa ?? "—"} hari lagi. Pastikan semua verifikasi data selesai sebelum tanggal penutupan.`}
                  </div>
                </div>
                <a href="#" className="btn-jadwal no-print">
                  Lihat Jadwal →
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
