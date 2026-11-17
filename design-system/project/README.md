Sistem desain untuk website informasi peserta **PTPN GreenStride 2026**, lomba lari virtual beregu karyawan PTPN Group. Pembacanya karyawan dari semua level yang membuka situs dari ponsel, sering di lapangan atau kebun dengan sinyal lemah, untuk satu tujuan: menemukan jawaban yang pasti dengan cepat. Semua keputusan di bawah turun dari key visual acara (hijau hutan, daun, judul miring tebal, pelari) dan konten media sosial "24 KM".

## Prinsip

1. **Jawaban dulu.** Setiap layar menjawab satu pertanyaan peserta. Hiasan tidak boleh menunda informasi.
2. **Satu energi per layar.** Satu elemen tebal (judul miring besar, pita `band`, atau titik `sun`) per layar; sisanya tenang di `surface`.
3. **Bergerak karena disentuh.** Gerak menjawab kursor, ketukan dan pilihan. Tidak ada yang bergerak sendiri kecuali hitung mundur dan satu titik "sekarang".
4. **Ponsel dulu.** Rancang di lebar 360 px, target sentuh 44 px, gambar ringan.

## Suara dan penulisan

- Bahasa Indonesia yang ramah dan lugas. Sapa peserta dengan **kamu**, seperti konten 24 KM ("Kamu gak perlu memaksakan diri").
- Bahasa gaul hanya untuk satu pernyataan kampanye per halaman, ditulis di `display-l` ("Gak harus jauh, yang penting melangkah."). Label, tombol dan jawaban FAQ memakai bahasa baku.
- Jawaban dibuka dengan kepastian: **Ya.**, **Tidak.**, **Boleh.**, atau angkanya langsung. Satu sampai tiga kalimat.
- Tulis informasi yang berlaku saja. Jangan menyebut sumber dokumen ("menurut guidebook"), riwayat perubahan ("diperpanjang", "mundur"), atau ketidakpastian internal. Hal yang belum ditetapkan ditulis "Diumumkan panitia".
- Tombol: kata kerja + benda, maksimal tiga kata: "Cari jawaban", "Unduh aplikasi", "Buka Help Desk", "Unduh guidebook". Jangan "Pelajari lebih lanjut", "Klik di sini", "Mulai".
- Nama menu aplikasi ditulis persis seperti di layar: My Races, eBib, Submit, Strava Connect, Auto Submission, Who can view, Everyone, Save Activity, Ranking, Group Leaderboard.
- Tanpa em dash, tanpa emoji, tanpa tanda seru beruntun.
- Tagline resmi dipakai utuh dalam bahasa Inggris: "Run for a healthier you, a stronger Nusantara Entreplanters"; pilar "Move Together", "Live Better", "Grow Stronger"; penutup "Every step counts. Every stride matters."

| Tulis | Jangan tulis |
| --- | --- |
| Boleh. Target tim tetap 300 km. | Sesuai guidebook, tim boleh kurang dari 5 orang namun... |
| Lomba berlangsung 23 November – 20 Desember 2026. | Karena pendaftaran diperpanjang, jadwal mundur menjadi... |
| Maksimal 24 km per hari, bukan target. | Peserta WAJIB memperhatikan batas 24KM!!! |
| Unduh aplikasi | Klik di sini untuk download |

### Angka, satuan, waktu

- Jarak: angka, spasi, `km` huruf kecil: **300 km**, **24 km per hari**, **2,1 km** (koma desimal).
- Pace: **5:00 – 15:00 menit/km**.
- Waktu: **23.59 WIB** (titik, zona selalu ditulis).
- Tanggal: **23 November 2026**; rentang **23 November – 20 Desember 2026** (tanda pisah pendek dengan spasi).
- Angka di kolom dan hitung mundur memakai angka tabular.

## Warna

- Halaman berdiri di `surface`. Bagian selang-seling memakai `surface-tint`; kartu, panel FAQ dan kolom input memakai `surface-raised` dengan tepi `line`.
- Teks utama `ink`; teks pendukung `ink-muted`. Keduanya lolos 4,5:1 di ketiga surface pada tema terang dan gelap.
- Hijau hutan `band` dipakai untuk tiga tempat saja: hero, pita bantuan, footer. Di hero, gradasi `band` ke `band-end` meniru pita tagline biru-hijau di key visual. Teks di atasnya `band-ink` dan `band-muted`; kartu di atasnya `band-raised`.
- Aksi utama di surface: isian `leaf` dengan label `on-leaf`. Aksi utama di atas band: isian `lime` dengan label `on-lime`. Satu tombol utama per layar.
- `lime` adalah energi daun di key visual: kata sorotan di judul hero, potongan daun pada eyebrow, bar progres. Jangan jadikan teks di atas surface terang.
- `sun` (kuning dari konten 24 KM) hanya untuk penanda perhatian: status hitung mundur, label "Sekarang" di jadwal, callout `sun-soft`. Maksimal satu titik kuning per layar.
- `ocean` untuk informasi netral (callout info). `danger` hanya untuk aturan yang membatalkan aktivitas, selalu bersama ikon dan kata.
- Komposisi kasar per halaman: 70% `surface`, 20% `band`, 10% aksen (`leaf`, `lime`, `sun`).

## Tipografi

- **Archivo** (keluarga `display`) dipakai miring, tebal 800 dan dilebarkan 112% (`font-stretch`) karena meniru logotype GREENSTRIDE yang miring, tebal dan melaju. **Poppins** (keluarga `text`) adalah huruf yang sudah dipakai di konten media sosial acara, jadi situs dan feed terasa satu suara.
- `display-xl`: judul hero, huruf kapital, satu kali per halaman. Kata kuncinya diberi `lime`.
- `display-l`: satu pernyataan kampanye per halaman (pesan 24 km).
- `heading-1`: judul bagian. Kalimat biasa, bukan kapital. Satu kata kunci boleh diberi `leaf`.
- `heading-2` dan `heading-3`: judul kartu dan langkah. `heading-3` tegak, tidak miring.
- `stat`: angka besar di FactTile, hitung mundur dan KmSplitter.
- `lead` di bawah judul, maksimal dua baris. `body` untuk semua bacaan, lebar baris maksimal 64 karakter. `label` untuk eyebrow dan pilar, kapital, satu per bagian.
- Poppins tidak pernah miring; kemiringan milik Archivo.

## Ruang, grid, bentuk

- Kontainer `container` 1200 px, 12 kolom, gap `gutter`. Gutter tepi `space-4` di ponsel, `space-5` di tablet ke atas.
- Jarak antar bagian `space-9` di desktop, `space-8` di ponsel. Judul bagian ke isi `space-7` (desktop) atau `space-6` (ponsel).
- Header lengket setinggi `header-height` dengan latar `surface-raised`; bayangan `shadow-md` muncul setelah halaman digulir.
- Tombol dan chip `radius-pill`. Kartu, panel FAQ, callout `radius-md`. Kolom input `radius-pill`.
- **Bentuk daun** adalah tanda tangan sistem: dua sudut berseberangan `radius-leaf`, dua lainnya `radius-sm`. Pakai hanya pada foto hero, kartu hitung mundur, kartu penghargaan utama, dan latar ponsel di AppSteps. Potongan daun kecil miring berwarna `lime` membuka setiap eyebrow.
- Bayangan: `shadow-sm` untuk kartu diam bila perlu, `shadow-md` untuk kartu yang disorot, panel FAQ terbuka dan header setelah digulir. Tidak ada bayangan di atas `band`. `shadow-glow` hanya untuk satu titik "sedang berlangsung".

## Gerak dan mikro-interaksi

Durasi `dur-fast` untuk hover dan tekan, `dur-base` untuk buka tutup, `dur-slow` untuk masuknya hero. Kurva `ease-out`, kecuali `ease-spring` untuk panah tombol dan angka KmSplitter.

- Tombol naik 2 px saat disorot, mengecil 2% saat ditekan; panah bergeser 4 px.
- FactTile, RewardCard, DocumentCard naik 3 px dengan `shadow-md`; ikon FactTile berputar -8°.
- FAQ membuka dengan tinggi mengalir (`grid-template-rows`), chevron berputar 180°, kartu terbuka bertepi `leaf`.
- AppSteps mengganti layar ponsel dengan crossfade, bar progres `lime` mengisi di langkah aktif; panah atas/bawah berpindah langkah.
- KmSplitter menggeser bar dengan pegas saat jumlah anggota diganti.
- Hasil pencarian FAQ menandai kata yang cocok dengan `leaf-soft`.
- Hero masuk sekali saat dimuat (naik 16 px dan memudar masuk, `dur-slow`).
- Tidak ada: animasi muncul saat menggulir, parallax, karusel, tab yang berganti sendiri. `prefers-reduced-motion` mematikan semua gerak.

## Gambar

- Foto pelari asli dari materi acara (`hero-runners.webp`, `photo-langkah-pelari.webp`, `pelari-greenstride.webp`). Foto hero memakai bentuk daun.
- `key-visual.webp` adalah rujukan gaya. Jangan tampilkan utuh di situs karena memuat tanggal lama.
- Tangkapan layar aplikasi tampil di dalam bingkai ponsel AppSteps, tidak pernah lepas di halaman.
- Logo Danantara, PTPN dan Planters Club selalu memakai warna asli. Di atas `band` atau di tema gelap, letakkan di pelat terang `band-ink` (pelat bentuk daun di footer, pelat pill di header). Hanya logotype GreenStride yang putih, dan hanya di atas `band`. Header: Danantara, lalu PTPN dengan garis pemisah. Footer: Danantara, PTPN, Planters Club. Jangan mengubah warna, meregangkan, atau memberi efek pada logo.
- Favicon: tanda pelari GreenStride putih di kotak `band` bersudut membulat, dengan garis lintasan `lime`.
- Badge App Store dan Google Play serta ikon 99 Virtual Race dan Strava dipakai apa adanya dari file resmi.

## Ikonografi

- Satu set ikon garis 24 px, tebal 2 px, ujung bulat, warna `currentColor` (komponen `Icon`; file SVG di grup Icons bertinta `band`).
- Makna tetap: `run` aktivitas, `team` tim, `route` jarak, `calendar` jadwal, `clock` waktu dan pace, `upload` submit, `shield-check` verifikasi, `medal` finisher, `trophy` juara, `phone` aplikasi, `gps` GPS, `lifebuoy` bantuan, `document` dan `download` dokumen, `alert` perhatian, `info` keterangan, `ban` tidak dihitung, `heart-pulse` kesehatan, `flag` mulai.
- Pilar key visual (Move Together, Live Better, Grow Stronger) tampil sebagai ikon di lingkaran penuh (`Pillar`), meniru lencana bulat di key visual.
- Catatan: key visual tidak menyertakan file ikon. Set ini digambar ulang mengikuti gaya lencana di key visual; ganti dengan file resmi bila tim desain acara menyediakannya.

## Aksesibilitas

- Kontras teks minimal 4,5:1 di setiap tema; tepi kontrol dan ikon bermakna minimal 3:1.
- Cincin fokus 2 px `focus` dengan jarak 3 px; di atas band memakai `lime`.
- Semua kontrol bisa dipakai dengan papan ketik: `/` membuka pencarian FAQ, panah atas/bawah memilih langkah aplikasi, Enter/Spasi membuka FAQ.
- Status tidak pernah disampaikan dengan warna saja: "Sekarang" ditulis, aturan tegas memakai ikon dan judul.

## Komponen

| Komponen | Untuk |
| --- | --- |
| Navbar | Header lengket dengan logo, tautan bagian, satu tombol |
| Button | Semua aksi; varian `primary`, `secondary`, `ghost`, `lime`, `on-band` |
| SectionHeader | Eyebrow, judul bagian, kalimat pembuka |
| Pillar | Tiga pilar kampanye di hero |
| Countdown | Status lomba dan sisa waktu di hero |
| FactTile | Ringkasan aturan inti dalam angka |
| KmSplitter | Kalkulator porsi km per anggota |
| AppSteps, AppCard | Panduan aplikasi dan tautan unduh resmi |
| ScheduleItem | Linimasa jadwal |
| RewardCard | Tingkat penghargaan |
| SearchField, Chip, FaqItem | Pusat jawaban |
| Callout | Info, perhatian, aturan tegas |
| DocumentCard | Unduhan dokumen PDF |
| Icon | Set ikon garis |

## Pola halaman

Urutan bagian untuk halaman utama: Navbar → Hero (`band`, judul `display-xl`, Countdown, foto daun, Pillar) → Ringkasan (FactTile ×6) → Cara ikut (AppSteps + AppCard ×2) → Pesan 24 km (`display-l` + KmSplitter, di `surface-tint`) → Jadwal (ScheduleItem) → Penghargaan (RewardCard, satu `feature`) → Pusat jawaban (SearchField, Chip topik, FaqItem) → Unduhan (DocumentCard ×3) → Bantuan (pita `band`, tombol `lime` ke Help Desk) → Footer (`band`, logo putih, "Every step counts. Every stride matters.").
