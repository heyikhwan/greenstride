/**
 * Satu sumber data untuk fakta acara. Ubah di sini bila ketentuan berubah; seluruh halaman ikut berubah.
 */

export const EVENT = {
  name: "PTPN GreenStride 2026",
  tagline: "Run for a healthier you, a stronger Nusantara Entreplanters",

  // Periode lomba dan submit (WIB = UTC+7)
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

  helpdeskUrl: "https://99virtualrace.com/HDPTPN",
  appName: "99 Virtual Race",
  stravaGroup: "PTPN Virtual Running 2026",
} as const;

export const APPS = [
  {
    name: "99 Virtual Race",
    role: "Aplikasi resmi lomba: eBIB, submit, dan peringkat",
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

export const APP_STEPS = [
  {
    title: "Unduh dan daftar 99 Virtual Race",
    body: "Buat akun dengan email yang sama dengan formulir pendaftaran tim. Tidak perlu kode undangan.",
    image: "/img/app-daftar.webp",
    alt: "Formulir pendaftaran akun di aplikasi 99 Virtual Race",
  },
  {
    title: "Hubungkan Strava",
    body: "Pilih Submit, lalu Strava Connect, izinkan semua pilihan, dan nyalakan Auto Submission.",
    image: "/img/app-hubungkan.webp",
    alt: "Halaman Submit dengan pilihan Strava Connect",
  },
  {
    title: "Rekam lari di Strava",
    body: "Pilih Run atau Walk, tunggu tulisan GPS Acquired, lalu tekan Start.",
    image: "/img/app-rekam.webp",
    alt: "Layar rekam aktivitas Strava",
  },
  {
    title: "Simpan untuk Everyone",
    body: "Ubah Who can view menjadi Everyone, lalu Save Activity. Aktivitas otomatis masuk ke 99 Virtual Race.",
    image: "/img/app-simpan.webp",
    alt: "Layar simpan aktivitas Strava dengan Who can view diatur ke Everyone",
  },
  {
    title: "Pantau peringkat tim",
    body: "Buka Ranking, lalu Group Leaderboard. Riwayat submit ada di My Races, Submit Logs.",
    image: "/img/app-ranking.webp",
    alt: "Papan peringkat tim di aplikasi 99 Virtual Race",
  },
] as const;

export type ScheduleEntry = { date: string; title: string; body: string; from?: string; to?: string };

export const SCHEDULE: ScheduleEntry[] = [
  {
    date: "Sampai 18 November 2026",
    title: "Pendaftaran tim",
    body: "Ketua tim melengkapi email pribadi, NIK SAP, dan surat pernyataan bermeterai seluruh anggota.",
    to: "2026-11-18T23:59:59+07:00",
  },
  {
    date: "Sebelum 23 November 2026",
    title: "Siapkan aplikasi",
    body: "Unduh 99 Virtual Race dan Strava, lalu hubungkan keduanya.",
    from: "2026-11-19T00:00:00+07:00",
    to: "2026-11-22T23:59:59+07:00",
  },
  {
    date: "23 November 2026, 00.00 WIB",
    title: "Lomba dimulai",
    body: "Lari atau jalan di luar ruangan mulai dihitung untuk timmu.",
    from: "2026-11-23T00:00:00+07:00",
    to: "2026-12-20T23:59:59+07:00",
  },
  {
    date: "20 Desember 2026, 23.59 WIB",
    title: "Lomba ditutup",
    body: "Batas akhir aktivitas dan submit. Setelah ini panitia melakukan verifikasi final.",
    to: "2026-12-20T23:59:59+07:00",
  },
  {
    date: "Diumumkan panitia",
    title: "Offline race dan awarding di Jakarta",
    body: `Untuk ${EVENT.topTeamsInvited} tim terbaik dan 10 peraih MVP.`,
  },
];

export const DOCUMENTS = [
  {
    title: "Guidebook GreenStride 2026",
    description: "Ketentuan teknis, mekanisme lomba, dan penghargaan.",
    href: "/dokumen/guidebook-greenstride-2026.pdf",
    size: "PDF · 2,2 MB",
  },
  {
    title: "Virtual Running",
    description: "Gambaran acara, tahapan lomba, dan cara perhitungan poin.",
    href: "/dokumen/virtual-running-greenstride-2026.pdf",
    size: "PDF · 7,5 MB",
  },
  {
    title: "User Journey 99 Virtual Race",
    description: "Panduan bergambar dari membuat akun sampai melihat peringkat.",
    href: "/dokumen/user-journey-99-virtual-race.pdf",
    size: "PDF · 42 MB",
  },
] as const;
