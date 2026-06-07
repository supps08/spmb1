
"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

interface JurusanDetailData {
  total: number;
  diterima: number;
  ditolak: number;
  menunggu: number;
  avgNilai: number | null;
  trend7: TrendData[];
}

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function MiniBarChart({ data }: { data: TrendData[] }) {
  const maxVal = Math.max(...data.map((d) => d.jumlah), 1);
  const W = 200, H = 100, pad = 4, barW = Math.floor((W - pad * 2) / data.length) - 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = Math.max((d.jumlah / maxVal) * (H - 20), 2);
        const x = pad + i * ((W - pad * 2) / data.length) + 2;
        const y = H - 14 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill="#1C5C38" />
            <text x={x + barW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#6B7280">{d.hari}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MainBarChart({ data, maxVal }: { data: TrendData[]; maxVal: number }) {
  const W = 560, H = 220, padL = 36, padB = 28, padT = 10, padR = 12;
  const innerW = W - padL - padR;
  const innerH = H - padB - padT;
  const mx = Math.max(maxVal, 1);
  const barW = Math.floor(innerW / data.length) - 8;
  const ticks = [0, Math.round(mx / 2), mx];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
      {ticks.map((t) => {
        const y = padT + innerH - (t / mx) * innerH;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={10} fill="#6B7280">{t}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = Math.max((d.jumlah / mx) * innerH, 2);
        const x = padL + i * (innerW / data.length) + 4;
        const y = padT + innerH - barH;
        const isMax = d.jumlah === maxVal && maxVal > 0;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={isMax ? "#1C5C38" : "#D1FAE5"} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#6B7280">{d.hari}</text>
          </g>
        );
      })}
    </svg>
  );
}

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
  const [pengaturan, setPengaturan] = useState<Record<string, string>>({});
  const [expandedJurusan, setExpandedJurusan] = useState<string | null>(null);
  const [jurusanDetails, setJurusanDetails] = useState<
    Record<string, JurusanDetailData>
  >({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);


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

  const fetchJurusanDetail = useCallback(
    async (jurusanId: string) => {
      setLoadingDetailId(jurusanId);
      try {
        const { data: siswaList } = await supabase
          .from("siswa")
          .select("status, nilai_rata_rata, submitted_at")
          .eq("jurusan_id", jurusanId)
          .neq("status", "draft");

        const list = siswaList ?? [];
        const total = list.length;
        const diterima = list.filter((s) => s.status === "diterima").length;
        const ditolak = list.filter((s) => s.status === "ditolak").length;
        const menunggu = list.filter(
          (s) => s.status === "menunggu" || s.status === "submitted"
        ).length;

        const nilaiArr = list
          .map((s) => s.nilai_rata_rata)
          .filter((n): n is number => n != null && !Number.isNaN(Number(n)))
          .map(Number);
        const avgNilai =
          nilaiArr.length > 0
            ? nilaiArr.reduce((a, b) => a + b, 0) / nilaiArr.length
            : null;

        const trendMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          trendMap[d.toISOString().split("T")[0]] = 0;
        }
        list.forEach((s) => {
          if (!s.submitted_at) return;
          const key = s.submitted_at.split("T")[0];
          if (trendMap[key] !== undefined) trendMap[key]++;
        });
        const trend7: TrendData[] = Object.entries(trendMap).map(
          ([date, jumlah]) => ({
            hari: HARI[new Date(date).getDay()],
            jumlah,
          })
        );

        setJurusanDetails((prev) => ({
          ...prev,
          [jurusanId]: {
            total,
            diterima,
            ditolak,
            menunggu,
            avgNilai,
            trend7,
          },
        }));
      } finally {
        setLoadingDetailId(null);
      }
    },
    [supabase]
  );

  const toggleJurusanExpand = useCallback(
    (jurusanId: string) => {
      if (expandedJurusan === jurusanId) {
        setExpandedJurusan(null);
        return;
      }
      setExpandedJurusan(jurusanId);
      if (!jurusanDetails[jurusanId]) {
        fetchJurusanDetail(jurusanId);
      }
    },
    [expandedJurusan, jurusanDetails, fetchJurusanDetail]
  );


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

        .rekap-table tbody tr.rekap-row-jurusan:hover td {
          background: #F9FAFB;
        }

        .rekap-row-jurusan {
          cursor: pointer;
        }

        .rekap-chevron-cell {
          width: 40px;
          padding-left: 16px !important;
          padding-right: 8px !important;
        }

        .rekap-chevron {
          color: #9CA3AF;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .rekap-chevron.expanded {
          transform: rotate(90deg);
        }

        .expanded-detail-cell {
          padding: 0 !important;
          border-bottom: 1px solid #E5E7EB !important;
          vertical-align: top;
        }

        .expanded-detail-wrap {
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
          border-bottom: 1px solid #E5E7EB;
          padding: 20px 24px;
          animation: fadeUp 0.3s ease;
        }

        .expanded-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .mini-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mini-stat-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0C0C0C;
          line-height: 1.2;
        }

        .mini-stat-value.red {
          color: #DC2626;
        }

        .mini-stat-label {
          font-size: 11px;
          color: #6B7280;
          margin-top: 2px;
        }

        .progress-visual {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .progress-visual-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .progress-bar-lg-track {
          height: 12px;
          background: #E5E7EB;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-lg-fill {
          height: 100%;
          background: #1C5C38;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .progress-bar-lg-fill.light {
          background: #86EFAC;
        }

        .progress-visual-meta {
          font-size: 11px;
          color: #6B7280;
          margin-top: 4px;
        }

        .avg-nilai-block {
          padding-top: 4px;
        }

        .avg-nilai-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0C0C0C;
        }

        .mini-chart-title {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .mini-chart-wrap {
          height: 120px;
          width: 100%;
        }

        .detail-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .detail-skeleton-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }

        .skeleton-line.tall {
          height: 48px;
        }

        .skeleton-line.chart {
          height: 120px;
        }

        .expanded-empty {
          text-align: center;
          padding: 24px 0;
        }

        .expanded-empty p {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 12px;
        }

        .expanded-empty-link {
          font-size: 13px;
          font-weight: 600;
          color: #1C5C38;
          text-decoration: none;
        }

        .expanded-empty-link:hover {
          text-decoration: underline;
        }

        .detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .detail-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }

        .detail-action-btn.primary {
          background: #1C5C38;
          color: #fff;
          border: 1px solid #1C5C38;
        }

        .detail-action-btn.primary:hover:not(:disabled) {
          background: #2A7A4E;
        }

        .detail-action-btn.secondary {
          background: #fff;
          color: #374151;
          border: 1px solid #E5E7EB;
        }

        .detail-action-btn.secondary:hover:not(:disabled) {
          background: #F9FAFB;
        }

        .detail-action-btn.ghost {
          background: transparent;
          color: #6B7280;
          border: 1px solid transparent;
        }

        .detail-action-btn.ghost:hover {
          color: #374151;
          background: #fff;
          border-color: #E5E7EB;
        }

        .detail-action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .expanded-grid,
          .detail-skeleton-grid {
            grid-template-columns: 1fr;
          }
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
                    <th className="rekap-chevron-cell" aria-label="Expand" />
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
                        colSpan={6}
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
                    rekap.map((j) => {
                      const isExpanded = expandedJurusan === j.id;
                      const detail = jurusanDetails[j.id];
                      const isLoadingDetail =
                        isExpanded &&
                        loadingDetailId === j.id &&
                        !detail;
                      const kuotaPct =
                        j.kuota > 0
                          ? Math.min(Math.round((j.diterima / j.kuota) * 100), 100)
                          : 0;
                      const kelulusanPct =
                        detail && detail.total > 0
                          ? Math.round((detail.diterima / detail.total) * 100)
                          : j.total > 0
                            ? Math.round((j.diterima / j.total) * 100)
                            : 0;

                      return (
                        <Fragment key={j.id}>
                          <tr
                            className="rekap-row-jurusan"
                            onClick={() => toggleJurusanExpand(j.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleJurusanExpand(j.id);
                              }
                            }}
                            aria-expanded={isExpanded}
                          >
                            <td className="rekap-chevron-cell">
                              <ChevronRight
                                size={18}
                                className={`rekap-chevron${isExpanded ? " expanded" : ""}`}
                                aria-hidden
                              />
                            </td>
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
                          {isExpanded && (
                            <tr className="no-print">
                              <td colSpan={6} className="expanded-detail-cell">
                                <div className="expanded-detail-wrap">
                                  {isLoadingDetail ? (
                                    <div className="detail-skeleton-grid">
                                      <div className="detail-skeleton-col">
                                        <div className="skeleton-line" />
                                        <div className="skeleton-line" />
                                        <div className="skeleton-line" />
                                        <div className="skeleton-line" />
                                      </div>
                                      <div className="detail-skeleton-col">
                                        <div className="skeleton-line tall" />
                                        <div className="skeleton-line tall" />
                                        <div className="skeleton-line" />
                                      </div>
                                      <div className="detail-skeleton-col">
                                        <div className="skeleton-line chart" />
                                      </div>
                                    </div>
                                  ) : detail && detail.total === 0 ? (
                                    <div className="expanded-empty">
                                      <p>
                                        Belum ada pendaftar untuk jurusan ini.
                                      </p>
                                      <Link
                                        href="/dashboard/users"
                                        className="expanded-empty-link"
                                      >
                                        Lihat di Manajemen Pendaftar →
                                      </Link>
                                    </div>
                                  ) : detail ? (
                                    <>
                                      <div className="expanded-grid">
                                        <div className="mini-stats">
                                          <div>
                                            <div className="mini-stat-value">
                                              {detail.total.toLocaleString(
                                                "id-ID"
                                              )}
                                            </div>
                                            <div className="mini-stat-label">
                                              Total Pendaftar
                                            </div>
                                          </div>
                                          <div>
                                            <div className="mini-stat-value">
                                              {detail.diterima.toLocaleString(
                                                "id-ID"
                                              )}
                                            </div>
                                            <div className="mini-stat-label">
                                              Diterima
                                            </div>
                                          </div>
                                          <div>
                                            <div className="mini-stat-value red">
                                              {detail.ditolak.toLocaleString(
                                                "id-ID"
                                              )}
                                            </div>
                                            <div className="mini-stat-label">
                                              Ditolak
                                            </div>
                                          </div>
                                          <div>
                                            <div className="mini-stat-value">
                                              {detail.menunggu.toLocaleString(
                                                "id-ID"
                                              )}
                                            </div>
                                            <div className="mini-stat-label">
                                              Menunggu
                                            </div>
                                          </div>
                                        </div>

                                        <div className="progress-visual">
                                          <div>
                                            <div className="progress-visual-label">
                                              Kuota terisi
                                            </div>
                                            <div className="progress-bar-lg-track">
                                              <div
                                                className="progress-bar-lg-fill"
                                                style={{ width: `${kuotaPct}%` }}
                                              />
                                            </div>
                                            <div className="progress-visual-meta">
                                              {j.diterima} dari {j.kuota} kuota
                                              terisi
                                            </div>
                                          </div>
                                          <div>
                                            <div className="progress-visual-label">
                                              Persentase kelulusan
                                            </div>
                                            <div className="progress-bar-lg-track">
                                              <div
                                                className="progress-bar-lg-fill light"
                                                style={{
                                                  width: `${kelulusanPct}%`,
                                                }}
                                              />
                                            </div>
                                            <div className="progress-visual-meta">
                                              {kelulusanPct}% diterima dari
                                              total pendaftar
                                            </div>
                                          </div>
                                          <div className="avg-nilai-block">
                                            <div className="avg-nilai-value">
                                              {detail.avgNilai != null
                                                ? detail.avgNilai.toFixed(2)
                                                : "—"}
                                            </div>
                                            <div className="mini-stat-label">
                                              rata-rata nilai
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <div className="mini-chart-title">
                                            Tren 7 Hari Terakhir
                                          </div>
                                          <div className="mini-chart-wrap">
                                            <MiniBarChart data={detail.trend7} />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="detail-actions">
                                        <Link
                                          href={`/dashboard/users?jurusan=${encodeURIComponent(j.kode)}`}
                                          className="detail-action-btn primary"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Lihat Semua Pendaftar
                                        </Link>
                                        <button
                                          type="button"
                                          className="detail-action-btn ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedJurusan(null);
                                          }}
                                        >
                                          Tutup
                                        </button>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
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
                  <MainBarChart data={trend} maxVal={maxTrend} />
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

    </>
  );
}
