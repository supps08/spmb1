// ============================================================
// PATH   : app/dashboard/laporan/page.tsx
// ISI    : Halaman Laporan Penerimaan
//          - 4 stat cards (total, diterima, ditolak, menunggu)
//          - Tabel rekap per jurusan + progress bar
//          - Bar chart tren harian 7 hari (Recharts)
//          - Info card penutupan pendaftaran
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

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
  const supabase = createClient();

  const [stats, setStats] = useState<StatsSiswa>({ total: 0, diterima: 0, ditolak: 0, menunggu: 0, submitted: 0 });
  const [rekap, setRekap] = useState<RekapJurusan[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pengaturan, setPengaturan] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchAll() {
      // Ambil pengaturan sistem
      const { data: peng } = await supabase
        .from("pengaturan_sistem")
        .select("key, value");
      if (peng) {
        const map: Record<string, string> = {};
        peng.forEach(p => { map[p.key] = p.value ?? ""; });
        setPengaturan(map);
      }

      // Ambil semua siswa yang sudah submit
      const { data: siswaData } = await supabase
        .from("siswa")
        .select("status, jurusan_id, created_at")
        .neq("status", "draft");

      if (siswaData) {
        const total = siswaData.length;
        const diterima = siswaData.filter(s => s.status === "diterima").length;
        const ditolak = siswaData.filter(s => s.status === "ditolak").length;
        const menunggu = siswaData.filter(s => s.status === "menunggu").length;
        const submitted = siswaData.filter(s => s.status === "submitted").length;
        setStats({ total, diterima, ditolak, menunggu, submitted });

        // Tren 7 hari terakhir
        const trendMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          trendMap[key] = 0;
        }
        siswaData.forEach(s => {
          const key = s.created_at?.split("T")[0];
          if (key && trendMap[key] !== undefined) {
            trendMap[key]++;
          }
        });
        const trendArr: TrendData[] = Object.entries(trendMap).map(([date, jumlah]) => ({
          hari: HARI[new Date(date).getDay()],
          jumlah,
        }));
        setTrend(trendArr);
      }

      // Rekap per jurusan
      const { data: jurusanData } = await supabase
        .from("jurusan")
        .select("id, kode, nama, kuota")
        .eq("is_active", true);

      if (jurusanData && siswaData) {
        const rekapArr: RekapJurusan[] = jurusanData.map(j => {
          const siswaJurusan = siswaData.filter(s => s.jurusan_id === j.id);
          const total = siswaJurusan.length;
          const diterima = siswaJurusan.filter(s => s.status === "diterima").length;
          const persen = j.kuota > 0 ? Math.round((diterima / j.kuota) * 100) : 0;
          return { id: j.id, kode: j.kode, nama: j.nama, kuota: j.kuota, total, diterima, persen };
        });
        setRekap(rekapArr);
      }

      setLoading(false);
    }

    fetchAll();
  }, [supabase]);

  // Hitung sisa hari tutup pendaftaran
  function sisaHari() {
    const tutup = pengaturan["tanggal_tutup"];
    if (!tutup) return null;
    const diff = new Date(tutup).getTime() - Date.now();
    const hari = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return hari > 0 ? hari : 0;
  }

  const maxTrend = Math.max(...trend.map(t => t.jumlah), 1);

  return (
    <>
      <style>{`
        .laporan-page { display: flex; flex-direction: column; gap: 20px; }

        /* Stats */
        .stats-wrapper {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          overflow: hidden;
        }
        .stat-card-l {
          padding: 20px 24px;
          border-right: 1px solid #E5E7EB;
          position: relative;
        }
        .stat-card-l:last-child { border-right: none; }
        .stat-card-l::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
        }
        .stat-card-l.green::after { background: #1C5C38; }
        .stat-card-l.red::after { background: #DC2626; }
        .stat-card-l.gray::after { background: #6B7280; }

        .stat-label-l {
          font-size: 0.68rem; font-weight: 600; color: #6B7280;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .stat-value-l {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2rem; font-weight: 800; color: #0C0C0C; line-height: 1;
        }
        .stat-value-l.red { color: #DC2626; }
        .stat-icon-l {
          position: absolute; top: 16px; right: 16px;
          font-size: 2.5rem; opacity: 0.05;
        }

        /* Tabel rekap */
        .panel {
          background: white; border: 1px solid #E5E7EB;
          border-radius: 12px; overflow: hidden;
        }
        .panel-header {
          padding: 16px 20px; border-bottom: 1px solid #E5E7EB;
        }
        .panel-title { font-size: 0.92rem; font-weight: 600; color: #0C0C0C; }
        .panel-subtitle { font-size: 0.78rem; color: #6B7280; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: left; padding: 10px 20px;
          font-size: 0.7rem; font-weight: 600; color: #6B7280;
          text-transform: uppercase; letter-spacing: 0.05em;
          background: #F9FAFB; border-bottom: 1px solid #E5E7EB;
        }
        td {
          padding: 16px 20px; border-bottom: 1px solid #F3F4F6;
          font-size: 0.87rem; color: #374151; vertical-align: middle;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #F9FAFB; }

        .jurusan-kode {
          display: inline-block; padding: 3px 8px;
          background: #EBF4EE; color: #1C5C38;
          border-radius: 6px; font-size: 0.72rem; font-weight: 700;
          margin-right: 8px; letter-spacing: 0.04em;
        }
        .progress-wrap { display: flex; align-items: center; gap: 10px; }
        .progress-track {
          flex: 1; height: 6px; background: #E5E7EB;
          border-radius: 9999px; overflow: hidden;
        }
        .progress-fill { height: 100%; background: #1C5C38; border-radius: 9999px; }
        .progress-pct { font-size: 0.78rem; color: #6B7280; font-weight: 500; min-width: 36px; }
        .status-aktif {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.75rem; font-weight: 600; color: #065F46;
        }
        .dot-aktif { width: 6px; height: 6px; background: #10B981; border-radius: 50%; }

        /* Bottom row */
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 20px;
        }

        /* Chart */
        .chart-header {
          display: flex; align-items: center;
          justify-content: space-between; padding: 16px 20px;
          border-bottom: 1px solid #E5E7EB;
        }
        .chart-badge {
          background: #F3F4F6; color: #374151;
          border-radius: 9999px; padding: 4px 12px;
          font-size: 0.75rem; font-weight: 500;
        }
        .chart-wrap { padding: 20px; height: 240px; }

        /* Info card */
        .info-card {
          background: #1C5C38; border-radius: 12px;
          padding: 28px; color: white; position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .info-card::before {
          content: '📅';
          position: absolute; bottom: 16px; right: 20px;
          font-size: 5rem; opacity: 0.08;
        }
        .info-card-title { font-size: 0.85rem; font-weight: 700; color: white; margin-bottom: 12px; }
        .info-card-body { font-size: 0.85rem; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 20px; flex: 1; }
        .info-card-days {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2.5rem; font-weight: 800; color: white; line-height: 1;
          margin-bottom: 4px;
        }
        .info-card-days-label { font-size: 0.78rem; color: rgba(255,255,255,0.6); margin-bottom: 20px; }
        .btn-jadwal {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: white; border-radius: 8px;
          padding: 10px 18px; font-size: 0.83rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: background .2s; width: fit-content;
        }
        .btn-jadwal:hover { background: rgba(255,255,255,0.25); }

        /* Export btn */
        .export-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #1C5C38; color: white; border: none;
          border-radius: 8px; padding: 8px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.83rem; font-weight: 600; cursor: pointer;
          transition: background .2s;
        }
        .export-btn:hover { background: #2A7A4E; }

        .loading-state { text-align: center; padding: 60px; color: #6B7280; font-size: 0.85rem; }

        @media (max-width: 900px) {
          .stats-wrapper { grid-template-columns: repeat(2, 1fr); }
          .stat-card-l { border-bottom: 1px solid #E5E7EB; }
          .bottom-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-wrapper { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="laporan-page">
        {/* Header + export */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "#0C0C0C" }}>
              Laporan Penerimaan
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "2px" }}>
              Tahun Ajaran {pengaturan["tahun_ajaran"] || "2025/2026"}
            </p>
          </div>
          <button className="export-btn" onClick={() => window.print()}>
            ⬇ Export PDF
          </button>
        </div>

        {loading ? (
          <div className="loading-state">⏳ Memuat data laporan...</div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="stats-wrapper">
              <div className="stat-card-l green">
                <div className="stat-label-l">Total Pendaftar</div>
                <div className="stat-value-l">{stats.total.toLocaleString("id-ID")}</div>
                <div className="stat-icon-l">📋</div>
              </div>
              <div className="stat-card-l green">
                <div className="stat-label-l">Diterima</div>
                <div className="stat-value-l">{stats.diterima.toLocaleString("id-ID")}</div>
                <div className="stat-icon-l">✅</div>
              </div>
              <div className="stat-card-l red">
                <div className="stat-label-l">Ditolak</div>
                <div className="stat-value-l red">{stats.ditolak.toLocaleString("id-ID")}</div>
                <div className="stat-icon-l">❌</div>
              </div>
              <div className="stat-card-l gray">
                <div className="stat-label-l">Menunggu Verifikasi</div>
                <div className="stat-value-l">{(stats.menunggu + stats.submitted).toLocaleString("id-ID")}</div>
                <div className="stat-icon-l">⏳</div>
              </div>
            </div>

            {/* Tabel rekap jurusan */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Rekap per Jurusan</div>
                <div className="panel-subtitle">
                  Data statistik pendaftaran tahun ajaran {pengaturan["tahun_ajaran"] || "2025/2026"}
                </div>
              </div>
              <table>
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
                      <td colSpan={5} style={{ textAlign: "center", color: "#9CA3AF", padding: "32px" }}>
                        Belum ada data pendaftar.
                      </td>
                    </tr>
                  ) : (
                    rekap.map(j => (
                      <tr key={j.id}>
                        <td>
                          <span className="jurusan-kode">{j.kode}</span>
                          {j.nama}
                        </td>
                        <td style={{ fontWeight: 600 }}>{j.total}</td>
                        <td style={{ color: "#1C5C38", fontWeight: 600 }}>{j.diterima}</td>
                        <td>
                          <div className="progress-wrap">
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{ width: `${Math.min(j.persen, 100)}%` }}
                              />
                            </div>
                            <span className="progress-pct">{j.persen}%</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#9CA3AF", marginTop: "3px" }}>
                            {j.diterima} / {j.kuota} kuota
                          </div>
                        </td>
                        <td>
                          <span className="status-aktif">
                            <span className="dot-aktif" />
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom: Chart + Info */}
            <div className="bottom-row">
              {/* Bar chart */}
              <div className="panel">
                <div className="chart-header">
                  <div className="panel-title">Tren Pendaftaran Harian</div>
                  <span className="chart-badge">7 Hari Terakhir</span>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} barSize={28}>
                      <CartesianGrid vertical={false} stroke="#F3F4F6" />
                      <XAxis
                        dataKey="hari"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "#F2F8F4" }}
                        contentStyle={{
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v: unknown) => [`${v} pendaftar`, ""]}
                      />
                      <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                        {trend.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.jumlah === maxTrend ? "#1C5C38" : "#D1FAE5"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Info card */}
              <div className="info-card">
                <div>
                  <div className="info-card-title">Informasi Penting</div>
                  {sisaHari() !== null && (
                    <>
                      <div className="info-card-days">{sisaHari()}</div>
                      <div className="info-card-days-label">hari lagi tutup pendaftaran</div>
                    </>
                  )}
                  <div className="info-card-body">
                    {sisaHari() === 0
                      ? "Pendaftaran sudah ditutup. Lanjutkan proses verifikasi berkas."
                      : `Penutupan pendaftaran tersisa ${sisaHari()} hari lagi. Pastikan semua verifikasi data selesai sebelum tanggal penutupan.`}
                  </div>
                </div>
                <a href="#" className="btn-jadwal">Lihat Jadwal →</a>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}