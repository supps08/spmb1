-- ============================================================
-- SPMB SMK Citra Negara — Supabase Schema v3
-- Struktur sesuai papan tulis: Siswa, Ortu, Berkas terpisah
-- Role: user + admin
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- Auth layer — satu row per akun terdaftar
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null,
  phone        text,                  -- nomor WhatsApp (dari Register.png)
  avatar_url   text,
  role         text not null default 'user'
               check (role in ('user', 'admin')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 2. LOGIN_HISTORY
-- Untuk tabel Histori Login di dashboard admin
-- ============================================================
create table public.login_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete set null,
  ip_address   inet,
  user_agent   text,
  status       text not null check (status in ('berhasil', 'gagal')),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 3. JURUSAN
-- Referensi jurusan untuk dropdown form & laporan
-- ============================================================
create table public.jurusan (
  id           uuid primary key default uuid_generate_v4(),
  kode         text not null unique,
  nama         text not null,
  deskripsi    text,
  kuota        int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

insert into public.jurusan (kode, nama, kuota) values
  ('PPLG', 'Pengembangan Perangkat Lunak & GIM', 72),
  ('TKJ',  'Teknik Komputer & Jaringan', 72),
  ('MPLB', 'Manajemen Perkantoran & Layanan Bisnis', 72);

-- ============================================================
-- 4. SISWA  ← tabel utama pendaftaran
-- Field dari papan tulis: nama lengkap, nama panggilan, TTL,
-- jenis kelamin, alamat, agama, no pribadi, jurusan, asal sekolah,
-- NISN, NIK
-- ============================================================
create table public.siswa (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references public.profiles(id) on delete cascade,
  jurusan_id        uuid references public.jurusan(id),

  -- Status pendaftaran
  status            text not null default 'draft'
                    check (status in ('draft','submitted','diterima','ditolak','menunggu')),
  tahap_terakhir    int not null default 1 check (tahap_terakhir between 1 and 5),

  -- Data diri (dari papan tulis)
  nama_lengkap      text,
  nama_panggilan    text,
  tempat_lahir      text,
  tanggal_lahir     date,
  jenis_kelamin     text check (jenis_kelamin in ('L', 'P')),
  agama             text,
  alamat_lengkap    text,
  no_pribadi        text,             
  asal_sekolah      text,
  nisn              text unique,
  nik               text unique,

  
  submitted_at      timestamptz,
  verified_at       timestamptz,
  verified_by       uuid references public.profiles(id),
  catatan_verifikasi text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- 5. ORTU  ← tabel terpisah sesuai papan tulis
-- ============================================================
create table public.ortu (
  id              uuid primary key default uuid_generate_v4(),
  siswa_id        uuid not null unique references public.siswa(id) on delete cascade,

  -- Dari papan tulis: nama ortu, no ortu
  nama_ayah       text,
  nama_ibu        text,
  no_ortu         text,              -- nomor HP orang tua
  pekerjaan_ayah  text,
  pekerjaan_ibu   text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- 6. BERKAS  ← tabel terpisah sesuai papan tulis
-- Upload berkas — path di Supabase Storage
-- ============================================================
create table public.berkas (
  id           uuid primary key default uuid_generate_v4(),
  siswa_id     uuid not null unique references public.siswa(id) on delete cascade,

  foto_url     text,
  ijazah_url   text,
  rapor_url    text,
  kk_url       text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 7. PENGATURAN_SISTEM
-- Nama sekolah, tahun ajaran, status pendaftaran, dll
-- ============================================================
create table public.pengaturan_sistem (
  key          text primary key,
  value        text,
  label        text,
  updated_by   uuid references public.profiles(id),
  updated_at   timestamptz not null default now()
);

insert into public.pengaturan_sistem (key, value, label) values
  ('nama_sekolah',      'SMK Citra Negara', 'Nama Sekolah'),
  ('tahun_ajaran',      '2025/2026',        'Tahun Ajaran Aktif'),
  ('tanggal_buka',      '2025-06-01',       'Tanggal Buka Pendaftaran'),
  ('tanggal_tutup',     '2025-08-31',       'Tanggal Tutup Pendaftaran'),
  ('pendaftaran_aktif', 'true',             'Status Pendaftaran');

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_login_history_user  on public.login_history(user_id);
create index idx_login_history_time  on public.login_history(created_at desc);
create index idx_siswa_user          on public.siswa(user_id);
create index idx_siswa_status        on public.siswa(status);
create index idx_siswa_jurusan       on public.siswa(jurusan_id);
create index idx_siswa_nisn          on public.siswa(nisn);
create index idx_siswa_nik           on public.siswa(nik);
create index idx_ortu_siswa          on public.ortu(siswa_id);
create index idx_berkas_siswa        on public.berkas(siswa_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trg_siswa_updated_at
  before update on public.siswa
  for each row execute function public.handle_updated_at();

create trigger trg_ortu_updated_at
  before update on public.ortu
  for each row execute function public.handle_updated_at();

create trigger trg_berkas_updated_at
  before update on public.berkas
  for each row execute function public.handle_updated_at();

-- Auto-create profile saat register
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', null)
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper cek admin
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.login_history     enable row level security;
alter table public.siswa             enable row level security;
alter table public.ortu              enable row level security;
alter table public.berkas            enable row level security;
alter table public.jurusan           enable row level security;
alter table public.pengaturan_sistem enable row level security;

-- ---------- profiles ----------
create policy "profiles: baca milik sendiri"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admin baca semua"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: update milik sendiri"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin update semua"
  on public.profiles for update
  using (public.is_admin());

-- ---------- login_history ----------
create policy "login_history: admin baca semua"
  on public.login_history for select
  using (public.is_admin());

create policy "login_history: service insert"
  on public.login_history for insert
  with check (true);

-- ---------- siswa ----------
create policy "siswa: user baca milik sendiri"
  on public.siswa for select
  using (user_id = auth.uid());

create policy "siswa: user insert milik sendiri"
  on public.siswa for insert
  with check (user_id = auth.uid());

create policy "siswa: user update draft milik sendiri"
  on public.siswa for update
  using (user_id = auth.uid() and status = 'draft')
  with check (user_id = auth.uid());

create policy "siswa: admin baca semua"
  on public.siswa for select
  using (public.is_admin());

create policy "siswa: admin update"
  on public.siswa for update
  using (public.is_admin());

-- ---------- ortu ----------
-- Akses via siswa_id — user hanya bisa akses ortu milik siswa sendiri
create policy "ortu: user akses milik sendiri"
  on public.ortu for all
  using (
    siswa_id in (
      select id from public.siswa where user_id = auth.uid()
    )
  );

create policy "ortu: admin akses semua"
  on public.ortu for all
  using (public.is_admin());

-- ---------- berkas ----------
create policy "berkas: user akses milik sendiri"
  on public.berkas for all
  using (
    siswa_id in (
      select id from public.siswa where user_id = auth.uid()
    )
  );

create policy "berkas: admin akses semua"
  on public.berkas for all
  using (public.is_admin());

-- ---------- jurusan ----------
create policy "jurusan: semua baca"
  on public.jurusan for select
  using (true);

create policy "jurusan: admin kelola"
  on public.jurusan for all
  using (public.is_admin());

-- ---------- pengaturan_sistem ----------
create policy "pengaturan: semua baca"
  on public.pengaturan_sistem for select
  using (true);

create policy "pengaturan: admin update"
  on public.pengaturan_sistem for update
  using (public.is_admin());

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public)
values ('berkas-pendaftaran', 'berkas-pendaftaran', false);

-- Path convention: {user_id}/{tipe_berkas}/{filename}
create policy "storage: user upload berkas sendiri"
  on storage.objects for insert
  with check (
    bucket_id = 'berkas-pendaftaran'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage: user baca berkas sendiri"
  on storage.objects for select
  using (
    bucket_id = 'berkas-pendaftaran'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage: admin baca semua berkas"
  on storage.objects for select
  using (
    bucket_id = 'berkas-pendaftaran'
    and public.is_admin()
  );
