-- Kolom data akademik pada tabel siswa (tahap 2 pendaftaran)
alter table public.siswa
  add column if not exists nilai_rata_rata numeric(5, 2),
  add column if not exists prestasi text;
