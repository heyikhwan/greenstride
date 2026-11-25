/**
 * Satu sumber data untuk fakta acara. Ubah di sini bila ketentuan berubah; seluruh halaman ikut berubah.
 */

export const EVENT = {
  name: "PTPN GreenStride 2026",
  tagline: "Run for a healthier you, a stronger Nusantara Entreplanters",

  // Periode event dan submit (WIB = UTC+7)
  raceStart: "2026-11-23T00:00:00+07:00",
  raceEnd: "2026-12-20T23:59:59+07:00",
  raceRangeLabel: "23 November – 20 Desember 2026",
  raceDays: 28,

  teamMax: 5,
  teamsPerUnit: 2,
  teamTargetKm: 300,
  memberMinKm: 60,
  dailyMaxKm: 24,
  dailySubmitMax: 2,
  paceFast: "5:00",
  paceSlow: "15:00",
  topTeamsInvited: 50,
  offlineRaceLabel: "Januari 2027",

  // Hadiah uang tunai (rupiah)
  prizes: [
    { rank: "Juara I", amount: 30_000_000 },
    { rank: "Juara II", amount: 25_000_000 },
    { rank: "Juara III", amount: 20_000_000 },
    { rank: "Harapan I", amount: 15_000_000 },
    { rank: "Harapan II", amount: 10_000_000 },
    { rank: "Harapan III", amount: 5_000_000 },
  ],
  mvpCount: 10,
  mvpPrize: 1_000_000,

  helpdeskUrl: "https://99virtualrace.com/HDPTPN",
  appName: "99 Virtual Race",
} as const;

/** Data yang perlu disiapkan sebelum melapor ke Help Desk (bagian Bantuan dan asisten chat). */
export const HELPDESK_CHECKLIST = ["Nama lengkap", "Unit kerja", "Nama tim", "Waktu kejadian", "Tangkapan layar aplikasi"] as const;

/** Akun Instagram yang diajak diikuti di footer. */
export const SOCIALS = [
  { name: "Holding Perkebunan", handle: "holdingperkebunan", href: "https://www.instagram.com/holdingperkebunan/" },
  { name: "Life at PTPN", handle: "lifeatptpn", href: "https://www.instagram.com/lifeatptpn/" },
  { name: "Planters Club", handle: "plantersclubptpn", href: "https://www.instagram.com/plantersclubptpn/" },
] as const;

/** Rp30.000.000 */
export const rupiah = (n: number) => `Rp${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export const APPS = [
  {
    name: "99 Virtual Race",
    role: "Aplikasi resmi event: eBIB, submit, dan peringkat",
    icon: "/img/icon-99-virtual-race.png",
    appStore: "https://apps.apple.com/id/app/99-virtual-race/id6686407581",
    playStore: "https://play.google.com/store/apps/details?id=id.app99virtualrace.mobile",
  },
  {
    name: "Strava",
    role: "Merekam lari dan jalan dengan GPS",
    icon: "/img/icon-strava.png",
    appStore: "https://apps.apple.com/us/app/strava-run-bike-walk/id426826309",
    playStore: "https://play.google.com/store/apps/details?id=com.strava&hl=id",
  },
] as const;

/**
 * Layar tiap langkah diambil utuh dari dokumen User Journey 99 Virtual Race (public/dokumen),
 * termasuk kotak merah penanda tombolnya. Semua 720 × 1558 px.
 */
export type AppShot = { image: string; alt: string; text: string };
export type AppStep = { title: string; body: string; shots: AppShot[] };

const shot = (file: string, alt: string, text: string): AppShot => ({ image: `/img/cara/${file}.webp`, alt, text });

export const APP_STEPS: AppStep[] = [
  {
    title: "Unduh dan daftar 99 Virtual Race",
    body: "Buat akun dengan email yang sama dengan formulir pendaftaran tim. Tidak perlu kode undangan.",
    shots: [
      shot("daftar-1", "Halaman login 99 Virtual Race", "Unduh 99 Virtual Race, buka aplikasinya, lalu ketuk Join Us. Sudah punya akun? Langsung masuk dengan email dan password."),
      shot("daftar-2", "Formulir pendaftaran akun, bagian atas", "Isi semua data dengan benar. Pakai email yang sama dengan formulir pendaftaran tim."),
      shot("daftar-3", "Formulir pendaftaran akun, bagian bawah dengan tombol Register", "Gulir ke bawah, centang persetujuan Terms & Conditions dan Privacy Policy, lalu ketuk Register."),
      shot(
        "daftar-4",
        "Halaman My Races berisi event PTPN GreenStride 2026",
        "Event tidak perlu didaftarkan sendiri. Panitia memprosesnya dari formulir tim dan mengirim konfirmasi ke emailmu. Setelah itu, PTPN GreenStride 2026 muncul di My Races.",
      ),
      shot("daftar-5", "Halaman event dengan menu eBib ditandai", "Buka event tersebut, lalu ketuk eBib."),
      shot("daftar-6", "eBIB peserta dengan tombol Download Image", "Ketuk Download Image untuk menyimpan eBIB, nomor kepesertaanmu."),
    ],
  },
  {
    title: "Hubungkan Strava",
    body: "Pilih Submit, lalu Strava Connect, izinkan semua pilihan, dan nyalakan Auto Submission.",
    shots: [
      shot("strava-1", "Beranda 99 Virtual Race dengan menu Submit ditandai", "Di beranda, ketuk Submit di menu bawah. Selesaikan langkah ini sebelum lari pertama."),
      shot("strava-2", "Halaman Submit dengan Strava Connect ditandai", "Pilih Strava Connect."),
      shot("strava-3", "Halaman masuk Strava", "Masuk dengan email dan password akun Strava yang biasa kamu pakai, lalu ketuk Log In."),
      shot("strava-4", "Halaman izin Strava dengan semua pilihan dicentang", "Pastikan semua pilihan dicentang agar data tersinkron, lalu ketuk Authorize."),
      shot("strava-5", "Halaman bertuliskan Strava is connected", "Muncul tulisan Strava is connected. Tutup halaman ini dan kembali ke 99 Virtual Race."),
      shot("strava-6", "Halaman Submit dengan Auto Submission ditandai", "Di halaman Submit, ketuk Auto Submission."),
      shot("strava-7", "Halaman Auto Submission dengan Strava Connect menyala", "Pastikan tombol di samping Strava Connect menyala merah. Mulai sekarang, lari yang disimpan di Strava otomatis tersubmit."),
    ],
  },
  {
    title: "Rekam lari di Strava",
    body: "Pilih Run atau Walk, tunggu tulisan GPS Acquired, lalu tekan Start.",
    shots: [
      shot("rekam-1", "Beranda Strava dengan tab Workout ditandai", "Buka Strava, lalu ketuk tab Workout di menu bawah."),
      shot("rekam-2", "Pilihan olahraga Run dan Walk di Strava", "Pilih Run atau Walk, lalu ketuk Start."),
      shot("rekam-3", "Layar rekam Strava bertuliskan GPS Acquired", "Pastikan tulisan GPS Acquired muncul di atas layar. Ketuk Pause saat selesai berlari."),
      shot("rekam-4", "Layar jeda Strava dengan tombol Finish ditandai", "Ketuk Finish untuk mengakhiri aktivitas."),
    ],
  },
  {
    title: "Simpan untuk Everyone",
    body: "Ubah Who can view menjadi Everyone, lalu Save Activity. Aktivitas otomatis masuk ke 99 Virtual Race.",
    shots: [
      shot("simpan-1", "Halaman Save Activity dengan kolom nama aktivitas", "Beri nama aktivitas kalau mau (boleh dilewati), lalu gulir ke bawah."),
      shot(
        "simpan-2",
        "Pilihan Who can view diatur ke Everyone dan tombol Save Activity",
        "Ubah Who can view menjadi Everyone agar data tidak dihapus saat verifikasi, lalu ketuk Save Activity. Aktivitas otomatis masuk ke 99 Virtual Race.",
      ),
    ],
  },
  {
    title: "Pantau peringkat tim",
    body: "Buka Ranking, lalu Group Leaderboard. Riwayat submit ada di My Races, Submit Logs.",
    shots: [
      shot("ranking-1", "Beranda 99 Virtual Race dengan menu Ranking ditandai", "Di beranda 99 Virtual Race, ketuk Ranking."),
      shot("ranking-2", "Halaman Ranking dengan tombol Group Leaderboard ditandai", "Ketuk Group Leaderboard untuk melihat peringkat tim. Filter gender dan kategori ada di atasnya."),
      shot("ranking-3", "Papan peringkat tim dengan satu nama tim ditandai", "Ketuk nama tim untuk melihat siapa saja anggotanya."),
      shot("ranking-4", "Halaman event dengan menu Submit Logs ditandai", "Riwayat submit ada di My Races. Buka event GreenStride, lalu ketuk Submit Logs."),
      shot("ranking-5", "Daftar aktivitas yang berhasil tersubmit", "Semua lari yang berhasil tersubmit tampil di sini."),
    ],
  },
];

/** chip: tanggal besar di linimasa (pre kecil di atas, day besar, month di bawah). */
export type ScheduleEntry = { date: string; title: string; body: string; from?: string; to?: string; chip: { pre?: string; day?: string; month: string } };

export const SCHEDULE: ScheduleEntry[] = [
  {
    date: "9 – 18 November 2026",
    title: "Pendaftaran tim",
    body: "Tim mendaftar melalui google form, setiap anggota melengkapi email, NIK SAP, No HP, serta melampirkan surat pernyataan bermeterai.",
    from: "2026-11-09T00:00:00+07:00",
    to: "2026-11-18T23:59:59+07:00",
    chip: { pre: "9 Nov", day: "10", month: "hari" },
  },
  {
    date: "19 – 20 November 2026",
    title: "Verifikasi data peserta",
    body: "Panitia memeriksa data peserta dan tim yang sudah terdaftar.",
    from: "2026-11-19T00:00:00+07:00",
    to: "2026-11-20T23:59:59+07:00",
    chip: { pre: "19 Nov", day: "2", month: "hari" },
  },
  {
    date: "20 November 2026",
    title: "Technical meeting",
    body: "Penjelasan teknis event untuk seluruh ketua tim.",
    from: "2026-11-20T00:00:00+07:00",
    to: "2026-11-20T23:59:59+07:00",
    chip: { pre: "20 Nov", day: "1", month: "hari" },
  },
  {
    date: "23 November, 00.00 WIB – 20 Desember 2026, 23.59 WIB",
    title: "Kick Off PTPN GreenStride 2026",
    body: "Lari atau jalan di luar ruangan, perekaman melalui Strava, submit maksimal 2 kali sehari.",
    from: "2026-11-23T00:00:00+07:00",
    to: "2026-12-20T23:59:59+07:00",
    chip: { pre: "23 Nov", day: "28", month: "hari" },
  },
  {
    date: "Januari 2027",
    title: "Penyerahan hadiah dan Apresiasi serta Race Offline",
    body: `Untuk ${EVENT.topTeamsInvited} tim terbaik, peraih juara, dan peraih MVP.`,
    from: "2027-01-01T00:00:00+07:00",
    to: "2027-01-31T23:59:59+07:00",
    chip: { pre: "", day: "Jan", month: "2027" },
  },
];

export type DocumentEntry = { title: string; description: string; href: string; size: string; note?: string };

export const DOCUMENTS: DocumentEntry[] = [
  {
    title: "Guidebook GreenStride 2026",
    description: "Mekanisme dan tahapan event, cara perhitungan poin, dan penghargaan.",
    href: "/dokumen/virtual-running-greenstride-2026.pdf",
    size: "PDF · 7,5 MB",
  },
  {
    title: "User Journey 99 Virtual Race",
    description: "Panduan bergambar dari membuat akun sampai melihat peringkat.",
    href: "/dokumen/user-journey-99-virtual-race.pdf",
    size: "PDF · 42 MB",
  },
  {
    title: "Ketentuan Pelanggaran dan Sanksi",
    description: "Aktivitas yang sah, kategori pelanggaran, jenis sanksi, prosedur pemeriksaan, dan cara melapor.",
    href: "/dokumen/ketentuan-pelanggaran-sanksi-greenstride-2026.pdf",
    size: "PDF · 257 KB",
  },
];
