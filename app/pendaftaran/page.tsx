// ============================================================
// PATH   : app/pendaftaran/page.tsx
// ISI    : Formulir pendaftaran 5 tahap (calon siswa)
//          - Data diri, akademik, orang tua, upload berkas, review
//          - Simpan draft ke Supabase per tahap
// ============================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  X,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { useCountdown } from "@/lib/useCountdown";

const STEPS = [
  "Data Diri",
  "Data Akademik",
  "Orang Tua",
  "Upload Berkas",
  "Review",
] as const;

const ESTIMASI: Record<number, string> = {
  1: "~5 menit",
  2: "~2 menit",
  3: "~3 menit",
  4: "~5 menit",
  5: "~1 menit",
};

function formatLastSaved(date: Date | null): string {
  if (!date) return "Belum tersimpan";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Tersimpan barusan";
  const diffMin = Math.floor(diffSec / 60);
  return `Tersimpan ${diffMin} menit lalu`;
}

const AGAMA_OPTIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];

interface Jurusan {
  id: string;
  kode: string;
  nama: string;
}

interface FormData {
  nama_lengkap: string;
  nama_panggilan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "" | "L" | "P";
  agama: string;
  alamat_lengkap: string;
  no_pribadi: string;
  nisn: string;
  nik: string;
  asal_sekolah: string;
  jurusan_id: string;
  nilai_rata_rata: string;
  prestasi: string;
  nama_ayah: string;
  nama_ibu: string;
  no_ortu: string;
  pekerjaan_ayah: string;
  pekerjaan_ibu: string;
}

const EMPTY_FORM: FormData = {
  nama_lengkap: "",
  nama_panggilan: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  agama: "",
  alamat_lengkap: "",
  no_pribadi: "",
  nisn: "",
  nik: "",
  asal_sekolah: "",
  jurusan_id: "",
  nilai_rata_rata: "",
  prestasi: "",
  nama_ayah: "",
  nama_ibu: "",
  no_ortu: "",
  pekerjaan_ayah: "",
  pekerjaan_ibu: "",
};

type BerkasKey = "foto" | "ijazah" | "rapor" | "kk";

const BERKAS_LABELS: Record<BerkasKey, string> = {
  foto: "Foto Formal 3x4",
  ijazah: "Ijazah / SKL",
  rapor: "Rapor Semester Terakhir",
  kk: "Kartu Keluarga",
};

const BERKAS_ACCEPT: Record<BerkasKey, string> = {
  foto: ".jpg,.jpeg,.png,image/jpeg,image/png",
  ijazah: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
  rapor: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
  kk: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
};

const MAX_BERKAS_BYTES = 2 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isAllowedBerkasType(key: BerkasKey, file: File) {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (key === "foto") {
    return mime === "image/jpeg" || mime === "image/png" || ext === "jpg" || ext === "jpeg" || ext === "png";
  }
  return (
    mime === "application/pdf" ||
    mime === "image/jpeg" ||
    mime === "image/png" ||
    ext === "pdf" ||
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "png"
  );
}

export default function PendaftaranPage() {
  useScrollAnimation();

  const router = useRouter();
  const supabase = createClient();
  const fileInputRefs = useRef<Partial<Record<BerkasKey, HTMLInputElement | null>>>({});

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [kuotaData, setKuotaData] = useState<
    Record<string, { sisa: number; persenTerisi: number; kuota: number }>
  >({});
  const [siswaId, setSiswaId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [berkasUrls, setBerkasUrls] = useState<Record<BerkasKey, string>>({
    foto: "",
    ijazah: "",
    rapor: "",
    kk: "",
  });
  const [berkasFiles, setBerkasFiles] = useState<Partial<Record<BerkasKey, File>>>({});
  const [berkasPreviews, setBerkasPreviews] = useState<Partial<Record<BerkasKey, string>>>({});
  const [berkasMeta, setBerkasMeta] = useState<
    Partial<Record<BerkasKey, { name: string; size: number }>>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [dragBerkas, setDragBerkas] = useState<BerkasKey | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [tanggalTutup, setTanggalTutup] = useState<string | null>(null);
  const countdown = useCountdown(tanggalTutup);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastSavedRef = useRef<Date | null>(null);
  const [lastSavedText, setLastSavedText] = useState("");

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((p) => ({ ...p, [key]: value }));
    },
    []
  );

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data: jurusanData } = await supabase
        .from("jurusan")
        .select("id, kode, nama")
        .eq("is_active", true)
        .order("kode");
      if (jurusanData) setJurusanList(jurusanData);

      let { data: siswa } = await supabase
        .from("siswa")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!siswa) {
        const { data: created, error: createErr } = await supabase
          .from("siswa")
          .insert({ user_id: user.id, status: "draft", tahap_terakhir: 1 })
          .select()
          .single();
        if (createErr) {
          showToast("Gagal memuat data pendaftaran.", "error");
          setLoading(false);
          return;
        }
        siswa = created;
      }

      setSiswaId(siswa.id);
      if (siswa.status !== "draft") {
        setAlreadySubmitted(true);
      }

      setForm({
        nama_lengkap: siswa.nama_lengkap ?? "",
        nama_panggilan: siswa.nama_panggilan ?? "",
        tempat_lahir: siswa.tempat_lahir ?? "",
        tanggal_lahir: siswa.tanggal_lahir ?? "",
        jenis_kelamin: (siswa.jenis_kelamin as "" | "L" | "P") ?? "",
        agama: siswa.agama ?? "",
        alamat_lengkap: siswa.alamat_lengkap ?? "",
        no_pribadi: siswa.no_pribadi ?? "",
        nisn: siswa.nisn ?? "",
        nik: siswa.nik ?? "",
        asal_sekolah: siswa.asal_sekolah ?? "",
        jurusan_id: siswa.jurusan_id ?? "",
        nilai_rata_rata:
          siswa.nilai_rata_rata != null ? String(siswa.nilai_rata_rata) : "",
        prestasi: siswa.prestasi ?? "",
        nama_ayah: "",
        nama_ibu: "",
        no_ortu: "",
        pekerjaan_ayah: "",
        pekerjaan_ibu: "",
      });

      if (siswa.tahap_terakhir && siswa.tahap_terakhir >= 1 && siswa.tahap_terakhir <= 5) {
        setStep(siswa.status === "draft" ? siswa.tahap_terakhir : 5);
      }

      const { data: ortu } = await supabase
        .from("ortu")
        .select("*")
        .eq("siswa_id", siswa.id)
        .maybeSingle();

      if (ortu) {
        setForm((p) => ({
          ...p,
          nama_ayah: ortu.nama_ayah ?? "",
          nama_ibu: ortu.nama_ibu ?? "",
          no_ortu: ortu.no_ortu ?? "",
          pekerjaan_ayah: ortu.pekerjaan_ayah ?? "",
          pekerjaan_ibu: ortu.pekerjaan_ibu ?? "",
        }));
      }

      const { data: berkas } = await supabase
        .from("berkas")
        .select("foto_url, ijazah_url, rapor_url, kk_url")
        .eq("siswa_id", siswa.id)
        .maybeSingle();

      if (berkas) {
        setBerkasUrls({
          foto: berkas.foto_url ?? "",
          ijazah: berkas.ijazah_url ?? "",
          rapor: berkas.rapor_url ?? "",
          kk: berkas.kk_url ?? "",
        });
      }

      const { data: setting } = await supabase
        .from("pengaturan_sistem")
        .select("value")
        .eq("key", "tanggal_tutup")
        .single();
      if (setting) setTanggalTutup(setting.value);

      try {
        const res = await fetch("/api/jurusan/kuota");
        if (res.ok) {
          const kuota: Array<{
            id: string;
            sisa: number;
            persenTerisi: number;
            kuota: number;
          }> = await res.json();
          setKuotaData(Object.fromEntries(kuota.map((k) => [k.id, k])));
        }
      } catch {
        // kuota opsional — card tetap tampil tanpa progress bar
      }

      setLoading(false);
    }

    load();
  }, [supabase, router, showToast]);

  useEffect(() => {
    // Aktifkan warning saat form sudah mulai diisi tapi belum submit
    const isDirty = step > 1 || Object.values(form).some(v =>
      typeof v === 'string' ? v.trim() !== '' : Boolean(v)
    );

    if (!isDirty || alreadySubmitted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, form, alreadySubmitted]);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timer = setTimeout(() => setSaveStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  useEffect(() => {
    const tick = () => {
      if (lastSavedRef.current) {
        setLastSavedText(formatLastSaved(lastSavedRef.current));
      }
    };
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, []);

  function validateStep(current: number): string[] {
    const errs: string[] = [];
    if (current === 1) {
      if (!form.nama_lengkap.trim()) errs.push("Nama lengkap wajib diisi.");
      if (!form.nama_panggilan.trim()) errs.push("Nama panggilan wajib diisi.");
      if (!form.tempat_lahir.trim()) errs.push("Tempat lahir wajib diisi.");
      if (!form.tanggal_lahir) errs.push("Tanggal lahir wajib diisi.");
      if (!form.jenis_kelamin) errs.push("Jenis kelamin wajib dipilih.");
      if (!form.agama) errs.push("Agama wajib dipilih.");
      if (!form.alamat_lengkap.trim()) errs.push("Alamat lengkap wajib diisi.");
      if (!form.no_pribadi.trim()) errs.push("Nomor HP pribadi wajib diisi.");
      if (!form.nisn.trim() || form.nisn.replace(/\D/g, "").length !== 10) {
        errs.push("NISN wajib 10 digit angka.");
      }
      if (!form.nik.trim() || form.nik.replace(/\D/g, "").length !== 16) {
        errs.push("NIK wajib 16 digit angka.");
      }
      if (!form.asal_sekolah.trim()) errs.push("Asal sekolah wajib diisi.");
      if (!form.jurusan_id) errs.push("Pilihan jurusan wajib dipilih.");
    }
    if (current === 2) {
      const nilai = form.nilai_rata_rata.trim();
      if (!nilai) {
        errs.push("Nilai rata-rata rapor wajib diisi.");
      } else {
        const n = Number(nilai);
        if (Number.isNaN(n) || n < 0 || n > 100) {
          errs.push("Nilai rata-rata rapor harus antara 0 dan 100.");
        }
      }
    }
    if (current === 3) {
      if (!form.nama_ayah.trim()) errs.push("Nama ayah wajib diisi.");
      if (!form.nama_ibu.trim()) errs.push("Nama ibu wajib diisi.");
      if (!form.pekerjaan_ayah.trim()) errs.push("Pekerjaan ayah wajib diisi.");
      if (!form.pekerjaan_ibu.trim()) errs.push("Pekerjaan ibu wajib diisi.");
      if (!form.no_ortu.trim()) errs.push("Nomor WhatsApp orang tua wajib diisi.");
    }
    if (current === 4) {
      (["foto", "ijazah", "rapor", "kk"] as BerkasKey[]).forEach((key) => {
        if (!berkasUrls[key] && !berkasFiles[key]) {
          errs.push(`${BERKAS_LABELS[key]} wajib diunggah.`);
        }
      });
    }
    return errs;
  }

  async function uploadBerkasFile(key: BerkasKey, file: File) {
    if (!userId || !siswaId) return null;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${key}/${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("berkas-pendaftaran")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      throw new Error("Gagal upload " + key + ": " + upErr.message);
    }

    const { data: publicData } = supabase.storage
      .from("berkas-pendaftaran")
      .getPublicUrl(path);

    return publicData?.publicUrl ?? path;
  }

  async function persistStep(current: number) {
    if (!siswaId) return;

    if (current === 1) {
      const { error } = await supabase
        .from("siswa")
        .update({
          nama_lengkap: form.nama_lengkap.trim(),
          nama_panggilan: form.nama_panggilan.trim(),
          tempat_lahir: form.tempat_lahir.trim(),
          tanggal_lahir: form.tanggal_lahir || null,
          jenis_kelamin: form.jenis_kelamin || null,
          agama: form.agama,
          alamat_lengkap: form.alamat_lengkap.trim(),
          no_pribadi: form.no_pribadi.trim(),
          nisn: form.nisn.replace(/\D/g, ""),
          nik: form.nik.replace(/\D/g, ""),
          asal_sekolah: form.asal_sekolah.trim(),
          jurusan_id: form.jurusan_id || null,
          tahap_terakhir: 2,
        })
        .eq("id", siswaId);
      if (error) throw new Error(error.message);
    }

    if (current === 2) {
      const { error } = await supabase
        .from("siswa")
        .update({
          nilai_rata_rata: Number(form.nilai_rata_rata.trim()),
          prestasi: form.prestasi.trim() || null,
          tahap_terakhir: 3,
        })
        .eq("id", siswaId);
      if (error) throw new Error(error.message);
    }

    if (current === 3) {
      const ortuPayload = {
        siswa_id: siswaId,
        nama_ayah: form.nama_ayah.trim(),
        nama_ibu: form.nama_ibu.trim(),
        no_ortu: form.no_ortu.trim(),
        pekerjaan_ayah: form.pekerjaan_ayah.trim(),
        pekerjaan_ibu: form.pekerjaan_ibu.trim(),
      };
      const { data: existing } = await supabase
        .from("ortu")
        .select("id")
        .eq("siswa_id", siswaId)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase.from("ortu").update(ortuPayload).eq("siswa_id", siswaId);
      } else {
        result = await supabase.from("ortu").insert(ortuPayload);
      }

      if (result.error) throw new Error(result.error.message);

      await supabase
        .from("siswa")
        .update({ tahap_terakhir: 4 })
        .eq("id", siswaId);
    }

    if (current === 4) {
      const urls = { ...berkasUrls };
      for (const key of ["foto", "ijazah", "rapor", "kk"] as BerkasKey[]) {
        const file = berkasFiles[key];
        if (file) {
          urls[key] = (await uploadBerkasFile(key, file)) ?? urls[key];
        }
      }
      setBerkasUrls(urls);

      const berkasPayload = {
        siswa_id: siswaId,
        foto_url: urls.foto || null,
        ijazah_url: urls.ijazah || null,
        rapor_url: urls.rapor || null,
        kk_url: urls.kk || null,
      };

      const { data: existingBerkas } = await supabase
        .from("berkas")
        .select("id")
        .eq("siswa_id", siswaId)
        .maybeSingle();

      if (existingBerkas) {
        const { error } = await supabase
          .from("berkas")
          .update(berkasPayload)
          .eq("siswa_id", siswaId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("berkas").insert(berkasPayload);
        if (error) throw new Error(error.message);
      }

      setBerkasFiles({});
      setBerkasMeta((prev) => {
        const next = { ...prev };
        for (const key of ["foto", "ijazah", "rapor", "kk"] as BerkasKey[]) {
          const file = berkasFiles[key];
          if (file) next[key] = { name: file.name, size: file.size };
        }
        return next;
      });
      await supabase
        .from("siswa")
        .update({ tahap_terakhir: 5 })
        .eq("id", siswaId);
    }
  }

  async function handleNext() {
    if (alreadySubmitted) return;
    const errs = validateStep(step);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setSaving(true);
    setSaveStatus("saving");
    try {
      await persistStep(step);
      lastSavedRef.current = new Date();
      setLastSavedText(formatLastSaved(lastSavedRef.current));
      setSaveStatus("saved");
      setStep((s) => Math.min(s + 1, 5));
      showToast("Data tahap ini berhasil disimpan.", "success");
    } catch (e) {
      setSaveStatus("idle");
      showToast(e instanceof Error ? e.message : "Gagal menyimpan data.", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    const errs = validateStep(4);
    if (errs.length > 0) {
      setErrors(errs);
      setStep(4);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    setSaveStatus("saving");
    try {
      await persistStep(4);
      lastSavedRef.current = new Date();
      setLastSavedText(formatLastSaved(lastSavedRef.current));
      setSaveStatus("saved");
      const { error } = await supabase
        .from("siswa")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          tahap_terakhir: 5,
        })
        .eq("id", siswaId!);
      if (error) throw new Error(error.message);
      setAlreadySubmitted(true);
      showToast("Pendaftaran berhasil dikirim!", "success");
    } catch (e) {
      setSaveStatus("idle");
      showToast(e instanceof Error ? e.message : "Gagal mengirim pendaftaran.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBerkasSelect(key: BerkasKey, file: File | null) {
    if (!file) return;
    if (file.size > MAX_BERKAS_BYTES) {
      showToast("Ukuran file maksimal 2 MB.", "error");
      return;
    }
    if (!isAllowedBerkasType(key, file)) {
      showToast(
        key === "foto"
          ? "Foto harus berformat JPG atau PNG."
          : "File harus berformat PDF, JPG, atau PNG.",
        "error"
      );
      return;
    }
    setBerkasFiles((p) => ({ ...p, [key]: file }));
    setBerkasMeta((p) => ({ ...p, [key]: { name: file.name, size: file.size } }));
    const preview = URL.createObjectURL(file);
    setBerkasPreviews((p) => {
      if (p[key]) URL.revokeObjectURL(p[key]!);
      return { ...p, [key]: preview };
    });
  }

  function clearBerkas(key: BerkasKey) {
    setBerkasFiles((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
    setBerkasPreviews((p) => {
      if (p[key]) URL.revokeObjectURL(p[key]!);
      const next = { ...p };
      delete next[key];
      return next;
    });
    setBerkasUrls((p) => ({ ...p, [key]: "" }));
    setBerkasMeta((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  }

  function berkasDisplayName(key: BerkasKey) {
    if (berkasFiles[key]?.name) return berkasFiles[key]!.name;
    if (berkasMeta[key]?.name) return berkasMeta[key]!.name;
    const url = berkasUrls[key];
    if (!url) return null;
    try {
      const part = url.split("/").pop()?.split("?")[0] ?? "";
      return decodeURIComponent(part) || "File terunggah";
    } catch {
      return "File terunggah";
    }
  }

  function hasBerkas(key: BerkasKey) {
    return !!(berkasUrls[key] || berkasFiles[key]);
  }

  const jurusanName =
    jurusanList.find((j) => j.id === form.jurusan_id)?.nama ?? "—";

  const berkasIncomplete = (["foto", "ijazah", "rapor", "kk"] as BerkasKey[]).some(
    (k) => !hasBerkas(k)
  );

  if (loading) {
    return (
      <div className="pend-loading" data-animate data-delay="0">
        <div className="pend-spinner" />
        <p>Memuat formulir pendaftaran...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .pend-stepper-wrap {
          margin-bottom: 28px;
        }

        .pend-stepper {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
        }

        .pend-step-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .pend-step-line {
          position: absolute;
          top: 18px;
          left: 50%;
          right: -50%;
          height: 2px;
          background: #E5E7EB;
          z-index: 0;
        }

        .pend-step-item:last-child .pend-step-line {
          display: none;
        }

        .pend-step-line.done {
          background: #1C5C38;
        }

        .pend-step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          position: relative;
          z-index: 2;
          transition: all 0.2s ease;
        }

        .pend-step-circle.pending {
          background: #fff;
          border: 2px solid #E5E7EB;
          color: #6B7280;
        }

        .pend-step-circle.active {
          background: #1C5C38;
          color: #fff;
          border: 2px solid #1C5C38;
          box-shadow: 0 0 0 4px #EBF4EE;
        }

        .pend-step-circle.done {
          background: #1C5C38;
          color: #fff;
          border: 2px solid #1C5C38;
        }

        .pend-step-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: center;
          color: #6B7280;
          max-width: 90px;
          line-height: 1.3;
        }

        .pend-step-label.active {
          color: #1C5C38;
        }

        .pend-progress-text {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: #6B7280;
          margin-top: 16px;
        }

        .form-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 8px;
        }

        .form-card-inner {
          animation: slideInRight 0.3s ease;
        }

        .form-section-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #0C0C0C;
          margin-bottom: 20px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: #0C0C0C;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-textarea {
          min-height: 96px;
          resize: vertical;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #1C5C38;
          box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
        }

        .form-errors {
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #991B1B;
        }

        .form-errors ul {
          margin: 0;
          padding-left: 18px;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #F3F4F6;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          background: #fff;
          color: #374151;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-back:hover:not(:disabled) {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .btn-next {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: #1C5C38;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          margin-left: auto;
        }

        .btn-next:hover:not(:disabled) {
          background: #2A7A4E;
        }

        .btn-next:disabled,
        .btn-back:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .upload-zone {
          border: 2px dashed #E5E7EB;
          border-radius: 12px;
          padding: 20px 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .upload-zone:hover,
        .upload-zone.drag-over {
          border-color: #1C5C38;
          background: #F2F8F4;
        }

        .upload-zone.has-file {
          border-style: solid;
          border-color: #EBF4EE;
          background: #F2F8F4;
          min-height: 140px;
          height: 140px;
          overflow: hidden;
          padding: 12px 16px;
          flex-direction: row;
          justify-content: flex-start;
          text-align: left;
        }

        .upload-zone p {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .upload-zone span {
          font-size: 11px;
          color: #6B7280;
        }

        .upload-preview {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
        }

        .upload-clear {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #DC2626;
          background: none;
          border: none;
          cursor: pointer;
          margin-top: 4px;
        }

        .review-grid {
          display: grid;
          gap: 20px;
        }

        .review-block {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }

        .review-block-title {
          background: #F9FAFB;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6B7280;
        }

        .review-rows {
          padding: 12px 14px;
        }

        .review-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 1px solid #F3F4F6;
          font-size: 13px;
        }

        .review-row:last-child {
          border-bottom: none;
        }

        .review-row dt {
          color: #6B7280;
          font-weight: 500;
        }

        .review-row dd {
          color: #0C0C0C;
          font-weight: 600;
          text-align: right;
        }

        .submitted-banner {
          background: #D1FAE5;
          border: 1px solid #A7F3D0;
          color: #065F46;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .pend-loading {
          text-align: center;
          padding: 60px 20px;
          color: #6B7280;
          font-size: 14px;
        }

        .pend-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #E5E7EB;
          border-top-color: #1C5C38;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .pend-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 200;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .pend-toast.success {
          background: #D1FAE5;
          color: #065F46;
        }

        .pend-toast.error {
          background: #FEE2E2;
          color: #991B1B;
        }

        .upload-zone {
          padding: 24px;
        }

        .upload-file-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
        }

        .upload-file-info {
          flex: 1;
          min-width: 0;
        }

        .upload-file-name {
          font-size: 13px;
          font-weight: 600;
          color: #0C0C0C;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .upload-file-size {
          font-size: 11px;
          color: #6B7280;
          margin-top: 2px;
        }

        .upload-remove {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
          background: #fff;
          color: #6B7280;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .upload-remove:hover {
          background: #FEE2E2;
          color: #DC2626;
          border-color: #FECACA;
        }

        .review-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 32px;
        }

        .review-field dt {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .review-field dd {
          font-size: 14px;
          color: #0C0C0C;
          font-weight: 600;
        }

        .berkas-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .berkas-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
        }

        .berkas-check-icon.ok {
          color: #16A34A;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .berkas-check-icon.no {
          color: #DC2626;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .berkas-check-label {
          font-weight: 600;
          color: #374151;
        }

        .berkas-check-file {
          font-size: 12px;
          color: #6B7280;
          margin-top: 2px;
        }

        .disclaimer-box {
          background: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 13px;
          color: #92400E;
          margin: 20px 0;
          line-height: 1.5;
        }

        .btn-submit-full {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 22px;
          background: #1C5C38;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 8px;
        }

        .btn-submit-full:hover:not(:disabled) {
          background: #2A7A4E;
        }

        .btn-submit-full:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .form-actions-step5 {
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
        }

        .form-actions-step5 .btn-back {
          align-self: flex-start;
        }

        .btn-kartu-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 24px;
          padding: 12px 24px;
          border: 2px solid #1C5C38;
          border-radius: 10px;
          color: #1C5C38;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .btn-kartu-link:hover {
          background: #1C5C38;
          color: #fff;
        }

        @media (max-width: 768px) {
          .form-grid-2,
          .form-grid-4,
          .upload-grid {
            grid-template-columns: 1fr;
          }
          .pend-step-label {
            font-size: 9px;
            max-width: 64px;
          }
          .form-card {
            padding: 20px 16px;
          }
          .review-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="pend-page-header">
        <h1>Formulir Pendaftaran</h1>
        <p>Lengkapi data diri Anda untuk memulai masa depan digital.</p>
      </div>

      <div style={{ textAlign: "center" }}>
        {!countdown.isExpired && tanggalTutup && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FEF3C7",
              border: "1px solid #F59E0B",
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 13,
              color: "#92400E",
              marginBottom: 16,
            }}
          >
            <span>⏰</span>
            Pendaftaran ditutup dalam{" "}
            <strong>
              {countdown.days > 0 && `${countdown.days} hari `}
              {countdown.hours} jam {countdown.minutes} menit
            </strong>
          </div>
        )}
        {countdown.isExpired && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FEE2E2",
              border: "1px solid #DC2626",
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 13,
              color: "#991B1B",
              marginBottom: 16,
            }}
          >
            <span>🚫</span> Pendaftaran sudah ditutup
          </div>
        )}
      </div>

      <div className="pend-stepper-wrap" data-animate data-delay="0">
        <div className="pend-stepper">
          {STEPS.map((label, i) => {
            const num = i + 1;
            const isDone = num < step;
            const isActive = num === step;
            return (
              <div key={label} className="pend-step-item">
                <div className={`pend-step-line${isDone ? " done" : ""}`} />
                <div
                  className={`pend-step-circle${
                    isDone ? " done" : isActive ? " active" : " pending"
                  }`}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : num}
                </div>
                <span
                  className={`pend-step-label${isActive ? " active" : ""}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="pend-progress-text">
          Tahap {step} dari {STEPS.length}
        </p>
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: 16,
          fontSize: 13,
          color: "#6B7280",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Clock size={14} />
        Estimasi tahap ini:{" "}
        <strong style={{ color: "#1C5C38" }}>{ESTIMASI[step]}</strong>
      </div>

      <div className="form-card" data-animate data-delay="100">
        {alreadySubmitted && (
          <div className="submitted-banner">
            Pendaftaran Anda sudah dikirim dan sedang diproses.
          </div>
        )}

        {errors.length > 0 && (
          <div className="form-errors">
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div key={step} className="form-card-inner">
          {step === 1 && (
            <>
              <h2 className="form-section-title">Data Diri</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="nama_lengkap">Nama Lengkap</label>
                  <input
                    id="nama_lengkap"
                    className="form-input"
                    value={form.nama_lengkap}
                    onChange={(e) => updateField("nama_lengkap", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nama_panggilan">Nama Panggilan</label>
                  <input
                    id="nama_panggilan"
                    className="form-input"
                    value={form.nama_panggilan}
                    onChange={(e) => updateField("nama_panggilan", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="nisn">NISN</label>
                  <input
                    id="nisn"
                    className="form-input"
                    value={form.nisn}
                    onChange={(e) =>
                      updateField("nisn", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    disabled={alreadySubmitted}
                    inputMode="numeric"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nik">NIK</label>
                  <input
                    id="nik"
                    className="form-input"
                    value={form.nik}
                    onChange={(e) =>
                      updateField("nik", e.target.value.replace(/\D/g, "").slice(0, 16))
                    }
                    disabled={alreadySubmitted}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="form-grid-4">
                <div className="form-group">
                  <label htmlFor="tempat_lahir">Tempat Lahir</label>
                  <input
                    id="tempat_lahir"
                    className="form-input"
                    value={form.tempat_lahir}
                    onChange={(e) => updateField("tempat_lahir", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tanggal_lahir">Tanggal Lahir</label>
                  <input
                    id="tanggal_lahir"
                    type="date"
                    className="form-input"
                    value={form.tanggal_lahir}
                    onChange={(e) => updateField("tanggal_lahir", e.target.value)}
                    disabled={alreadySubmitted}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
                  <select
                    id="jenis_kelamin"
                    className="form-select"
                    value={form.jenis_kelamin}
                    onChange={(e) =>
                      updateField("jenis_kelamin", e.target.value as "" | "L" | "P")
                    }
                    disabled={alreadySubmitted}
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="agama">Agama</label>
                  <select
                    id="agama"
                    className="form-select"
                    value={form.agama}
                    onChange={(e) => updateField("agama", e.target.value)}
                    disabled={alreadySubmitted}
                  >
                    <option value="">Pilih</option>
                    {AGAMA_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="jurusan_id">Pilihan Jurusan</label>
                  <div
                    id="jurusan_id"
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
                  >
                    {jurusanList.map((j) => {
                      const k = kuotaData[j.id];
                      const isSelected = form.jurusan_id === j.id;
                      const almostFull = k && k.persenTerisi >= 80;
                      return (
                        <div
                          key={j.id}
                          onClick={() => {
                            if (!alreadySubmitted) updateField("jurusan_id", j.id);
                          }}
                          style={{
                            border: `2px solid ${isSelected ? "#1C5C38" : "#E5E7EB"}`,
                            borderRadius: 10,
                            padding: "12px 14px",
                            cursor: alreadySubmitted ? "not-allowed" : "pointer",
                            background: isSelected ? "#F2F8F4" : "white",
                            transition: "all 0.15s",
                            opacity: alreadySubmitted ? 0.7 : 1,
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0C0C0C" }}>
                            {j.kode}
                          </div>
                          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                            {j.nama}
                          </div>
                          {k && (
                            <div style={{ marginTop: 8 }}>
                              <div
                                style={{
                                  height: 4,
                                  background: "#E5E7EB",
                                  borderRadius: 9999,
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    borderRadius: 9999,
                                    width: `${k.persenTerisi}%`,
                                    background: almostFull ? "#F59E0B" : "#1C5C38",
                                    transition: "width 0.3s",
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: almostFull ? "#D97706" : "#6B7280",
                                  marginTop: 4,
                                }}
                              >
                                {almostFull ? "⚠ Hampir penuh — " : ""}
                                {k.sisa} kursi tersisa
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="asal_sekolah">Asal Sekolah</label>
                  <input
                    id="asal_sekolah"
                    className="form-input"
                    value={form.asal_sekolah}
                    onChange={(e) => updateField("asal_sekolah", e.target.value)}
                    disabled={alreadySubmitted}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="no_pribadi">Nomor HP Pribadi</label>
                <input
                  id="no_pribadi"
                  className="form-input"
                  inputMode="tel"
                  value={form.no_pribadi}
                  onChange={(e) => updateField("no_pribadi", e.target.value.replace(/\D/g, ""))}
                  disabled={alreadySubmitted}
                />
              </div>
              <div className="form-group">
                <label htmlFor="alamat_lengkap">Alamat Lengkap</label>
                <textarea
                  id="alamat_lengkap"
                  className="form-textarea"
                  value={form.alamat_lengkap}
                  onChange={(e) => updateField("alamat_lengkap", e.target.value)}
                  disabled={alreadySubmitted}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="form-section-title">Data Akademik</h2>
              <div className="form-group">
                <label htmlFor="nilai_rata_rata">Nilai Rata-rata Rapor *</label>
                <input
                  id="nilai_rata_rata"
                  type="text"
                  inputMode="decimal"
                  className="form-input"
                  placeholder="Contoh: 85.50"
                  value={form.nilai_rata_rata}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) updateField("nilai_rata_rata", val);
                  }}
                  disabled={alreadySubmitted}
                />
              </div>
              <div className="form-group">
                <label htmlFor="prestasi">Prestasi / Penghargaan</label>
                <textarea
                  id="prestasi"
                  className="form-textarea"
                  rows={3}
                  placeholder="Contoh: Juara 1 LKS 2024 (opsional)"
                  value={form.prestasi}
                  onChange={(e) => updateField("prestasi", e.target.value)}
                  disabled={alreadySubmitted}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="form-section-title">Data Orang Tua</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="nama_ayah">Nama Ayah *</label>
                  <input
                    id="nama_ayah"
                    className="form-input"
                    value={form.nama_ayah}
                    onChange={(e) => updateField("nama_ayah", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nama_ibu">Nama Ibu *</label>
                  <input
                    id="nama_ibu"
                    className="form-input"
                    value={form.nama_ibu}
                    onChange={(e) => updateField("nama_ibu", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="pekerjaan_ayah">Pekerjaan Ayah *</label>
                  <input
                    id="pekerjaan_ayah"
                    className="form-input"
                    value={form.pekerjaan_ayah}
                    onChange={(e) => updateField("pekerjaan_ayah", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pekerjaan_ibu">Pekerjaan Ibu *</label>
                  <input
                    id="pekerjaan_ibu"
                    className="form-input"
                    value={form.pekerjaan_ibu}
                    onChange={(e) => updateField("pekerjaan_ibu", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    disabled={alreadySubmitted}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="no_ortu">Nomor WhatsApp Orang Tua *</label>
                <input
                  id="no_ortu"
                  className="form-input"
                  placeholder="Contoh: 08123456789"
                  inputMode="tel"
                  value={form.no_ortu}
                  onChange={(e) => updateField("no_ortu", e.target.value.replace(/\D/g, ""))}
                  disabled={alreadySubmitted}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="form-section-title">Upload Berkas</h2>
              <div className="upload-grid">
                {(["foto", "ijazah", "rapor", "kk"] as BerkasKey[]).map((key) => {
                  const preview = berkasPreviews[key];
                  const file = berkasFiles[key];
                  const hasFile = hasBerkas(key);
                  const meta = file
                    ? { name: file.name, size: file.size }
                    : berkasMeta[key] ??
                      (berkasUrls[key]
                        ? {
                            name: berkasDisplayName(key) ?? BERKAS_LABELS[key],
                            size: 0,
                          }
                        : undefined);
                  const hint =
                    key === "foto"
                      ? "JPG/PNG · maks. 2 MB"
                      : "PDF/JPG · maks. 2 MB";
                  return (
                    <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                      <label>{BERKAS_LABELS[key]} *</label>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[key] = el;
                        }}
                        type="file"
                        accept={BERKAS_ACCEPT[key]}
                        className="hidden"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleBerkasSelect(key, e.target.files?.[0] ?? null)
                        }
                      />
                      <div
                        className={`upload-zone${dragBerkas === key ? " drag-over" : ""}${hasFile ? " has-file" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragBerkas(key);
                        }}
                        onDragLeave={() => setDragBerkas(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragBerkas(null);
                          handleBerkasSelect(key, e.dataTransfer.files?.[0] ?? null);
                        }}
                        onClick={() => !hasFile && fileInputRefs.current[key]?.click()}
                      >
                        {hasFile ? (
                          <div
                            className="upload-file-row"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {key === "foto" && preview ? (
                              <img
                                src={preview}
                                alt={BERKAS_LABELS[key]}
                                className="upload-preview"
                              />
                            ) : (
                              <FileText size={28} color="#1C5C38" />
                            )}
                            <div className="upload-file-info">
                              <div className="upload-file-name">
                                {meta?.name ?? BERKAS_LABELS[key]}
                              </div>
                              {meta && meta.size > 0 && (
                                <div className="upload-file-size">
                                  {formatFileSize(meta.size)}
                                </div>
                              )}
                            </div>
                            {!alreadySubmitted && (
                              <button
                                type="button"
                                className="upload-remove"
                                aria-label="Hapus file"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearBerkas(key);
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <FileText size={28} color="#6B7280" />
                            <p>Klik untuk upload atau drag &amp; drop</p>
                            <span>{hint}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="form-section-title">Review & Kirim</h2>
              <div className="review-grid">
                <div className="review-block">
                  <div className="review-block-title">Data Diri</div>
                  <div className="review-rows review-grid-2">
                    <div className="review-field">
                      <dt>Nama Lengkap</dt>
                      <dd>{form.nama_lengkap || "—"}</dd>
                    </div>
                    <div className="review-field">
                      <dt>NISN</dt>
                      <dd>{form.nisn || "—"}</dd>
                    </div>
                    <div className="review-field">
                      <dt>NIK</dt>
                      <dd>{form.nik || "—"}</dd>
                    </div>
                    <div className="review-field">
                      <dt>Tempat, Tanggal Lahir</dt>
                      <dd>
                        {form.tempat_lahir || "—"}
                        {form.tanggal_lahir
                          ? `, ${new Date(form.tanggal_lahir).toLocaleDateString("id-ID")}`
                          : ""}
                      </dd>
                    </div>
                    <div className="review-field">
                      <dt>Jurusan</dt>
                      <dd>{jurusanName}</dd>
                    </div>
                    <div className="review-field">
                      <dt>Asal Sekolah</dt>
                      <dd>{form.asal_sekolah || "—"}</dd>
                    </div>
                    <div className="review-field" style={{ gridColumn: "1 / -1" }}>
                      <dt>Alamat</dt>
                      <dd>{form.alamat_lengkap || "—"}</dd>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <div className="review-block-title">Data Akademik</div>
                  <div className="review-rows review-grid-2">
                    <div className="review-field">
                      <dt>Nilai Rata-rata Rapor</dt>
                      <dd>{form.nilai_rata_rata || "—"}</dd>
                    </div>
                    <div className="review-field" style={{ gridColumn: "1 / -1" }}>
                      <dt>Prestasi / Penghargaan</dt>
                      <dd>{form.prestasi.trim() || "—"}</dd>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <div className="review-block-title">Data Orang Tua</div>
                  <div className="review-rows review-grid-2">
                    <div className="review-field">
                      <dt>Nama Ayah</dt>
                      <dd>{form.nama_ayah || "—"}</dd>
                    </div>
                    <div className="review-field">
                      <dt>Nama Ibu</dt>
                      <dd>{form.nama_ibu || "—"}</dd>
                    </div>
                    <div className="review-field">
                      <dt>Pekerjaan Ayah</dt>
                      <dd>{form.pekerjaan_ayah || "—"}</dd>
                    </div>
                    <div className="review-field">
                      <dt>Pekerjaan Ibu</dt>
                      <dd>{form.pekerjaan_ibu || "—"}</dd>
                    </div>
                    <div className="review-field" style={{ gridColumn: "1 / -1" }}>
                      <dt>Nomor WhatsApp</dt>
                      <dd>{form.no_ortu || "—"}</dd>
                    </div>
                  </div>
                </div>

                <div className="review-block">
                  <div className="review-block-title">Kelengkapan Berkas</div>
                  <div className="review-rows berkas-checklist">
                    {(["foto", "ijazah", "rapor", "kk"] as BerkasKey[]).map((key) => {
                      const ok = hasBerkas(key);
                      const fileName = berkasDisplayName(key);
                      return (
                        <div className="berkas-check-item" key={key}>
                          {ok ? (
                            <Check
                              size={16}
                              strokeWidth={3}
                              className="berkas-check-icon ok"
                            />
                          ) : (
                            <X
                              size={16}
                              strokeWidth={3}
                              className="berkas-check-icon no"
                            />
                          )}
                          <div>
                            <div className="berkas-check-label">{BERKAS_LABELS[key]}</div>
                            {ok && fileName && (
                              <div className="berkas-check-file">{fileName}</div>
                            )}
                            {!ok && (
                              <div className="berkas-check-file">Belum diunggah</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="disclaimer-box">
                Pastikan semua data sudah benar. Data yang telah dikirim tidak dapat diubah.
              </div>

              {alreadySubmitted && (
                <div style={{ textAlign: "center" }}>
                  <Link href="/pendaftaran/kartu" className="btn-kartu-link">
                    Lihat Kartu Pendaftaran →
                  </Link>
                </div>
              )}
            </>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#6B7280",
              minHeight: 20,
            }}
          >
            {saveStatus === "saving" && (
              <>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#F59E0B",
                    display: "inline-block",
                  }}
                />
                Menyimpan...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10B981",
                    display: "inline-block",
                  }}
                />
                {lastSavedText || "Belum tersimpan"}
              </>
            )}
          </div>

          {!alreadySubmitted && (
            <div
              className={`form-actions${step === 5 ? " form-actions-step5" : ""}`}
            >
              {step > 1 ? (
                <button
                  type="button"
                  className="btn-back"
                  onClick={handleBack}
                  disabled={saving || submitting}
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>
              ) : (
                <span />
              )}
              {step < 5 ? (
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleNext}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Lanjut"}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-submit-full"
                  onClick={handleSubmit}
                  disabled={submitting || berkasIncomplete}
                >
                  {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`pend-toast ${toast.type}`}>{toast.msg}</div>
      )}

      <div className="trust-badges">
        <div className="trust-badge">
          <div className="trust-badge-icon green">🛡️</div>
          <div>
            <div className="trust-badge-title green">Data Terenkripsi</div>
            <div className="trust-badge-desc">Informasi kamu aman bersama sistem kami.</div>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-badge-icon yellow">⚡</div>
          <div>
            <div className="trust-badge-title yellow">Proses Cepat</div>
            <div className="trust-badge-desc">Estimasi pendaftaran hanya 10 menit.</div>
          </div>
        </div>
        <div className="trust-badge">
          <div className="trust-badge-icon blue">🎧</div>
          <div>
            <div className="trust-badge-title blue">Butuh Bantuan?</div>
            <div className="trust-badge-desc">Hubungi CS kami di (021) 77201052.</div>
          </div>
        </div>
      </div>
    </>
  );
}