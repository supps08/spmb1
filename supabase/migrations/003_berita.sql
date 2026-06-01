-- ============================================================
-- BERITA — artikel & pengumuman sekolah
-- ============================================================

create table public.berita (
  id             uuid primary key default uuid_generate_v4(),
  judul          text not null,
  slug           text not null unique,
  konten         text,
  ringkasan      text,
  thumbnail_url  text,
  kategori       text not null default 'Umum'
                 check (kategori in ('Umum', 'Akademik', 'Prestasi', 'Pengumuman')),
  is_published   boolean not null default false,
  published_at   timestamptz,
  author_id      uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_berita_slug on public.berita(slug);
create index idx_berita_published on public.berita(is_published, created_at desc);

create trigger trg_berita_updated_at
  before update on public.berita
  for each row execute function public.handle_updated_at();

alter table public.berita enable row level security;

create policy "berita: publik baca yang published"
  on public.berita for select
  using (is_published = true);

create policy "berita: admin kelola"
  on public.berita for all
  using (public.is_admin());
