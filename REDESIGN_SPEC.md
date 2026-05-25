# Cursor Prompt: Full UI/UX Overhaul — SPMB SMK Citra Negara
> Baca seluruh prompt ini sebelum mulai. Jangan skip bagian manapun.

---

## Stack & Konteks
- Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase, Lucide React
- Semua logika & API sudah jalan — JANGAN ubah apapun selain styling & UI
- JANGAN ubah app/login/page.tsx dan app/register/page.tsx (sudah bagus)
- File middleware: proxy.ts (bukan middleware.ts)

---

## Design System (WAJIB — jangan pakai warna lain)
```css
--color-primary:       #1C5C38
--color-primary-mid:   #2A7A4E
--color-primary-light: #EBF4EE
--color-primary-soft:  #F2F8F4
--color-success-bg:    #D1FAE5
--color-danger:        #DC2626
--color-danger-bg:     #FEE2E2
--color-border:        #E5E7EB
--color-muted:         #6B7280
--color-ink:           #0C0C0C

Font heading: 'Bricolage Grotesque', sans-serif — weight 700/800
Font body:    'Plus Jakarta Sans', sans-serif — weight 400/500/600
```
**Hapus semua:** `--warm-brown`, `#8B6B52`, `Playfair Display`, `DM Sans`, warna coklat/pink/lavender apapun.

---

## 1. HAPUS KREDENSIAL LOGIN (SECURITY)

Di `app/login/page.tsx`:
- Cari dan **hapus** semua teks yang menampilkan contoh email/password seperti:
  - "admin@spmb.com", "password123", "demo:", hint kredensial apapun
- **Nonaktifkan autocomplete browser** pada field password:
  ```html
  <input type="password" autoComplete="new-password" />
  ```
- Tambahkan `autoComplete="username"` pada field email
- Tambahkan `spellCheck={false}` dan `autoCapitalize="none"` pada field email

---

## 2. LAYOUT SHELL DASHBOARD

### app/dashboard/layout.tsx — Rebuild dari awal

**Struktur:**
```
fixed sidebar (180px) | main area
                      | fixed topbar (64px)
                      | scrollable content (bg #F2F8F4)
```

**Sidebar (fixed, left 0, top 0, bottom 0, width 180px, bg white, border-right 1px solid #E5E7EB, z-index 50):**

```
┌─────────────────────┐
│ Logo row (h:64px)   │ border-bottom
│ [S] SMK Citra Negara│
├─────────────────────┤
│ User card           │ bg #F2F8F4, border-radius 8px, margin 12px 8px
│ [avatar] Nama       │ 13px/600
│          role       │ 11px/400/#6B7280 + dot online #10B981
├─────────────────────┤
│ Nav items (gap 2px) │
│ 🏠 Beranda          │
│ 📋 Laporan          │
│ 👥 Manajemen User   │
│ 🕐 Riwayat Login    │
│ 👤 Profil Saya      │
├─────────────────────┤
│ [Keluar] (bottom)   │ absolute bottom 16px, color #DC2626
└─────────────────────┘
```

Nav item anatomy:
- Height: 40px, padding: 0 12px, border-radius: 6px, display flex, gap 10px
- Icon: Lucide, 18x18
- Default: color #6B7280
- Hover: bg #F2F8F4
- Active: bg #EBF4EE, color #1C5C38, border-left: 3px solid #1C5C38

Lucide icons:
- Beranda → `LayoutDashboard`
- Laporan → `BarChart2`
- Manajemen User → `Users`
- Riwayat Login → `History`
- Profil Saya → `User`
- Keluar → `LogOut`

**Topbar (fixed, top 0, left 180px, right 0, height 64px, bg white, border-bottom 1px solid #E5E7EB):**
- Kiri: page title — 18px/700/Bricolage, dinamis per route
- Kanan: `Search` icon + `Bell` icon (dot merah notif) + Avatar 32x32

**Mobile sidebar:** di bawah 768px, sidebar collapse jadi hamburger menu overlay. Gunakan React state `sidebarOpen`. Overlay backdrop rgba(0,0,0,0.4) saat sidebar terbuka.

**Content area:** `margin-left: 180px` (desktop), `padding-top: 64px`, `padding: 24px`, `bg: #F2F8F4`, `min-height: 100vh`. Di mobile: `margin-left: 0`, `padding: 16px`.

---

## 3. ANIMASI SCROLL (SEMUA HALAMAN)

Implementasi scroll-aware animation dengan `IntersectionObserver`. **Logika animasi:**
- Element masuk viewport saat scroll **ke bawah** → slide masuk dari **kanan ke kiri** (`translateX(40px) → translateX(0)`)
- Element masuk viewport saat scroll **ke atas** → slide masuk dari **kiri ke kanan** (`translateX(-40px) → translateX(0)`)
- Selalu disertai fade in (`opacity 0 → 1`)
- Duration: 0.5s, easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Stagger delay untuk grid/list items: `0.05s` per item

**Implementasi di `lib/useScrollAnimation.ts`:**
```typescript
import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation() {
  const lastScrollY = useRef(0)
  
  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]')
    
    const observer = new IntersectionObserver((entries) => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      lastScrollY.current = currentScrollY
      
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = Number((entry.target as HTMLElement).dataset.delay || 0)
          const el = entry.target as HTMLElement
          el.style.transition = `opacity 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`
          el.style.opacity = '1'
          el.style.transform = 'translateX(0) translateY(0)'
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.12 })
    
    elements.forEach((el, i) => {
      const htmlEl = el as HTMLElement
      const scrollingDown = window.scrollY > lastScrollY.current
      htmlEl.style.opacity = '0'
      htmlEl.style.transform = scrollingDown ? 'translateX(40px)' : 'translateX(-40px)'
      observer.observe(htmlEl)
    })
    
    const handleScroll = () => { lastScrollY.current = window.scrollY }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
}
```

Gunakan `data-animate` attribute + `data-delay="100"` pada setiap section/card/row yang ingin dianimasikan. Panggil hook ini di setiap page component.

**Animasi tambahan (CSS keyframes di globals.css):**
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.85); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 4. DASHBOARD BERANDA (app/dashboard/page.tsx)

Hero banner:
- bg: `linear-gradient(135deg, #1C5C38 0%, #2A7A4E 100%)` — HIJAU, bukan coklat
- Badge "● ADMINISTRATOR" + H1 "Selamat Datang Kembali, {nama}!" + p subtitle
- Decorative shape kanan: `position absolute`, lingkaran besar rgba(255,255,255,0.05)
- Animasi: `fadeUp 0.6s ease` saat mount

Stat cards (4 kolom, gap 16px):
- Card 1 Total Pengguna: icon `Users`, accent `#1C5C38`
- Card 2 Login Hari Ini: icon `LogIn`, accent `#1C5C38`
- Card 3 Keberhasilan: icon `CheckCircle`, accent `#1C5C38`
- Card 4 Gagal: icon `XCircle`, accent `#DC2626`, value color `#DC2626`
- Anatomy: bg white, border 1px solid #E5E7EB, border-radius 8px, padding 20px
- Icon bg: #EBF4EE (atau #FEE2E2 untuk Gagal)
- Value: 28px/800/Bricolage
- Border-bottom accent: 2px solid (warna sesuai card)
- Hover: `translateY(-2px)`, `box-shadow 0 4px 16px rgba(28,92,56,0.1)`
- Animasi stagger `data-animate data-delay="0/100/200/300"`

Tabel histori login:
- Header: "Histori Login Terkini" + badge "● LIVE" (dot pulse #10B981)
- Table header bg: #F9FAFB, font 12px/600/#6B7280, uppercase
- Badge BERHASIL: bg #D1FAE5, color #065F46
- Badge GAGAL: bg #FEE2E2, color #991B1B
- Avatar inisial per user dengan warna berbeda (hash dari nama)
- Row hover: bg #F9FAFB
- Kolom: Pengguna | Alamat IP (monospace) | Browser | Waktu | Status | Aksi (Eye icon)

---

## 5. MANAJEMEN USER (app/dashboard/users/page.tsx)

**CRUD lengkap:**
- ✅ Read: sudah ada (grid card)
- ✅ Create: modal "Tambah Pengguna"
- ✅ Update: modal "Edit Pengguna" — tambahkan toggle `is_active` (aktif/nonaktif)
- ✅ Delete: confirm inline

**Tambahan yang belum ada:**
- Filter by role: tab "Semua | Admin | User"
- Sort: dropdown "Terbaru | Terlama | A-Z"
- Pagination atau infinite scroll jika > 20 user
- Badge `is_active`: "Aktif" (hijau) / "Nonaktif" (abu) di user card
- Tombol toggle aktif/nonaktif di edit modal — update kolom `is_active` di tabel profiles

**Styling:**
- Grid: `repeat(auto-fill, minmax(280px, 1fr))`
- Card: bg white, border 1px solid #E5E7EB, border-radius 12px, hover `translateY(-2px)`
- Avatar: bg #EBF4EE, color #1C5C38 — BUKAN gradient pink
- Role pill admin: bg #EBF4EE, color #1C5C38
- Role pill user: bg #F3F4F6, color #6B7280
- Tombol Tambah: bg #1C5C38, hover #2A7A4E
- Search input: border #E5E7EB, focus border #1C5C38

---

## 6. RIWAYAT LOGIN (app/dashboard/history/page.tsx)

- Filter tabs: aktif bg #1C5C38 (Semua & Berhasil), bg #DC2626 (Gagal)
- Tambahkan filter tanggal: date range picker (input type="date" dari/sampai)
- Tambahkan tombol Export CSV: kumpulkan data history, buat Blob CSV, download
- Badge status: sama persis dengan dashboard
- Pagination: tampilkan 20 per halaman, tombol Prev/Next

---

## 7. PROFIL SAYA (app/dashboard/profile/page.tsx)

- Avatar: bg #EBF4EE, color #1C5C38 — BUKAN gradient
- Role badge: bg #EBF4EE, color #1C5C38
- Tombol simpan: bg #1C5C38
- Input focus: border #1C5C38, box-shadow 0 0 0 3px rgba(28,92,56,0.08)
- **CRUD tambahan:**
  - Update nama: PATCH ke `/api/auth/me` → update kolom `full_name` di profiles
  - Update password: POST ke Supabase `supabase.auth.updateUser({ password })`
  - Upload avatar: upload ke Storage bucket `avatars/{user_id}`, update `avatar_url` di profiles
  - Tampilkan avatar dari `avatar_url` jika ada, fallback ke inisial

---

## 8. LAPORAN (app/dashboard/laporan/page.tsx)

- Stats: grid 4 kolom, border-right antar card
- Bar chart: bar aktif (nilai tertinggi) #1C5C38, bar lain #D1FAE5
- Info card: bg #1C5C38, text white
- Progress bar: fill #1C5C38, track #E5E7EB, height 6px, border-radius 9999px
- Export PDF: `window.print()` dengan CSS `@media print` yang rapi
- Animasi chart: bar tumbuh dari bawah ke atas saat mount (Recharts `isAnimationActive={true}`)

---

## 9. FORM PENDAFTARAN (app/pendaftaran/page.tsx)

- Stepper circle active: bg #1C5C38, box-shadow 0 0 0 4px #EBF4EE
- Stepper line done: background #1C5C38
- Tombol Lanjut/Submit: bg #1C5C38, hover #2A7A4E, border-radius 10px
- Input focus: border #1C5C38
- Upload area hover: border #1C5C38, bg #F2F8F4
- Animasi transisi antar tahap: `slideInRight 0.3s ease` saat pindah tahap
- Progress indicator: "Tahap X dari 5" di bawah stepper

---

## 10. HASIL SELEKSI (app/hasil-seleksi/page.tsx)

- Input NISN: focus border #1C5C38
- Tombol Cek: bg #1C5C38
- Card hasil: animasi `fadeUp 0.4s ease` saat muncul
- Status diterima: bg #D1FAE5, color #065F46
- Status ditolak: bg #FEE2E2, color #991B1B
- Status menunggu: bg #FEF3C7, color #92400E

---

## 11. FOOTER (SEMUA HALAMAN PUBLIC)

Tambahkan footer di: `app/page.tsx`, `app/pendaftaran/layout.tsx`, `app/hasil-seleksi/page.tsx`

**Design footer (dari Figma):**
```
bg: #0C1A10 (hitam kehijauan)
padding: 60px 80px 32px

Grid 4 kolom:
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ SMK Citra Negara│ EXPLORE      │ RESOURCES    │ KONTAK       │
│ tagline...      │ Jurusan      │ Daftar Guru  │ ✉ email      │
│ email           │ Daftar       │ Jadwal       │ 📞 telp      │
│ [social icons]  │ Prestasi     │ Video        │ 📍 alamat    │
│                 │ Berita       │ Foto         │              │
└─────────────────┴──────────────┴──────────────┴──────────────┘
─────────────────────────────────────────────────────────────────
© 2026 SMK Citra Negara. All rights reserved    Kebijakan Privasi
```

Detail:
- Logo: "SMK **Citra Negara**" (bold hijau #1C5C38 untuk "Citra Negara")
- Tagline: "Pilihan Yang Tepat Di Sekolah Yang M.A.N.T.A.P" — 13px/rgba(255,255,255,0.5)
- Email: hello@smkdigital.sch.id
- Telp: (021) 77201052
- Alamat: Jl. Raya Tanah Baru No.99 Beji, Depok 16421
- Column title: 11px/700/rgba(255,255,255,0.4), uppercase, letter-spacing 0.08em
- Links: 13px/rgba(255,255,255,0.5), hover: white, transition 0.2s
- Social icons: Lucide `Globe`, `Instagram`, `Youtube` — 20px, color rgba(255,255,255,0.5)
- Divider: border-top 1px solid rgba(255,255,255,0.08)
- Bottom: 12px/rgba(255,255,255,0.25), flex space-between

Buat component `components/landing/footer.tsx` dan import di mana diperlukan.

---

## 12. RESPONSIF — BREAKPOINTS

```
Mobile:  < 640px
Tablet:  640px – 1024px
Desktop: > 1024px
```

### Dashboard (layout.tsx):
- **Mobile**: sidebar hidden by default, hamburger button di topbar kiri, overlay sidebar saat dibuka, content `margin-left: 0`
- **Tablet**: sidebar bisa collapsed jadi icon-only (width 60px), hover expand
- **Desktop**: sidebar full 180px

### Landing Page (page.tsx):
- **Mobile**: hero 1 kolom, CTA buttons stack vertikal, nav links hidden (hamburger)
- **Tablet**: grid 2 kolom untuk jurusan
- **Desktop**: semua full layout

### Form Pendaftaran:
- **Mobile**: form-row-4 → 2 kolom, form-row → 1 kolom, upload-grid → 1 kolom
- **Tablet**: form-row → 2 kolom
- **Desktop**: form-row-4 tetap 4 kolom

### Footer:
- **Mobile**: 1 kolom, center-aligned
- **Tablet**: 2 kolom
- **Desktop**: 4 kolom

### CSS Utilities untuk responsif (tambah ke globals.css):
```css
@media (max-width: 640px) {
  .hide-mobile { display: none !important; }
  .stack-mobile { flex-direction: column !important; }
  .full-mobile { width: 100% !important; }
}
@media (max-width: 1024px) {
  .hide-tablet { display: none !important; }
}
```

---

## 13. SKELETON LOADING

Untuk semua halaman yang fetch data, tambahkan skeleton loader:

```tsx
// Skeleton card component
function SkeletonCard() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #F2F8F4 25%, #EBF4EE 50%, #F2F8F4 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px',
      height: '100px'
    }} />
  )
}
```

Gunakan di: dashboard beranda (4 stat cards), users page (grid cards), history page (table rows).

---

## 14. MICRO-INTERACTIONS

Tambahkan ke semua interactive elements:

```css
/* Button press effect */
button:active { transform: scale(0.97); }

/* Card hover */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(28, 92, 56, 0.1);
}

/* Input focus ripple */
input:focus, select:focus, textarea:focus {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  border-color: #1C5C38;
  box-shadow: 0 0 0 3px rgba(28, 92, 56, 0.08);
}

/* Link underline animation */
a.animated-link {
  position: relative;
}
a.animated-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 1.5px;
  background: #1C5C38;
  transition: width 0.25s ease;
}
a.animated-link:hover::after { width: 100%; }

/* Toast notification */
.toast-enter { animation: slideInRight 0.3s ease; }
.toast-exit  { animation: fadeOut 0.3s ease forwards; }
@keyframes fadeOut {
  to { opacity: 0; transform: translateX(20px); }
}
```

---

## 15. CHECKLIST AKHIR

Sebelum selesai, verifikasi:
- [ ] Tidak ada teks "admin@spmb.com" atau password demo di manapun
- [ ] Tidak ada warna coklat (#8B6B52 atau --warm-brown)
- [ ] Tidak ada font Playfair Display
- [ ] Sidebar fixed dan tidak ikut scroll
- [ ] Topbar fixed dan tidak ikut scroll
- [ ] Content tidak tertutup sidebar/topbar (margin & padding benar)
- [ ] Semua tombol CTA warna #1C5C38
- [ ] Badge BERHASIL: #D1FAE5/#065F46, badge GAGAL: #FEE2E2/#991B1B
- [ ] Mobile: hamburger menu berfungsi, sidebar overlay
- [ ] Animasi scroll: kanan-ke-kiri saat scroll bawah, kiri-ke-kanan saat scroll atas
- [ ] Footer muncul di semua halaman public
- [ ] Skeleton loading untuk semua halaman dengan async data
- [ ] Form pendaftaran: semua 5 tahap berfungsi dengan styling hijau
