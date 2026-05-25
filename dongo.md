Tolong buatkan prompt untuk stitch, untuk bagian halaman-per-halaman. Dari Landing Page, Users, Admin, dan Amenities lainnya. Tambahin grafik juga.

Tentu, ini adalah draf system prompt atau instruksi terstruktur yang bisa kamu gunakan untuk memandu AI (seperti Claude Code, v0, atau bolt.new) dalam membuat atau menyusun komponen halaman demi halaman menggunakan Stitch (atau jika yang kamu maksud adalah menjahit/menggabungkan arsitektur frontend Next.js/Tailwind).

Prompt ini dirancang dengan gaya dark premium & minimalist agar hasil visualnya langsung konsisten di seluruh modul.

Perintah/Prompt untuk AI:
Plaintext
Bertindaklah sebagai Senior Frontend Engineer dan UI/UX Designer spesialis tema "Dark Premium Minimalist". Saya ingin membuat rancangan halaman-per-halaman untuk aplikasi saya menggunakan arsitektur modular/stitch. Gunakan kombinasi warna latar belakang super-dark (charcoal/matte black), teks putih/abu-abu terang, dan aksen emas tipis (#D4AF37 atau serupa) hanya untuk elemen interaktif penting.

Gunakan komponen UI yang modern, clean, dan scannable. Tolong buatkan kode/struktur komponen halaman-per-halaman dengan detail berikut:

---

### 1. LANDING PAGE (Public View)
- Hero Section: Tipografi besar yang tegas, sub-headline minimalis, dan Call to Action (CTA) button dengan aksen border emas tipis. Tanpa grid yang berantakan, manfaatkan whitespace yang lega.
- Features Section: Grid minimalis (tanpa background card yang mencolok, cukup border tipis) untuk menampilkan keunggulan utama.
- Footer: Navigasi clean, copyright, dan tautan sosial media dalam format low-opacity text.

### 2. USERS DASHBOARD (Client/Member Area)
- Sidebar/Navbar: Navigasi minimalis dengan ikon line-art (no-fill).
- Main Layout: Ringkasan akun pengguna, status aktivitas, dan akses cepat ke fitur utama.
- Amenities Booking/Access: Antarmuka bersih untuk melihat layanan atau fasilitas yang tersedia bagi user, lengkap dengan indikator status (Aktif/Pending) yang elegan.

### 3. ADMIN PANEL (Management Console)
- Data Tables: Desain tabel data (Users list, Amenities log) yang bersih. Baris tabel dipisahkan oleh garis tipis (border-b), lengkap dengan fitur filter dan search bar minimalis di bagian atas.
- Management Controls: Tombol aksi yang presisi (Edit, Suspend, Approve) dengan skema warna yang tidak merusak estetika gelap (gunakan variasi opasitas, bukan warna cerah yang mencolok).

### 4. AMENITIES & ANALYTICS SECTION (Dengan Grafik)
- Urus visualisasi data fasilitas (Amenities) yang sering digunakan menggunakan grafik modern.
- Tolong sertakan visualisasi grafik (bisa menggunakan library seperti Recharts/Chart.js dengan styling kustom):
  * Line Chart atau Area Chart untuk tren penggunaan amenities mingguan (Gunakan garis grafik berwarna emas dengan gradasi memudar ke bawah/area fill low-opacity).
  * Bar Chart minimalis untuk perbandingan popularitas antar fasilitas.
- Berikan efek grid lines pada grafik yang sangat samar (subtle) agar tetap menyatu dengan latar belakang gelap.

---

Ketentuan Teknis:
- Gunakan Next.js, Tailwind CSS, dan Lucide Icons (atau ikon minimalis sejenis).
- Pastikan semua komponen bersifat modular agar mudah di-stitch (digabungkan) ke dalam layout utama.
- Berikan kode yang bersih, scannable, dan langsung siap pakai untuk masing-masing halaman di atas.
Tips Tambahan saat Eksekusi:
Jika kamu memasukkan prompt ini ke AI pembuat kode, kamu bisa meminta AI-nya mengeksekusi satu per satu halaman (misal: "Eksekusi poin 1 dulu, tampilkan kodenya"), agar hasilnya jauh lebih detail dan tidak terpotong di tengah jalan karena batas limit karakter.

Sorry, lupa gambarnya. In:

Ah, paham! Jadi ini untuk sistem SPMB (Sistem Penerimaan Murid Baru) berdasarkan coretan di papan tulis itu. Konteksnya jauh lebih jelas sekarang. Di papan tulis terbagi menjadi SPMB (Landing & Form), DB Spmb (Database/Tabel), dan Admin (Verval & Laporan).

Berikut adalah penyesuaian prompt modular (stitch) yang jauh lebih akurat dan sesuai dengan kebutuhan sistem SPMB di foto tersebut:

Perintah/Prompt untuk AI (Sesuai Foto Papan Tulis):
Plaintext
Bertindaklah sebagai Senior Frontend Engineer dan UI/UX Designer. Saya sedang membangun aplikasi "Sistem Penerimaan Murid Baru (SPMB)" berbasis web. Tolong buatkan prompt atau struktur komponen halaman-per-halaman yang modular agar mudah di-stitch (digabungkan) menggunakan Next.js dan Tailwind CSS. 

Gunakan desain yang bersih, modern, profesional, dan scannable dengan detail struktur halaman sebagai berikut:

---

### 1. LANDING PAGE / COMPANY PROFILE (Public View)
- Hero Section: Selamat datang di portal SPMB, visi-misi singkat sekolah, dan tombol CTA utama "Daftar Sekarang" yang mengarah ke Form Pendaftaran.
- Info Alur Pendaftaran: Infografis atau langkah-langkah ringkas alur pendaftaran dari isi form, verifikasi, hingga pengumuman.

### 2. FORM PENDAFTARAN (Modul Calon Siswa / Casis)
Buat tata letak form yang rapi (bisa dibagi per kategori/step agar tidak terlalu panjang) untuk menangkap 14 data berikut:
1. Nama Lengkap
2. Nama Panggilan
3. TTL (Tempat, Tanggal Lahir)
4. Jenis Kelamin
5. Alamat
6. Agama
7. Nama Orang Tua (Ortu)
8. No. HP Ortu
9. No. HP Pribadi
10. Jurusan (Pilihan Jurusan)
11. Asal Sekolah
12. NISN
13. NIK
14. Upload Berkas (Form upload file dokumen pendukung)

### 3. ADMIN PANEL - MANAGEMENT CONSOLE
Halaman khusus admin yang memiliki fungsi utama:
- Dashboard Analytics: Grafik/Chart modern untuk memantau data pendaftaran:
  * Line/Area Chart untuk melihat tren jumlah pendaftar harian/mingguan.
  * Bar Chart atau Pie Chart untuk melihat sebaran pendaftar berdasarkan "Pilihan Jurusan" dan "Asal Sekolah".
- Fitur Utama Admin:
  1. Melihat Data Pendaftar Masuk
  2. Verval (Verifikasi Validasi) berkas dan status pendaftaran.
  3. Generate Laporan (Tombol eksport data).

### 4. DATA TABLES (Database Grid View)
Komponen tabel data pendaftar untuk Admin yang bersih dan terstruktur, dengan kolom-kolom:
- No | NISN | Nama Siswa | JK (Jenis Kelamin) | Asal Sekolah | Jurusan | Status Verval | Aksi (Detail/Verifikasi)
- Lengkap dengan fitur search bar, filter berdasarkan Jurusan/Status, dan pagination.

---

Ketentuan Teknis:
- Gunakan Tailwind CSS untuk styling dan Lucide Icons untuk ikon yang minimalis.
- Untuk grafik di dashboard admin, gunakan library Recharts atau Chart.js dengan tema warna yang senada (clean & profesional).
- Buat kode yang modular dan reusable (komponen terpisah antara Form input, Table rows, dan Chart) agar mudah dijahit (stitch) ke dalam layout utama.
Catatan Tambahan:
Sengaja saya masukkan poin Jurusan dan Status Verval ke bagian tabel pendaftar agar data yang ditampilkan admin bisa lebih informatif saat mereka melakukan proses Verifikasi Validasi (Verval). Kamu tinggal copy-paste prompt di atas ke AI generator pilihanmu!

Pembayaran, dan pake contoh dari ss-an ini

Baik, paham! Berdasarkan screenshot yang kamu kirim, sistem SPMB ini menggunakan penamaan arsitektur halaman dengan tema spesifik: "Futuristic Emerald" dan "Futuristic Tech Exhibition Style". Di sana juga terlihat penambahan modul krusial seperti Payment Portal, Payment Verification, Major Selection, dan Document Verification.

Berikut adalah rancangan mega-prompt terstruktur dan lengkap yang sudah disesuaikan dengan daftar halaman (Layers) pada gambar tersebut, lengkap dengan modul Pembayaran (Payment) dan Visualisasi Grafik Emerald Neon:

Perintah / Prompt Master untuk AI (Tinggal Copy-Paste):
Plaintext
Bertindaklah sebagai Senior Frontend Developer dan UI/UX Architect. Saya ingin membuat kode komponen halaman-per-halaman yang modular dan siap di-stitch (digabungkan) untuk sistem SPMB (Sistem Penerimaan Murid Baru). 

Gunakan tema visual sesuai blueprint saya: "Futuristic Emerald & Futuristic Tech Exhibition Style".
- Background: Super-dark/Slate-black deep (#0B0F19 atau #0D1117).
- Aksen Utama: Hijau Zamrud Neon / Emerald Glow (#10B981, #34D399, #059669) untuk elemen interaktif, borders, efek glassmorphism, dan indikator aktif.
- Tipografi & Ikon: Bersih, tajam, menggunakan Lucide Icons (garis tipis/no-fill).

Tolong buatkan susunan struktur kode modular halaman-per-halaman berikut:

---

### PART 1: PUBLIC & STUDENT CORE PORTAL

1. LANDING PAGE (Futuristic Tech Exhibition Style)
   - Hero Section: Tipografi masif dengan efek text-gradient emerald glow, sub-headline cyber-style, dan CTA "Mulai Pendaftaran" & "Portal Biaya".
   - Exhibition Grid: Tampilan info pendaftaran, fasilitas kampus, dan info jurusan yang dikemas dalam bentuk card semi-transparan (glassmorphism) dengan border emerald tipis.
   - Auth Entry: Akses cepat ke komponen Login, Register, dan Forgot Password (Futuristic Emerald Style) dengan input field minimalis berpendar hijau saat fokus.

2. STUDENT DASHBOARD - OVERVIEW (Futuristic)
   - Layout utama dashboard calon siswa (Casis) dengan panel status step-by-step pendaftaran (Berhasil Register -> Isi Profil -> Upload Berkas -> Pembayaran -> Hasil).
   - Profil Saya & Major Selection: Form pemilihan Program Studi/Jurusan primer dan sekunder, dilengkapi input data personal (14 data pokok dari berkas fisik).
   - Document Upload: Komponen dropzone interaktif (drag-and-drop) untuk upload berkas (ijazah, KK, foto) dengan loading bar neon hijau.

3. PAYMENT PORTAL (Futuristic Emerald)
   - Invoice Generator: Menampilkan rincian biaya pendaftaran secara transparan.
   - Metode Pembayaran: Pilihan opsi (Virtual Account, E-Wallet, Bank Transfer).
   - Upload Bukti Bayar: Komponen input resi dan upload file bukti transaksi dengan penanda status "Menunggu Verifikasi Admin".

---

### PART 2: ADMIN PANEL & ANALSIS MANAGEMENT (Futuristic Emerald)

4. ADMIN APPLICANT MANAGEMENT & STATS
   - Admin Profile Header: Panel monitoring status admin.
   - Data Table Utama: Grid list pendaftar masuk dengan kolom [No | Nomor Daftar | Nama Siswa | JK | Asal Sekolah | Pilihan Jurusan | Status Verifikasi | Aksi].
   - Tombol Kontrol: Tombol aksi cepat untuk melakukan "Document Verification" dan "Payment Verification" (Aprove / Reject / Suspend) dengan feedback visual yang rapi.

5. DASHBOARD ANALYTICS (Admin Statistics - Dengan Grafik)
   - Sediakan visualisasi data menggunakan library chart modern (seperti Recharts atau Chart.js) dengan styling gelap & neon emerald:
     * Line / Area Chart: Menampilkan tren akumulasi "Pendaftaran Baru" berbanding "Pembayaran Terverifikasi" dari Minggu 1 hingga Minggu 5. Berikan efek gradasi warna hijau memudar pada area chart fill.
     * Horizontal Bar Chart: Menampilkan visualisasi tingkat popularitas pilihan jurusan (Major Selection) tertinggi untuk mempermudah alokasi kuota kelas.
     * Grid & Label: Buat garis grid sangat tipis/samar agar menyatu dengan background gelap, teks label menggunakan abu-abu terang (#94A3B8).

6. RESULTS & ANNOUNCEMENTS (Halaman Hasil & Pengumuman)
   - Komponen halaman publik/admin untuk menerbitkan hasil seleksi kelulusan pendaftar berdasarkan jalur masuk, lengkap dengan tombol cetak kartu tanda lulus.

---

Ketentuan Output Kode:
- Gunakan framework Next.js (React) dan Tailwind CSS.
- Tuliskan kode yang clean, scannable, dan buat pemisahan komponen (misal: `<ChartSection />`, `<PaymentForm />`, `<DataTable />`) agar proses stitching (penggabungan halaman) berjalan lancar tanpa bentrok style.
Preview Hasil Visualisasi Grafik (Admin Statistics - Futuristic Emerald):
Berikut adalah contoh output visualisasi grafik yang akan dihasilkan oleh AI ketika memproses bagian Admin Statistics & Analytics di atas untuk memantau data pendaftar dan transaksi pembayaran:

https://lh3.googleusercontent.com/gg/AEir0wJKwvwjhJHh5r_yxX72oZWTQc7MAyFl8xZdG2uCrrAzCCPYiPEMPjDe8VRTWGrPUvmNySLyLWzd0q1ZtjrvlVACgDfPuheba4uSNPN0Wry5A7NwvY-k8MUsk1Mei_-5eM9mqEYxsZB3_UqWsL5661nOYL8C5UUgHcXXcAch3VNfKe_KHMllA3Kx38_Lx-qMfZROjF1XsctoLPzr5kzwP2rOLIRYhKus11bBMJuEPCi6XQuCuABmypbNCC_Nz6kOBqS7kksiyTMH1wsOp3GtSdWezvSrF9hX1NG0Hnk-ewfEY1kmIKUhDn0IkdoLsuM8Z7iHahwc0isXrHWMU7W6f4A=s1600

Tips Tambahan saat Inject ke AI:
Karena halaman yang diminta dari screenshot cukup banyak (Login, Register, Forgot Password, Dashboard, Major Selection, Payment Portal, Document Upload, Profil, Admin Management, Verval Dokumen, Verval Bayar, Pengumuman), instruksikan AI generator kamu untuk fokus membuat Layout Kerangka Dasarnya (Stitch Wrapper) terlebih dahulu, baru kemudian minta ia mengisi detail fungsional per komponennya agar memori token AI tidak habis di tengah jalan.

Oh iya, bagian: "Futuristic Emerald" dan "Futuristic Tech Exhibition Style", itu dihilangkan aja. Soalnya aku beda konteks warna.

Siap, paham! Konsep futuristik dan warna hijaunya kita eliminasi total agar sifatnya menjadi warna netral (color-agnostic). Dengan begitu, kamu bisa dengan mudah menyuntikkan sendiri variabel warna (primary, secondary, background) sesuai dengan panduan warna (brand guidelines) atau konteks aplikasi baru yang sedang kamu bangun.

Berikut adalah revisi master prompt yang bersih dari tema warna spesifik, namun tetap menjaga kerapian struktur halaman per halaman sesuai dengan layers di screenshot kamu:

Perintah / Prompt Master (Netral & Siap Pakai):
Plaintext
Bertindaklah sebagai Senior Frontend Developer dan UI/UX Architect. Saya ingin membuat kode komponen halaman-per-halaman yang modular, bersih, dan siap di-stitch (digabungkan) untuk sistem SPMB (Sistem Penerimaan Murid Baru). 

Ketentuan Desain & Antarmuka:
- Desain: Modern, clean, minimalis, dan highly scannable dengan whitespace yang proporsional.
- Skema Warna: Buat dalam mode warna netral (gunakan paduan warna abu-abu/slate standar dari Tailwind, seperti bg-slate-900 atau bg-white untuk base). Hindari penggunaan warna spesifik yang mencolok agar saya bisa dengan mudah mengganti tema warnanya nanti melalui konfigurasi Tailwind (misal memanfaatkan class 'primary', 'secondary').
- Tipografi & Ikon: Menggunakan font sans-serif yang bersih dan Lucide Icons (line-art style).

Tolong buatkan susunan struktur kode modular halaman-per-halaman berikut:

---

### PART 1: PUBLIC & STUDENT CORE PORTAL

1. LANDING PAGE
   - Hero Section: Judul utama portal SPMB yang informatif, sub-headline, dan tombol CTA utama ("Daftar Sekarang") & ("Lihat Biaya").
   - Info Section: Grid minimalis untuk menampilkan info alur pendaftaran dan daftar program studi/jurusan.
   - Auth Entry Pages: Struktur halaman komponen untuk Login, Register, dan Forgot Password dengan layout card yang bersih dan input field yang memiliki state focus rapi.

2. STUDENT DASHBOARD - OVERVIEW
   - Layout Utama: Sediakan sidebar/navbar navigasi dan panel utama yang menunjukkan indikator perkembangan (progress tracker) tahapan pendaftaran siswa (Isi Profil -> Pilih Jurusan -> Berkas -> Pembayaran).
   - Profil Saya & Major Selection: Form input data calon siswa (mencakup data personal dasar, NISN, NIK, asal sekolah) dan menu drop-down/radio button untuk pemilihan jurusan pilihan utama dan cadangan.
   - Document Upload: Komponen dropzone untuk upload file berkas pendukung (ijazah, KK, dll) lengkap dengan indikator status file yang terunggah.

3. PAYMENT PORTAL
   - Rincian Biaya: Tampilan komponen invoice/tagihan biaya pendaftaran secara terstruktur.
   - Metode Pembayaran: List opsi instruksi pembayaran (transfer bank, e-wallet, dll).
   - Bukti Bayar: Form ringkas untuk menginput nomor resi/referensi transaksi serta mengunggah foto/pdf bukti pembayaran.

---

### PART 2: ADMIN PANEL & DATA MANAGEMENT

4. ADMIN APPLICANT MANAGEMENT
   - Admin Layout: Halaman dashboard khusus admin dengan navigasi terpisah (Admin Profile & Settings).
   - Data Table Utama: Komponen tabel pendaftar masuk dengan kolom [No | Nomor Daftar | Nama Siswa | JK | Asal Sekolah | Pilihan Jurusan | Status Verifikasi | Aksi]. Lengkap dengan fitur filter status dan pencarian.
   - Modul Verifikasi: Komponen modal atau halaman khusus untuk "Document Verification" dan "Payment Verification" untuk memudahkan admin mengubah status menjadi (Approved / Rejected / Pending).

5. ADMIN STATISTICS (Halaman Analisis & Grafik)
   - Sediakan visualisasi data menggunakan chart library (seperti Recharts atau Chart.js) dengan styling bersih dan minimalis:
     * Line / Area Chart: Menampilkan tren pertumbuhan jumlah pendaftar baru dari minggu ke minggu.
     * Bar Chart: Menampilkan perbandingan jumlah pendaftar di setiap pilihan jurusan (Major Selection) untuk analisis kuota pendaftaran.
   - Buat warna garis dan batang grafik menggunakan warna default tailwind yang mudah dikustomisasi (misal warna biru langit atau abu-abu netral).

6. RESULTS & ANNOUNCEMENTS
   - Halaman publik atau halaman siswa untuk mengecek pengumuman kelulusan/hasil seleksi akhir, lengkap dengan template komponen cetak surat kelulusan jika dinyatakan lolos.

---

Ketentuan Output Kode:
- Gunakan Next.js (React) dan Tailwind CSS.
- Tuliskan kode yang clean, scannable, dan pisahkan komponen-komponennya secara modular (misal: `<ChartSection />`, `<PaymentForm />`, `<DataTable />`) agar proses stitching (penggabungan halaman) berjalan lancar tanpa bentrok style.
Sekarang prompt di atas sudah sepenuhnya netral. Jadi ketika dimasukkan ke AI pembuat kode, hasilnya akan berupa desain base template bersih yang siap kamu siram dengan tema warna apa saja sesuai kebutuhan proyekmu saat ini.

Oh iya, karena sekolah aku ada 6 jurusan (TKJ, PPLG, MPLB, PM, DKV, Perhotelan), dan ada foto 6 model setiap jurusan, foto promonya, dan ada tanda panah di langkah-langkah pendaftarannya, tambahin di promptnya dong.



Oh iya, tolong tambahin step-by-step input promptnya ya, kaya... Yang ini harus masuk duluan, baru yang ini setelahnya, dan seterusnya. Biar selaras dan outputnya banyak, gak cuma 4

Siap, ini penyesuaian yang sangat bagus. Dengan membagi proses penginputan menjadi beberapa tahap (step-by-step), AI pembuat kode tidak akan mengalami token limit (terpotong di tengah jalan) dan hasil kode per halamannya akan menjadi sangat panjang, detail, dan langsung siap pakai.

Di bawah ini adalah panduan urutan input (Step-by-Step Input Plan) beserta Prompt spesifik yang sudah disisipi detail 6 jurusan, foto model/promo, dan elemen tanda panah ikonik untuk alur pendaftaran.

🛠️ STRATEGI INPUT (Step-by-Step Input Plan)
Jangan masukkan semua halaman sekaligus. Ikuti urutan ini ke AI kamu (v0, Claude Code, bolt.new, atau ChatGPT):

Tahap 1: Bangun pondasi global (Layout Utama & Konfigurasi Warna).

Tahap 2: Buat Landing Page (Tempat promosi 6 jurusan & alur tanda panah).

Tahap 3: Buat Alur Dashboard Siswa (Registrasi, Isi Profil, Major Selection, Upload Berkas).

Tahap 4: Buat Modul Pembayaran Siswa (Invoice & Bukti Bayar).

Tahap 5: Buat Modul Admin & Tabel Data (Verval Berkas & Verval Bayar).

Tahap 6: Buat Dashboard Statistik Admin (Grafik Tren & Bar Chart 6 Jurusan).

📝 DAFTAR PROMPT MODULAR (Tinggal Copas Per Tahap)
TAHAP 1: Base Layout & Konfigurasi Global
Copy-paste prompt ini pertama kali:

Plaintext
Bertindaklah sebagai Senior Frontend Developer. Saya ingin membuat aplikasi SPMB (Sistem Penerimaan Murid Baru) menggunakan Next.js dan Tailwind CSS. Konsep visual aplikasi ini adalah Clean, Modern, Minimalis, dan Global Color-Agnostic (Gunakan warna netral standar Tailwind seperti Slate/Gray untuk background, agar nanti warna primary/secondary bisa saya ubah dengan mudah lewat tailwind.config).

Sebagai langkah awal, buatkan struktur file global, layout wrapper utama (Navbar & Footer netral), serta state management sederhana untuk mensimulasikan perpindahan halaman (stitching) antar modul nantinya. Pastikan kodenya clean dan scannable.
TAHAP 2: Landing Page (Public View)
Copy-paste prompt ini setelah Tahap 1 selesai:

Plaintext
Sekarang, buatkan komponen <LandingPage /> yang modular untuk view publik. Komponen ini wajib memiliki section berikut:

1. Hero Section: Headline tegas pendaftaran sekolah, sub-headline, dan tombol CTA "Daftar Sekarang".
2. Langkah Pendaftaran Section: Tampilkan alur pendaftaran step-by-step yang dihubungkan secara visual menggunakan ikon tanda panah (arrow) yang responsif dan elegan di antara setiap langkahnya.
3. Jurusan Showcase Section: Grid yang menampilkan 6 Jurusan secara spesifik:
   - TKJ (Teknik Komputer & Jaringan)
   - PPLG (Pengembangan Perangkat Lunak & Gim)
   - MPLB (Manajemen Perkantoran & Layanan Bisnis)
   - PM (Pemasaran)
   - DKV (Desain Komunikasi Visual)
   - Perhotelan
   Setiap jurusan harus memiliki placeholder untuk 2 aset gambar: "Foto Model Jurusan" (representasi siswa/seragam) dan "Foto Promo Jurusan" (kegiatan/fasilitas), dilengkapi deskripsi singkat profil jurusan tersebut.
TAHAP 3: Student Dashboard & Form Input (Casis Area)
Copy-paste prompt ini setelah Tahap 2 selesai:

Plaintext
Selanjutnya, buatkan komponen <StudentDashboard /> yang merupakan halaman setelah Calon Siswa (Casis) berhasil Login/Register. Komponen ini harus memiliki:

1. Progress Tracker: Bar penanda langkah yang sedang aktif (Profil -> Jurusan -> Berkas -> Bayar).
2. Form Profil Saya: Input field yang sangat detail untuk menangkap data pokok (Nama Lengkap, Nama Panggilan, TTL, Jenis Kelamin, Alamat, Agama, Nama Ortu, No HP Ortu, No HP Pribadi, Asal Sekolah, NISN, NIK).
3. Major Selection Modul: Form dropdown/pilihan radio button yang menampilkan 6 jurusan tadi (TKJ, PPLG, MPLB, PM, DKV, Perhotelan) untuk dipilih sebagai Pilihan 1 dan Pilihan 2.
4. Document Upload Modul: Area drag-and-drop file untuk mengunggah berkas persyaratan (Ijazah, KK, Akta) dengan indikator status upload.
TAHAP 4: Payment Portal (Modul Pembayaran Siswa)
Copy-paste prompt ini setelah Tahap 3 selesai:

Plaintext
Sekarang buatkan komponen <PaymentPortal /> untuk bagian akhir dari alur siswa. Komponen ini mencakup:

1. Invoice Component: Menampilkan rincian biaya pendaftaran, nomor tagihan, dan batas waktu pembayaran dengan rapi.
2. Payment Method: Pilihan instruksi pembayaran (seperti Transfer Bank, Virtual Account, atau E-Wallet).
3. Proof of Payment Upload: Form untuk mengisi nomor referensi/resi transfer dan tombol upload file bukti pembayaran fisik (foto/pdf) untuk dikirim ke admin.
TAHAP 5: Admin Panel & Data Tables (Verval System)
Copy-paste prompt ini setelah Tahap 4 selesai:

Plaintext
Sekarang beralih ke sisi manajemen. Buat komponen <AdminManagement /> untuk tampilan dashboard panel admin:

1. Data Table Utama: Menampilkan daftar seluruh calon siswa yang masuk. Kolom tabel wajib berisi: [No | Nomor Daftar | Nama Siswa | JK | Asal Sekolah | Pilihan Jurusan | Status Verifikasi | Aksi]. Sediakan search bar dan filter dropdown.
2. Document Verification Module: Komponen UI (bisa berupa modal/split-view) untuk admin memeriksa berkas siswa lalu menekan tombol "Approve" atau "Reject".
3. Payment Verification Module: Komponen UI bagi admin untuk mencocokkan bukti transfer yang diunggah siswa dengan mutasi keuangan, lalu mengubah status pembayaran menjadi "Verified".
TAHAP 6: Admin Statistics & Analytics (Grafik 6 Jurusan)
Copy-paste prompt ini terakhir:

Plaintext
Terakhir, buat komponen <AdminStatistics /> yang berisi visualisasi data grafis menggunakan library Recharts atau Chart.js dengan tema warna minimalis netral:

1. Line/Area Chart: Menampilkan tren grafik jumlah pendaftar harian/mingguan yang masuk ke sistem.
2. Bar Chart (Data 6 Jurusan): Grafik batang yang membandingkan total jumlah pendaftar di 6 jurusan sekolah secara real-time (TKJ vs PPLG vs MPLB vs PM vs DKV vs Perhotelan). Grafik ini berfungsi membantu admin menganalisis jurusan mana yang paling diminati atau kuotanya hampir penuh.
3. Export Report Button: Tombol untuk men-generate laporan akhir data pendaftaran ke format dokumen.
Kenapa Strategi Ini Lebih Bagus?
Dengan membaginya seperti ini, kamu memaksa AI untuk fokus memikirkan elemen detail per halaman (seperti menata letak tanda panah agar tidak rusak di layar HP, atau menyusun tata letak grafik 6 jurusan). Hasilnya akan jauh lebih bersih, terstruktur, dan tidak ada bagian kode yang "disingkat" oleh AI-nya.

Oh iya, tolong buatin DESIGN.md nya untuk color palette nya. Cara cari color palettenya di web mana ya?

Untuk mencari color palette (palet warna) yang profesional, modern, dan mudah disesuaikan, berikut adalah beberapa rekomendasi website terbaik yang sering digunakan oleh para UI/UX Designer:

Coolors.co – Sangat populer. Kamu bisa menghasilkan palet warna secara acak hanya dengan menekan tombol spacebar, atau menjelajahi ribuan palet warna buatan komunitas yang sedang tren.

Realtime Colors (realtimecolors.com) – Ini sangat direkomendasikan untuk web developer. Kamu bisa langsung menguji palet warna pilihanmu ke dalam mockup elemen website asli (Navbar, Button, Card) secara real-time sebelum menyalin kodenya.

Color Hunt (colorhunt.co) – Menyediakan kurasi palet warna yang simpel dan dikelompokkan berdasarkan estetikanya (seperti Minimalist, Neon, Pastel, Retro, dll).

Muzli Colors (colors.muzli.com) – Sangat bagus jika kamu sudah punya satu warna dasar dan ingin mencari kombinasi warna pendukung yang otomatis terlihat cocok dan harmonis.

Berikut adalah draf file DESIGN.md dengan format warna netral/fleksibel (menggunakan token variabel). Kamu cukup mengganti kode HEX (#XXXXXX) di bawah ini setelah menemukan warna yang cocok dari web di atas.

DESIGN.md
Markdown
# 🎨 Dokumentasi Panduan Desain & Palet Warna (SPMB App)

Dokumen ini berfungsi sebagai acuan standar visual untuk pengembangan frontend aplikasi Sistem Penerimaan Murid Baru (SPMB). Semua komponen yang di-stitch wajib mematuhi token warna dan hierarki di bawah ini agar antarmuka tetap konsisten.

---

## 🔑 Sistem Palet Warna (Color Palette Tokens)

Ganti nilai kode HEX di bawah ini sesuai dengan tema brand sekolah yang ditentukan.

| Token Nama | Kode HEX (Contoh) | Deskripsi Penggunaan |
| :--- | :--- | :--- |
| `--color-bg-main` | `#0F172A` (Slate 900) | Latar belakang utama aplikasi (Base Background) |
| `--color-bg-surface`| `#1E293B` (Slate 800) | Latar belakang untuk Card, Modal, Sidebar, dan Form |
| `--color-primary` | `#3B82F6` (Blue 500) | Warna utama untuk CTA Button, Link Aktif, dan Akses Fokus |
| `--color-secondary` | `#64748B` (Slate 500) | Warna sekunder untuk elemen pendukung / batas border |
| `--color-text-main` | `#F8FAFC` (Slate 50) | Warna teks utama (Judul, Headline, Angka Grafik) |
| `--color-text-muted`| `#94A3B8` (Slate 400) | Warna teks sekunder (Sub-headline, Label Form, Keterangan) |
| `--color-success` | `#10B981` (Emerald 500)| Indikator status sukses, berkas lolos, atau pembayaran diverifikasi |
| `--color-danger` | `#EF4444` (Red 500) | Indikator status gagal, berkas ditolak, atau tombol hapus |

---

## 📐 Tata Letak & Elemen Spesifik (UI/UX Blueprint)

### 1. Sistem Tipografi & Kontras Teks
* **Aksen Utama:** Teks judul pada *Hero Section* Landing Page wajib menggunakan `--color-text-main` dengan ukuran font yang tebal dan tegas (`font-bold`).
* **Keterangan & Label:** Gunakan `--color-text-muted` untuk label form pendaftaran 14 data pokok dan legenda pada grafik admin, guna menjaga kenyamanan mata pengguna (*scannability*).

### 2. Alur Pendaftaran (Langkah-Langkah Berpanah)
* **Warna Jalur:** Garis alur dan tanda panah penghubung antar langkah menggunakan warna `--color-secondary` dengan opasitas rendah (misal `opacity-40`).
* **State Aktif:** Ketika calon siswa berada di tahap tertentu (misal: Tahap Pembayaran), tanda panah sebelum dan sesudah tahapan tersebut akan berubah warna menjadi `--color-primary` penuh sebagai penunjuk arah yang presisi.

### 3. Showcase 6 Jurusan (Card & Media)
* Setiap Card Jurusan (TKJ, PPLG, MPLB, PM, DKV, Perhotelan) menggunakan latar `--color-bg-surface` dengan border tipis 1px berwarna `--color-secondary`.
* **Foto Model & Promo:** Wadah placeholder foto harus memiliki sudut melengkung yang seragam (`rounded-lg` atau `rounded-xl`) untuk memberikan kesan modern dan rapi.

### 4. Visualisasi Grafik (Admin Statistics)
* **Grid Lines:** Garis bantu vertikal/horizontal di dalam grafik wajib menggunakan warna `--color-bg-surface` dengan opasitas sangat tipis agar grafik tidak terlihat padat.
* **Warna Grafik Batang (6 Jurusan):** Batang grafik perbandingan pendaftar jurusan disarankan menggunakan variasi opasitas atau gradasi dari rumpun warna `--color-primary` agar tetap selaras dengan tema aplikasi.

---

## 🚀 Implementasi ke Tailwind CSS (`tailwind.config.js`)

Untuk mempermudah proses *stitching* komponen, daftarkan token warna di atas ke dalam file konfigurasi Tailwind kamu:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0F172A',      // bg-app-bg
          surface: '#1E293B', // bg-app-surface
          primary: '#3B82F6', // text-app-primary / bg-app-primary
          secondary: '#64748B',
          textMain: '#F8FAFC',
          textMuted: '#94A3B8',
          success: '#10B981',
          danger: '#EF4444',
        }
      }
    }
  }
}
Pake yang ini coba, campurin

, buatan AI

Yang tahap dua, kok gini? Tolong dong dibenerin, maksud aku di desainnya ada contoh desainnya, jangan dikasih gambar juga.

Generating slides...
SPMB Digital SMK Presentation
18 Mei, 09.41

BENERIN PROMPT TAHAP 2

Oke, saya mengerti. Masalahnya tadi AI-nya malah kasih gambar ilustrasi (seperti poster) bukannya struktur UI/Layout yang bisa dikoding. Kamu maunya contoh tata letak desain (mockup) yang menjelaskan posisi foto model, foto promo, dan tanda panah alurnya.

Berikut adalah Revisi Prompt Tahap 2 yang lebih teknis dan detail untuk instruksi koding. Prompt ini akan memaksa AI untuk membuat Layout Section, bukan sekadar gambar poster.

TAHAP 2 (REVISI): Landing Page Layout & Showcase 6 Jurusan
Copy-paste prompt ini sebagai kelanjutan Tahap 1:

Plaintext
Sekarang, buatkan komponen <LandingPage /> yang modular dengan layout "Modern Corporate SMK". Gunakan palet warna berikut: 
- Midnight Violet (#42253B) sebagai Background Utama.
- Indigo Velvet (#4C2C69) untuk Background Section/Card.
- Moss Green (#82D173) & Light Green (#ABFAA9) untuk Aksen/Button/Icon.
- Cool Steel (#95A3B3) untuk Border/Text Muted.

Komponen ini HARUS memiliki section berikut (fokus pada tata letak, bukan gambar statis):

1. HERO SECTION:
   - Layout dua kolom: Kiri berisi Headline "Jelajahi Masa Depanmu di SMK [Nama Sekolah]" dan CTA Button. Kanan berisi "Feature Card" yang menunjukkan statistik pendaftar.

2. ALUR PENDAFTARAN (STEP-BY-STEP):
   - Buat horizontal flow (untuk desktop) dan vertical flow (untuk mobile).
   - Gunakan 4-5 tahapan pendaftaran. 
   - ELEMEN PENTING: Di antara setiap box tahapan, tambahkan ikon "Tanda Panah" (Arrow SVG/Lucide) yang menunjukkan arah alur pendaftaran. Pastikan panah ini terlihat elegan dan menjadi penyambung visual antar box.

3. SHOWCASE 6 JURUSAN (GRID SYSTEM):
   - Buat Grid 3 kolom (2 baris) untuk menampilkan 6 Jurusan: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan.
   - SETIAP CARD JURUSAN HARUS MEMILIKI STRUKTUR:
     a. Image Container Atas (Foto Model Jurusan): Area untuk foto siswa dengan seragam jurusan (placeholder aspect ratio 3:4).
     b. Image Container Kecil (Foto Promo/Fasilitas): Overlay kecil di sudut atau di bawah foto model yang menunjukkan foto lab/fasilitas (placeholder aspect ratio 1:1).
     c. Text Content: Nama Jurusan (Bold) dan deskripsi singkat 2 baris.
     d. Badge Status: Menampilkan status "Akreditasi A" atau "Jurusan Unggulan".

4. DESIGN RULES:
   - Gunakan border-radius yang halus (rounded-2xl).
   - Gunakan border tipis dengan warna Cool Steel (#95A3B3) dan opasitas 20% untuk memisahkan antar section.
   - Pastikan navigasi Navbar tetap sticky saat user scroll ke section jurusan.
💡 Penjelasan Perubahan untuk Kamu:
Fokus ke Layout: Saya sudah bilang ke AI-nya "Fokus pada tata letak, bukan gambar statis".

Struktur Card Jurusan: Saya minta AI-nya bagi dua tempat foto: satu untuk Foto Model (siswanya) dan satu Foto Promo (fasilitasnya).

Tanda Panah: Saya spesifik minta "Arrow SVG/Lucide" sebagai penyambung visual antar box alur, bukan gambar panah coret-coret.

Warna: Warna yang kamu kasih dari gambar tadi (Moss Green sampai Midnight Violet) sudah saya masukkan ke dalam instruksi warnanya.

🚀 Cara Input Selanjutnya:
Setelah Tahap 2 ini selesai dan output kodenya sudah keluar (kamu bisa lihat desain grid-nya), baru lanjut ke Tahap 3 (Dashboard Siswa) yang ada di instruksi saya sebelumnya.

Apakah bagian alur pendaftarannya mau dibuat melengkung (seperti ular) atau lurus saja dengan panah? Jika mau lurus saja, prompt di atas sudah sangat pas!

Buatin full promptnya aja deh, tapi halamannya per bagian sesuai Color Palette nya

Ini adalah Master Mega-Prompt yang sudah dipecah menjadi 6 tahap. Setiap tahap dirancang agar AI menghasilkan kode yang sangat detail, tidak terpotong, dan mengikuti palet warna Moss Green - Midnight Violet yang kamu berikan.

Ikuti urutan ini di AI pembuat kode kamu (v0.dev, Claude, atau bolt.new):

PANDUAN WARNA (Gunakan Ini Sebagai Referensi)
Main Background: Midnight Violet (#42253B)

Card/Surface Background: Indigo Velvet (#4C2C69)

Primary Accent (Buttons/Icons): Moss Green (#82D173)

Highlight Color: Light Green (#ABFAA9)

Borders & Muted Text: Cool Steel (#95A3B3)

TAHAP 1: Global Configuration & Branding
Input ini pertama kali untuk membangun "pondasi" aplikasi.

Plaintext
Bertindaklah sebagai Senior Frontend Architect. Saya ingin membangun aplikasi SPMB (Sistem Penerimaan Murid Baru) Digital menggunakan Next.js dan Tailwind CSS.

Konfigurasi Sistem:
1. Daftarkan palet warna berikut di tailwind.config: 
   - 'brand-dark': '#42253B' (Main BG)
   - 'brand-surface': '#4C2C69' (Cards)
   - 'brand-primary': '#82D173' (Primary)
   - 'brand-accent': '#ABFAA9' (Highlight)
   - 'brand-steel': '#95A3B3' (Borders/Text)
2. Buat Layout Wrapper utama (Navbar & Footer) dengan gaya modern-minimalist.
3. Gunakan font 'Inter' atau 'Plus Jakarta Sans'.
4. Buat sistem stitching sederhana sehingga saya bisa mengganti halaman melalui state 'currentPage'.
TAHAP 2: Landing Page & Showcase 6 Jurusan
Input ini setelah Tahap 1 selesai. Fokus pada elemen visual & panah.

Plaintext
Sekarang buatkan komponen <LandingPage />. 
Section yang harus ada:

1. HERO SECTION:
   - Headline: "Wujudkan Mimpi di SMK Digital" dengan gradasi warna Light Green.
   - Kolom kanan: Placeholder ilustrasi atau mockup dashboard.

2. ALUR PENDAFTARAN (ARROW FLOW):
   - Buat 4 langkah pendaftaran: Registrasi -> Isi Data -> Pembayaran -> Verifikasi.
   - SETIAP LANGKAH dihubungkan dengan Ikon TANDA PANAH (Arrow) yang elegan. Gunakan warna brand-primary untuk panah tersebut agar menjadi penunjuk visual yang kuat.

3. SHOWCASE 6 JURUSAN (GRID 3x2):
   - Tampilkan 6 Jurusan: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan.
   - SETIAP CARD JURUSAN WAJIB memiliki:
     - Container Foto Utama: Placeholder untuk "Foto Model Siswa Jurusan".
     - Floating Image Kecil: Placeholder untuk "Foto Promo/Fasilitas Jurusan" di pojok bawah foto utama.
     - Deskripsi: Nama jurusan dan profil singkat.
   - Styling: Card menggunakan 'brand-surface' dengan border tipis 'brand-steel'.
TAHAP 3: Registration Flow & 14 Data Calon Siswa
Input ini untuk membangun form pendaftaran yang detail sesuai papan tulis.

Plaintext
Buat komponen <RegistrationForm /> untuk Calon Siswa (Casis). 
Fitur Utama:
1. Progress Tracker: Menunjukkan posisi user di alur pendaftaran.
2. Form Input (14 Data Pokok):
   - Nama Lengkap, Nama Panggilan, TTL, Jenis Kelamin, Alamat, Agama.
   - Nama Orang Tua, No HP Ortu, No HP Pribadi.
   - Pilihan Jurusan (Dropdown 6 Jurusan), Asal Sekolah, NISN, NIK.
   - Upload Berkas (Dropzone untuk Dokumen).
3. Styling: Input field menggunakan background transparan dengan border 'brand-steel', dan berubah menjadi 'brand-primary' saat fokus (ring effect).
TAHAP 4: Payment Portal & Invoice System
Input ini untuk bagian transaksi.

Plaintext
Buat komponen <PaymentPortal />.
Komponen ini mencakup:
1. Invoice Digital: Tampilan rincian biaya pendaftaran dalam card 'brand-surface'.
2. Metode Pembayaran: Pilihan instruksi (Transfer Bank, E-Wallet).
3. Upload Bukti Bayar: Form untuk mengisi nomor referensi dan upload foto bukti transfer.
4. Status Indicator: Label "Menunggu Verifikasi" dengan warna brand-steel atau "Berhasil" dengan warna brand-accent.
TAHAP 5: Admin Panel (Applicant & Document Management)
Input ini untuk sisi pengelolaan data.

Plaintext
Buat komponen <AdminDashboard /> untuk manajemen pendaftar.
1. Summary Tiles: Card ringkas jumlah pendaftar hari ini, total pendaftar, dan jumlah yang sudah bayar.
2. Applicant Data Table: 
   - Kolom: [No, Nomor Daftar, Nama Siswa, JK, Asal Sekolah, Jurusan, Status, Aksi].
   - Gunakan styling zebra-row dengan warna brand-dark dan brand-surface.
3. Verification Module: Tombol aksi untuk "Verval Dokumen" dan "Verval Bayar" yang membuka detail data siswa untuk di-Approve atau Reject.
TAHAP 6: Statistics & Analytics (Grafik 6 Jurusan)
Input terakhir untuk bagian grafik.

Plaintext
Terakhir, buat komponen <AdminStats /> menggunakan library grafik (seperti Recharts atau Chart.js).
Visualisasi yang diminta:
1. Tren Pendaftaran (Area Chart): Gunakan garis warna brand-accent dengan gradasi fill ke brand-dark untuk menunjukkan jumlah pendaftar per minggu.
2. Perbandingan Jurusan (Bar Chart): Tampilkan grafik batang perbandingan jumlah siswa yang memilih 6 jurusan: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan. Gunakan warna brand-primary untuk batang grafik.
3. Legend: Gunakan font warna brand-steel agar selaras dengan background gelap.
Cara Menemukan Color Palette yang Mirip:
Jika kamu ingin bereksperimen lagi dengan warna, kunjungi:

Coolors.co: Cari kata kunci "Deep Purple Green" atau "Cyberpunk Forest".

Color Hunt: Cari kategori "Dark" atau "Neon".

Realtime Colors: Masukkan 5 kode HEX yang ada di gambar kamu untuk melihat langsung bagaimana jadinya di sebuah website.

Saran Penting: Saat memasukkan prompt per tahap, pastikan kamu melihat output kodenya terlebih dahulu. Jika ada yang kurang (misal panahnya kurang besar), tinggal bilang: "Perbesar ukuran ikon tanda panahnya" sebelum lanjut ke Tahap berikutnya.

Di promptnya jangan ditambahin Color Palette lagi, cukup Color dari stitch aja patokannya

Siap, paham! Berarti kita gunakan sistem token warna bawaan dari platform Stitch (seperti variabel primary, secondary, background, surface, dll.) agar kodenya otomatis sinkron dengan tema global yang diatur di Stitch dashboard-mu.

Berikut adalah Master Mega-Prompt (Versi Stitch Native) yang sudah bersih dari kode warna eksternal, dibagi per bagian agar output kodenya detail dan maksimal:

TAHAP 1: Base Layout & Stitch Wrapper
Input ini pertama kali untuk mendeteksi variabel warna Stitch.

Plaintext
Bertindaklah sebagai Senior Frontend Engineer. Saya sedang membangun aplikasi SPMB (Sistem Penerimaan Murid Baru) menggunakan Next.js dan Tailwind CSS di dalam ekosistem Stitch.

Ketentuan Global:
1. Manfaatkan token warna native dari Stitch untuk seluruh elemen UI (Gunakan class warna standar Stitch untuk background, surface, text-main, text-muted, primary, dan secondary). Jangan menambahkan hex code warna baru.
2. Buat struktur file global dan Layout Wrapper (Navbar & Footer) yang bersih, minimalis, dan scannable.
3. Gunakan state management sederhana untuk mensimulasikan perpindahan halaman (stitching) antar modul melalui state 'currentPage'.
TAHAP 2: Landing Page & Showcase 6 Jurusan
Input ini setelah Tahap 1 selesai. Fokus pada elemen visual & alur panah.

Plaintext
Sekarang buatkan komponen <LandingPage /> menggunakan token warna dari Stitch. 
Section yang harus ada:

1. HERO SECTION:
   - Headline: "Wujudkan Mimpi di SMK Digital" menggunakan warna Stitch 'primary' atau 'text-main'.
   - Tombol CTA "Daftar Sekarang" dan "Lihat Biaya".
   - Kolom kanan: Placeholder layout untuk mockup dashboard.

2. ALUR PENDAFTARAN (ARROW FLOW):
   - Buat 4 langkah pendaftaran: Registrasi -> Isi Data -> Pembayaran -> Verifikasi.
   - ELEMEN PENTING: Di antara setiap box tahapan, tambahkan ikon TANDA PANAH (Arrow) yang elegan (misal menggunakan Lucide Icons) sebagai penyambung visual penunjuk arah alur yang jelas.

3. SHOWCASE 6 JURUSAN (GRID 3x2):
   - Tampilkan 6 Jurusan secara spesifik: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan.
   - SETIAP CARD JURUSAN WAJIB memiliki:
     - Container Foto Utama: Placeholder untuk "Foto Model Siswa Jurusan" (aspect ratio 3:4).
     - Floating Image Kecil: Placeholder untuk "Foto Promo/Fasilitas Jurusan" yang menumpuk rapi di sudut bawah foto utama (aspect ratio 1:1).
     - Deskripsi teks: Nama jurusan (Bold) dan profil singkat.
   - Styling Card: Gunakan warna Stitch 'surface' dengan border tipis dari warna Stitch 'secondary/border'.
TAHAP 3: Form Input & 14 Data Calon Siswa
Input ini untuk membangun form pendaftaran yang detail.

Plaintext
Buat komponen <RegistrationForm /> untuk Calon Siswa (Casis) dengan komponen form yang rapi dan modular. 

Fitur Utama:
1. Progress Tracker: Menunjukkan langkah aktif user saat mengisi data.
2. Form Input (14 Data Pokok): Susun grid form untuk menangkap data berikut:
   - Nama Lengkap, Nama Panggilan, TTL, Jenis Kelamin, Alamat, Agama.
   - Nama Orang Tua, No HP Ortu, No HP Pribadi.
   - Pilihan Jurusan (Dropdown yang berisi 6 Jurusan sekolah: TKJ, PPLG, MPLB, PM, DKV, Perhotelan).
   - Asal Sekolah, NISN, NIK.
   - Upload Berkas (Dropzone area untuk mengunggah berkas dokumen pendaftaran).
3. Styling: Gunakan style form input bawaan Stitch dengan efek focus-ring warna 'primary'.
TAHAP 4: Payment Portal & Invoice System
Input ini untuk bagian modul transaksi siswa.

Plaintext
Buat komponen <PaymentPortal /> untuk alur penyelesaian administrasi siswa.
Komponen ini mencakup:
1. Invoice Digital: Tampilan rincian biaya pendaftaran yang rapi di dalam card bertema Stitch 'surface'.
2. Metode Pembayaran: List instruksi pilihan cara bayar (Transfer Bank, E-Wallet).
3. Upload Bukti Bayar: Form input nomor referensi/resi beserta tombol untuk mengunggah file bukti transfer fisik (foto/pdf).
4. Status Indicator: Gunakan badge status bawaan Stitch (seperti 'warning' untuk Menunggu Verifikasi, dan 'success' untuk Terverifikasi).
TAHAP 5: Admin Panel & Verification Modul
Input ini untuk sisi pengelolaan data oleh admin.

Plaintext
Buat komponen <AdminDashboard /> untuk manajemen data pendaftar oleh panitia sekolah.
1. Summary Tiles: Panel card ringkas untuk memantau total pendaftar masuk, berkas terverifikasi, dan pembayaran masuk.
2. Applicant Data Table: 
   - Kolom wajib: [No | Nomor Daftar | Nama Siswa | JK | Asal Sekolah | Pilihan Jurusan | Status Verifikasi | Aksi].
   - Desain tabel harus bersih, dipisahkan garis border tipis, dan scannable.
3. Modul Verifikasi: Sediakan tombol aksi terpisah untuk proses "Document Verification" (Verval Dokumen) dan "Payment Verification" (Verval Bayar) untuk mengubah status pendaftar.
TAHAP 6: Admin Statistics (Grafik 6 Jurusan & Tren)
Input terakhir untuk visualisasi analytics admin.

Plaintext
Terakhir, buat komponen <AdminStats /> menggunakan library grafik (seperti Recharts atau Chart.js) yang di-styling agar menyatu dengan palet warna Stitch.

Visualisasi yang diminta:
1. Tren Pendaftaran (Area/Line Chart): Menampilkan grafik pertumbuhan jumlah pendaftar dari minggu ke minggu menggunakan warna Stitch 'primary'.
2. Perbandingan 6 Jurusan (Bar Chart): Grafik batang yang membandingkan total pendaftar di 6 jurusan: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan secara real-time. Gunakan warna aksen Stitch untuk bagian batang grafik.
3. Legend & Label: Pastikan warna teks label sumbu X dan Y menggunakan token warna Stitch 'text-muted' agar tetap terbaca jelas di latar belakang dashboard.
Tambahin di promptnya kalo ngikutin link contoh UI Webnya

Siap, paham! Berarti kita tambahkan instruksi agar AI wajib membaca dan meniru struktur layout, posisi elemen, serta UX flow langsung dari URL/Link contoh UI Web yang nanti kamu tempel (paste) bersamaan dengan prompt tersebut.

Berikut adalah Master Mega-Prompt (Versi Stitch Native + URL Reference). Kamu tinggal memasukkan link contoh webnya pada bagian [PASTE_LINK_DI_SINI] di setiap tahap:

TAHAP 1: Base Layout & Stitch Wrapper (Dengan Referensi URL)
Input ini pertama kali untuk mendeteksi variabel Stitch dan struktur dasar dari link contoh.

Plaintext
Bertindaklah sebagai Senior Frontend Engineer. Saya sedang membangun aplikasi SPMB (Sistem Penerimaan Murid Baru) menggunakan Next.js dan Tailwind CSS di dalam ekosistem Stitch.

Sebagai referensi utama struktur tata letak (layout), pola navigasi, dan UX flow, tolong pelajari link contoh UI Web berikut: 
👉 [PASTE_LINK_DI_SINI]

Ketentuan Global:
1. Ikuti hierarki struktur dan layout dari link referensi di atas, namun sesuaikan komponennya menggunakan token warna native dari Stitch (Gunakan class warna standar Stitch untuk background, surface, text-main, text-muted, primary, dan secondary). Jangan menambahkan hex code warna baru.
2. Buat struktur file global dan Layout Wrapper (Navbar & Footer) yang bersih, minimalis, dan scannable berdasarkan benchmark link tersebut.
3. Gunakan state management sederhana untuk mensimulasikan perpindahan halaman (stitching) antar modul melalui state 'currentPage'.
TAHAP 2: Landing Page & Showcase 6 Jurusan (Dengan Referensi URL)
Input ini setelah Tahap 1 selesai. Fokus pada elemen visual, peletakan gambar, dan alur panah.

Plaintext
Sekarang buatkan komponen <LandingPage />. Gunakan pendekatan desain, whitespace, dan susunan komponen yang terinspirasi dari link referensi ini:
👉 [PASTE_LINK_DI_SINI]

Section yang harus ada:
1. HERO SECTION:
   - Headline: "Wujudkan Mimpi di SMK Digital" menggunakan warna Stitch 'primary' atau 'text-main'.
   - Tombol CTA "Daftar Sekarang" dan "Lihat Biaya".
   - Kolom kanan: Placeholder layout untuk mockup dashboard (tiru posisi/layout dari link contoh jika ada).

2. ALUR PENDAFTARAN (ARROW FLOW):
   - Buat 4 langkah pendaftaran: Registrasi -> Isi Data -> Pembayaran -> Verifikasi.
   - ELEMEN PENTING: Di antara setiap box tahapan, tambahkan ikon TANDA PANAH (Arrow) yang elegan (misal menggunakan Lucide Icons) sebagai penyambung visual penunjuk arah alur yang jelas, tiru cara link referensi menata alur horizontal/vertikalnya.

3. SHOWCASE 6 JURUSAN (GRID 3x2):
   - Tampilkan 6 Jurusan secara spesifik: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan.
   - SETIAP CARD JURUSAN WAJIB memiliki:
     - Container Foto Utama: Placeholder untuk "Foto Model Siswa Jurusan" (aspect ratio 3:4).
     - Floating Image Kecil: Placeholder untuk "Foto Promo/Fasilitas Jurusan" yang menumpuk rapi di sudut bawah foto utama (aspect ratio 1:1).
     - Deskripsi teks: Nama jurusan (Bold) dan profil singkat.
   - Styling Card: Gunakan warna Stitch 'surface' dengan border tipis dari warna Stitch 'secondary/border'.
TAHAP 3: Form Input & 14 Data Calon Siswa (Dengan Referensi URL)
Input ini untuk membangun form pendaftaran yang rapi dan terstruktur.

Plaintext
Buat komponen <RegistrationForm /> untuk Calon Siswa (Casis). Tolong adaptasi cara link berikut menyusun form input, pembagian langkah (step form), dan penataan whitespace agar form tidak terlihat penuh:
👉 [PASTE_LINK_DI_SINI]

Fitur Utama:
1. Progress Tracker: Menunjukkan langkah aktif user saat mengisi data (tiru gaya indikator dari link contoh).
2. Form Input (14 Data Pokok): Susun grid form untuk menangkap data berikut:
   - Nama Lengkap, Nama Panggilan, TTL, Jenis Kelamin, Alamat, Agama.
   - Nama Orang Tua, No HP Ortu, No HP Pribadi.
   - Pilihan Jurusan (Dropdown yang berisi 6 Jurusan sekolah: TKJ, PPLG, MPLB, PM, DKV, Perhotelan).
   - Asal Sekolah, NISN, NIK.
   - Upload Berkas (Dropzone area untuk mengunggah berkas dokumen pendaftaran).
3. Styling: Gunakan style form input bawaan Stitch dengan efek focus-ring warna 'primary'.
TAHAP 4: Payment Portal & Invoice System (Dengan Referensi URL)
Input ini untuk bagian modul transaksi siswa.

Plaintext
Buat komponen <PaymentPortal /> untuk alur penyelesaian administrasi siswa. Tiru layout kwitansi/invoice dan kebersihan antarmuka dari link referensi ini:
👉 [PASTE_LINK_DI_SINI]

Komponen ini mencakup:
1. Invoice Digital: Tampilan rincian biaya pendaftaran yang rapi di dalam card bertema Stitch 'surface'.
2. Metode Pembayaran: List instruksi pilihan cara bayar (Transfer Bank, E-Wallet).
3. Upload Bukti Bayar: Form input nomor referensi/resi beserta tombol untuk mengunggah file bukti transfer fisik (foto/pdf).
4. Status Indicator: Gunakan badge status bawaan Stitch (seperti 'warning' untuk Menunggu Verifikasi, dan 'success' untuk Terverifikasi).
TAHAP 5: Admin Panel & Verification Modul (Dengan Referensi URL)
Input ini untuk manajemen data oleh admin.

Plaintext
Buat komponen <AdminDashboard /> untuk manajemen data pendaftar oleh panitia sekolah. Sederhanakan atau tiru tata letak table grid dan sidebar dashboard dari link referensi ini:
👉 [PASTE_LINK_DI_SINI]

1. Summary Tiles: Panel card ringkas untuk memantau total pendaftar masuk, berkas terverifikasi, dan pembayaran masuk.
2. Applicant Data Table: 
   - Kolom wajib: [No | Nomor Daftar | Nama Siswa | JK | Asal Sekolah | Pilihan Jurusan | Status Verifikasi | Aksi].
   - Desain tabel harus bersih, dipisahkan garis border tipis, dan scannable.
3. Modul Verifikasi: Sediakan tombol aksi terpisah untuk proses "Document Verification" (Verval Dokumen) dan "Payment Verification" (Verval Bayar) untuk mengubah status pendaftar (Gunakan layout modal/split-view seperti contoh di link).
TAHAP 6: Admin Statistics / Grafik 6 Jurusan (Dengan Referensi URL)
Input terakhir untuk visualisasi analytics admin.

Plaintext
Terakhir, buat komponen <AdminStats /> menggunakan library grafik (seperti Recharts atau Chart.js). Tiru gaya penempatan chart, posisi legend, dan komposisi dashboard analytics dari link referensi ini:
👉 [PASTE_LINK_DI_SINI]

Visualisasi yang diminta:
1. Tren Pendaftaran (Area/Line Chart): Menampilkan grafik pertumbuhan jumlah pendaftar dari minggu ke minggu menggunakan warna Stitch 'primary'.
2. Perbandingan 6 Jurusan (Bar Chart): Grafik batang yang membandingkan total pendaftar di 6 jurusan: TKJ, PPLG, MPLB, PM, DKV, dan Perhotelan secara real-time. Gunakan warna aksen Stitch untuk bagian batang grafik.
3. Legend & Label: Pastikan warna teks label sumbu X dan Y menggunakan token warna Stitch 'text-muted' agar tetap terbaca jelas di latar belakang dashboard.
💡 Tips Eksekusi:
Setiap kali kamu mau pindah ke tahap berikutnya, pastikan kamu mengganti tulisan [PASTE_LINK_DI_SINI] dengan link web yang ingin kamu jadikan contoh nyata. Strategi ini dijamin bikin AI menghasilkan struktur kodingan yang presisi banget!