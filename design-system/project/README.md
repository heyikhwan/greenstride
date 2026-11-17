Sistem desain untuk website informasi peserta **PTPN GreenStride 2026**, lomba lari virtual beregu karyawan PTPN Group. Pembacanya karyawan dari semua level yang membuka situs dari ponsel, sering di lapangan atau kebun dengan sinyal lemah, untuk satu tujuan: menemukan jawaban yang pasti dengan cepat. Semua keputusan di bawah turun dari key visual acara (hijau hutan, daun, judul miring tebal, pelari) dan konten media sosial "24 KM".

## Prinsip

1. **Jawaban dulu.** Setiap layar menjawab satu pertanyaan peserta. Hiasan tidak boleh menunda informasi.
2. **Satu energi per layar.** Satu elemen tebal (judul miring besar, pita `band`, atau titik `sun`) per layar; sisanya tenang di `surface`.
3. **Bergerak karena disentuh atau karena data tampil.** Gerak menjawab kursor, ketukan, pilihan dan gulir. Grafik data dan garis kata kunci digambar sekali saat pertama terlihat. Tidak ada yang bergerak sendiri selain itu, kecuali hitung mundur dan satu titik "sekarang", dan keduanya berhenti sebelum 5 detik.
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
- Hijau hutan `band` dipakai untuk enam tempat saja: header, hero, kartu "Target tim" di Ringkasan, panel pernyataan 24 km (di atas foto), anak tangga teratas penghargaan, pita bantuan, footer. Header dan hero menyambung jadi satu blok hijau di atas halaman. Di hero, gradasi `band` ke `band-end` meniru pita tagline biru-hijau di key visual. Teks di atasnya `band-ink` dan `band-muted`; kartu di atasnya `band-raised`.
- Aksi utama di surface: isian `leaf` dengan label `on-leaf`. Aksi utama di atas band: isian `lime` dengan label `on-lime`. Satu tombol utama per layar.
- `lime` adalah energi daun di key visual: kata sorotan di judul hero, potongan daun pada eyebrow, bar progres. Jangan jadikan teks di atas surface terang.
- `sun` (kuning dari konten 24 KM) hanya untuk penanda perhatian: status hitung mundur, label "Sekarang" di jadwal, callout `sun-soft`. Maksimal satu titik kuning per layar.
- `ocean` untuk informasi netral (callout info). `danger` hanya untuk aturan yang membatalkan aktivitas, selalu bersama ikon dan kata.
- Komposisi kasar per halaman: 70% `surface`, 20% `band`, 10% aksen (`leaf`, `lime`, `sun`).

## Tipografi

- **Archivo** (keluarga `display`) dipakai miring, tebal 800 dan dilebarkan 112% (`font-stretch`) karena meniru logotype GREENSTRIDE yang miring, tebal dan melaju. **Poppins** (keluarga `text`) adalah huruf yang sudah dipakai di konten media sosial acara, jadi situs dan feed terasa satu suara.
- `display-xl`: judul hero, huruf kapital, satu kali per halaman. Kata kuncinya diberi `lime`.
- `display-l`: satu pernyataan kampanye per halaman (pesan 24 km).
- `heading-1`: judul bagian. Kalimat biasa, bukan kapital. Satu kata kunci boleh diberi `leaf` dan garis `lime` di bawahnya (`gs-keyline`, motif garis rute). Kata kunci di `display-xl` dan `display-l` memakai garis yang sama.
- `heading-2` dan `heading-3`: judul kartu dan langkah. `heading-3` tegak, tidak miring.
- `stat`: angka besar di FactTile, hitung mundur dan KmSplitter.
- `lead` di bawah judul, maksimal dua baris. `body` untuk semua bacaan, lebar baris maksimal 64 karakter. `label` untuk eyebrow dan pilar, kapital, satu per bagian.
- Poppins tidak pernah miring; kemiringan milik Archivo.

## Ruang, grid, bentuk

- Kontainer `container` 1200 px, 12 kolom, gap `gutter`. Gutter tepi `space-4` di ponsel, `space-5` di tablet ke atas.
- Jarak antar bagian `space-9` di desktop, `space-8` di ponsel. Judul bagian ke isi `space-7` (desktop) atau `space-6` (ponsel).
- Header lengket setinggi `header-height` dengan latar `band` dan garis bawah tipis terang; bayangan `shadow-md` muncul setelah halaman digulir.
- Tombol dan chip `radius-pill`. Kartu, panel FAQ, callout `radius-md`. Kolom input `radius-pill`.
- **Bentuk daun** adalah tanda tangan sistem: dua sudut berseberangan `radius-leaf`, dua lainnya `radius-sm`. Pakai hanya pada foto hero, kartu hitung mundur, anak tangga teratas RewardLadder, dan latar ponsel di AppSteps. Potongan daun kecil miring berwarna `lime` membuka setiap eyebrow.
- Bayangan: `shadow-sm` untuk kartu diam bila perlu, `shadow-md` untuk kartu yang disorot, panel FAQ terbuka dan header setelah digulir. Tidak ada bayangan di atas `band`. `shadow-glow` hanya untuk satu titik "sedang berlangsung".

## Gerak dan mikro-interaksi

Durasi `dur-fast` untuk hover dan tekan, `dur-base` untuk buka tutup, `dur-slow` untuk masuknya hero. Kurva `ease-out`, kecuali `ease-spring` untuk panah tombol, angka KmSplitter dan hal yang "mendarat" (penanda pilihan, nomor langkah, hasil cek).

Bahasa geraknya **melaju**: garis `lime` tergambar dari kiri ke kanan seperti garis rute, dan nilai yang berganti meluncur ke tempatnya. Teks bacaan tidak pernah ditahan atau dimunculkan belakangan.

Disentuh:
- Tombol naik 2 px saat disorot, mengecil 2% saat ditekan; panah bergeser 4 px; ikon di depan label berputar -8°.
- FactTile, RewardCard, DocumentCard naik 3 px dengan `shadow-md`; ikon FactTile berputar -8°.
- FAQ membuka dengan tinggi mengalir (`grid-template-rows`), chevron berputar 180°, kartu terbuka bertepi `leaf`. Saat topik berganti atau pencarian dimulai, daftar baru naik 8 px berurutan (jeda 35 ms, paling banyak tujuh butir); mengetik tidak memicu ulang.
- AppSteps mengganti layar ponsel dengan crossfade, bar progres `lime` mengisi di langkah aktif, nomor langkah membesar sekejap dengan pegas; di ponsel keterangan langkah naik masuk. Panah atas/bawah berpindah langkah.
- KmSplitter: penanda pilihan `band` meluncur dengan pegas ke tombol yang dipilih, bar menggeser dengan pegas, angka porsi meluncur masuk saat berubah.
- ActivityCheck: penanda pace bergeser dengan pegas saat isian berubah; kotak hasil masuk dengan pegas dan ikonnya tergambar setiap kali jenis hasil berganti; pesan salah naik masuk.
- Menu ponsel: tautan turun berurutan dari header, ikon tombol berputar saat berganti buka/tutup.
- Hasil pencarian FAQ menandai kata yang cocok dengan `leaf-soft`.

Dimuat dan digulir:
- Hero masuk sekali saat dimuat (naik 16 px dan memudar masuk, `dur-slow`); lapis gelombang `leaf` dan `lime` naik dari balik lapis halaman. Bar periode Countdown memanjang ke hari ini.
- Countdown: angka hari, jam dan menit meluncur turun saat berganti; detik berganti tanpa gerak. Titik status berdenyut dua kali lalu diam.
- **Garis kemajuan baca**: garis `lime` 3 px di tepi bawah header memanjang mengikuti gulir halaman (CSS `animation-timeline: scroll()`; peramban tanpa dukungan tidak menampilkannya).
- **Garis kata kunci** (`gs-keyline`) tergambar sekali dari kiri saat judul terlihat. Teks judul sudah tampil penuh sejak awal.
- **Grafik data digambar sekali saat pertama terlihat** (`useDraw`, IntersectionObserver): segmen TeamBar terisi berurutan, garis Route tergambar lalu titik akhirnya muncul, sel kalender yang lewat terisi, anak tangga RewardLadder naik, RuleGraphic (rambu batas tergambar melingkar, token submit naik, jarum jam berputar ke 23.59), garis tahap jadwal yang selesai tumbuh ke bawah. Paling lama 600 ms. HTML awal memuat grafik utuh, jadi tanpa JavaScript grafik tetap terbaca.
- Satu titik "sekarang" berdenyut dua kali setelah terlihat: sel hari ini di kalender selama lomba, atau chip "Sekarang" di jadwal di luar masa lomba. Tidak pernah keduanya.

- Tidak ada: teks yang muncul belakangan saat menggulir, hitung naik angka, parallax, karusel, tab yang berganti sendiri, gerak berulang tanpa henti. `prefers-reduced-motion` mematikan semua gerak; grafik dan garis kata kunci tampil utuh.

## Gambar

- Foto pelari asli dari materi acara (`hero-runners.webp`, `photo-langkah-pelari.webp`, `pelari-greenstride.webp`). Foto hero memakai bentuk daun.
- `key-visual.webp` adalah rujukan gaya. Jangan tampilkan utuh di situs karena memuat tanggal lama.
- **Gelombang hero**: tiga lapis SVG di tepi bawah hero (`leaf` 55%, `lime`, lalu warna halaman) meniru swoosh key visual dan menyambung hero ke isi. Satu kali per halaman.
- **Garis rute** (komponen `Route`) dari konten 24 KM: garis berkelok terang dengan titik ujung `lime`. Muncul di panel pernyataan 24 km dan sebagai `TeamRoute` (300 km lima ruas) di kartu Target tim; bar periode Countdown dan jalan KmSplitter memakai bahasa yang sama (garis tebal, titik bulat di ujung).
- **Panel pernyataan 24 km**: `photo-langkah-pelari.webp` di bawah lapisan `band` 92% di area teks, turun ke 50% di bagian bawah agar langkah pelari terlihat, seperti konten 24 KM. Teks di panel memakai `band-ink` (kontras di atas 4,5:1 di titik foto paling terang). Foto digeser 8% ke atas karena tepi atas berkas asli memuat pita hitam.
- **Ilustrasi** penghargaan (medali, jersey, piala) digambar dengan gaya set ikon. Ilustrasi, bukan foto resmi; ganti bila panitia menyediakan foto.
- Tangkapan layar aplikasi tampil di dalam bingkai ponsel AppSteps, tidak pernah lepas di halaman.
- **Planters Club adalah penyelenggara dan logo utama.** PTPN GreenStride 2026 diselenggarakan Planters Club untuk karyawan PTPN Group, yang berada di bawah Danantara Indonesia. Bila tampil bersama, urutannya mengikuti peran itu: Planters Club (versi horizontal) paling depan dan paling besar, lalu garis pemisah, lalu logo induk Danantara dan PTPN yang lebih kecil.
- Header: hanya Planters Club horizontal versi putih (`logo-planters-club-horizontal-white.png`), 44 px (36 px di ponsel), langsung di atas `band` tanpa pelat, di tema terang maupun gelap. Tautan header `band-ink`, garis bawah dan tombol Help Desk `lime`. Footer dan gambar bagikan: pelat bentuk daun berisi Planters Club di depan, Danantara dan PTPN di belakang garis, tanpa kalimat keterangan.
- Semua logo memakai warna asli. Di atas `band`, letakkan di pelat terang `band-ink` (pelat bentuk daun di footer). Logo putih hanya dipakai di atas `band`: logo Planters Club di header dan logotype GreenStride; logotype ini nama acara, bukan logo penyelenggara. Jangan mengubah warna, meregangkan, atau memberi efek pada logo.
- Favicon: tanda Planters Club (`logo-planters-club-mark.png`) berwarna asli tanpa latar (PNG transparan). Ikon layar utama iPhone (`apple-icon.png`) tetap memakai kotak `band-ink` karena iOS mengisi bagian transparan dengan hitam.
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
| TeamBar | 300 km dibagi per anggota, bagian minimal 60 km ditandai |
| Route | Motif garis rute dari konten 24 KM |
| TeamRoute | 300 km sebagai rute lima ruas, satu ruas per anggota |
| RuleGraphic | Rambu batas, token submit, jam 23.59 untuk aturan harian |
| ActivityCheck | Cek pace dan apakah aktivitas dihitung |
| RaceCalendar | Rencana 4 minggu: 28 hari, target kumulatif per minggu, hari lewat dan hari ini |
| RewardLadder, Illustration | Tingkat penghargaan sebagai anak tangga |
| AppSteps, AppCard | Panduan aplikasi dan tautan unduh resmi |
| ScheduleItem | Linimasa jadwal dengan chip tanggal |
| RewardCard | Satu penghargaan dalam kartu (di luar halaman utama) |
| SearchField, Chip, FaqItem | Pusat jawaban |
| Callout | Info, perhatian, aturan tegas |
| DocumentCard | Unduhan dokumen PDF |
| Icon | Set ikon garis |

## Pola halaman

Urutan bagian untuk halaman utama: Navbar → Hero (`band`, judul `display-xl`, Countdown, foto daun, Pillar, gelombang) → Ringkasan (kartu "Target tim" di `band` dengan angka 300 km dan TeamRoute; "Setiap hari" di `surface-tint` sebagai tiga baris RuleGraphic + angka; lalu kotak "Dihitung" (`leaf-soft`) dan "Tidak dihitung" (`danger-soft`) berdampingan, dan ActivityCheck `wide` selebar kontainer di bawahnya) → Cara ikut (AppSteps + AppCard ×2) → Pesan 24 km (panel foto dengan `display-l` dan Route + KmSplitter) → Jadwal (judul, lalu RaceCalendar berdampingan dengan ScheduleItem) → Penghargaan (RewardLadder) → Pusat jawaban (SearchField, Chip topik, FaqItem) → Unduhan (DocumentCard ×3) → Bantuan (pita `band` dengan daftar data yang disiapkan, tombol `lime` ke Help Desk) → Footer (`band`, logo putih, "Every step counts. Every stride matters.").
